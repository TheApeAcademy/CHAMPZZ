import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Search" };

export default async function SearchPage({ params, searchParams }: PageProps<"/o/[org]/search">) {
  const { org: slug } = await params;
  const { q: raw } = await searchParams;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  // keep only letters, numbers, spaces and hyphens: no wildcards or filter syntax reach the query
  const q = (typeof raw === "string" ? raw : "").normalize("NFKC").replace(/[^\p{L}\p{N} -]/gu, "").trim().slice(0, 40);
  const supabase = await supabaseServer();
  const like = `%${q}%`;
  const [kids, lessons, work, events] = q.length < 2 ? [null, null, null, null] : await Promise.all([
    supabase.from("kids").select("id, first_name, last_initial, username, status").eq("organization_id", org.id).or(`first_name.ilike.${like},username.ilike.${like}`).limit(20),
    supabase.from("lessons").select("id, title").eq("organization_id", org.id).ilike("title", like).limit(10),
    supabase.from("assignments").select("id, title").eq("organization_id", org.id).ilike("title", like).limit(10),
    supabase.from("events").select("id, title").eq("organization_id", org.id).ilike("title", like).limit(10),
  ]);
  const section = (title: string, items: { key: string; href: string; label: string; sub?: string }[]) => (
    <Card>
      <h2 className="mb-2 text-lg font-extrabold">{title}</h2>
      <ul className="flex flex-col gap-1">
        {items.map((i) => <li key={i.key}><Link className="font-bold underline" href={i.href}>{i.label}</Link>{i.sub ? <span className="text-sm text-muted"> · {i.sub}</span> : null}</li>)}
        {items.length === 0 ? <li className="text-sm text-muted">Nothing found.</li> : null}
      </ul>
    </Card>
  );
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="search" />
      <h1 className="font-display text-3xl font-extrabold">Search</h1>
      <form role="search" className="flex gap-2">
        <label className="sr-only" htmlFor="q">Search kids, lessons, class work and events</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search kids, lessons, class work, events" maxLength={40}
          className="min-h-11 flex-1 rounded-[12px] border border-line bg-surface px-3" />
        <button type="submit" className="min-h-11 rounded-full bg-brand px-5 font-extrabold text-white">Search</button>
      </form>
      {q.length >= 2 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="search-results">
          {section("Kids", (kids?.data ?? []).map((k) => ({ key: k.id, href: `/o/${slug}/messages/${k.id}`, label: `${k.first_name}${k.last_initial ? ` ${k.last_initial}.` : ""}`, sub: k.username })))}
          {section("Lessons", (lessons?.data ?? []).map((l) => ({ key: l.id, href: `/o/${slug}/lessons`, label: l.title })))}
          {section("Class work", (work?.data ?? []).map((a) => ({ key: a.id, href: `/o/${slug}/assignments/${a.id}`, label: a.title })))}
          {section("Events", (events?.data ?? []).map((e) => ({ key: e.id, href: `/o/${slug}/events`, label: e.title })))}
        </div>
      ) : q ? <p className="text-sm text-muted">Type at least 2 letters.</p> : null}
    </AdultShell>
  );
}
