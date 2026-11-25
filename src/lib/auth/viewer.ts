import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type OrgRole = Database["public"]["Enums"]["org_role"];
export type OrgStatus = Database["public"]["Enums"]["org_status"];

export type OrgSummary = { id: string; slug: string; name: string; status: OrgStatus };

export type Viewer =
  | { kind: "anonymous" }
  | {
      kind: "adult";
      userId: string;
      email: string | null;
      emailConfirmed: boolean;
      fullName: string;
      isPlatformAdmin: boolean;
      memberships: { role: OrgRole; org: OrgSummary }[];
    }
  | {
      kind: "kid";
      userId: string;
      kid: { id: string; firstName: string; username: string; confirmed: boolean };
      org: OrgSummary;
    };

/**
 * Who is signed in, resolved once per request. Every read goes through the
 * user's own session, so RLS decides what comes back.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { kind: "anonymous" };

  if (user.app_metadata?.kind === "kid") {
    const { data: kid } = await supabase
      .from("kids")
      .select("id, first_name, username, confirmed_at, organizations!inner(id, slug, name, status)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (!kid) return { kind: "anonymous" };
    const org = kid.organizations;
    return {
      kind: "kid",
      userId: user.id,
      kid: { id: kid.id, firstName: kid.first_name, username: kid.username, confirmed: kid.confirmed_at !== null },
      org: { id: org.id, slug: org.slug, name: org.name, status: org.status },
    };
  }

  const [{ data: profile }, { data: admin }, { data: memberships }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("memberships")
      .select("role, organizations!inner(id, slug, name, status)")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  return {
    kind: "adult",
    userId: user.id,
    email: user.email ?? null,
    emailConfirmed: Boolean(user.email_confirmed_at),
    fullName: profile?.full_name ?? "",
    isPlatformAdmin: Boolean(admin),
    memberships: (memberships ?? []).map((m) => ({
      role: m.role,
      org: { id: m.organizations.id, slug: m.organizations.slug, name: m.organizations.name, status: m.organizations.status },
    })),
  };
});

export async function requireAdult(next?: string) {
  const viewer = await getViewer();
  if (viewer.kind !== "adult") redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return viewer;
}

export async function requirePlatformAdmin() {
  const viewer = await requireAdult("/console");
  if (!viewer.isPlatformAdmin) notFound();
  return viewer;
}

/** The org at `slug` if the viewer holds one of `roles` there; 404 otherwise (never "forbidden", so org slugs don't leak). */
export async function requireOrgRole(slug: string, roles: OrgRole[]) {
  const viewer = await requireAdult(`/o/${slug}`);
  const matches = viewer.memberships.filter((m) => m.org.slug === slug && roles.includes(m.role));
  if (matches.length === 0) notFound();
  return { viewer, org: matches[0]!.org, roles: matches.map((m) => m.role) };
}

/** Where to send an adult after sign-in. */
export function homeFor(viewer: Extract<Viewer, { kind: "adult" }>): string {
  if (viewer.isPlatformAdmin) return "/console";
  const staff = viewer.memberships.find((m) => m.role === "org_admin" || m.role === "teacher");
  if (staff) return `/o/${staff.org.slug}`;
  if (viewer.memberships.some((m) => m.role === "parent")) return "/p";
  return "/p";
}
