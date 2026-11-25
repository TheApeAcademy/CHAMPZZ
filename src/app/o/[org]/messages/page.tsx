import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Messages" };

export default async function StaffMessagesPage({ params }: PageProps<"/o/[org]/messages">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const [{ data: kids }, { data: msgs }] = await Promise.all([
    supabase.from("kids").select("id, first_name, last_initial, confirmed_at").eq("organization_id", org.id).eq("status", "active").order("first_name"),
    supabase.from("messages").select("kid_id, body, from_staff, created_at").eq("organization_id", org.id).order("created_at", { ascending: false }).limit(500),
  ]);
  const latest = new Map<string, { body: string; from_staff: boolean; created_at: string }>();
  for (const m of msgs ?? []) if (!latest.has(m.kid_id)) latest.set(m.kid_id, m);
  const sorted = [...(kids ?? [])].sort((a, b) => (latest.get(b.id)?.created_at ?? "").localeCompare(latest.get(a.id)?.created_at ?? ""));
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="messages" />
      <h1 className="font-display text-3xl font-extrabold">Messages</h1>
      <p className="text-sm text-muted">One thread per kid, visible to every teacher and admin in your club. No hidden one-to-one chats.</p>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="thread-list">
          {sorted.map((k) => {
            const m = latest.get(k.id);
            return (
              <li key={k.id} className="flex flex-col gap-0.5 py-3">
                <Link href={`/o/${slug}/messages/${k.id}`} className="font-extrabold underline">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</Link>
                <span className="text-sm text-muted">{m ? `${m.from_staff ? "Staff: " : ""}${m.body.slice(0, 80)}` : "No messages yet"}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </AdultShell>
  );
}
