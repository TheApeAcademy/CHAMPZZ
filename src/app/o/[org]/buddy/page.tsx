import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { Card, Pill } from "@/components/ui/primitives";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Champ Buddy log" };

export default async function BuddyLogPage({ params }: PageProps<"/o/[org]/buddy">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: msgs } = await supabase.from("ai_messages").select("id, role, body, flagged, created_at, kid_id, kids!inner(first_name, last_initial)")
    .eq("organization_id", org.id).order("id", { ascending: false }).limit(200);
  const flagged = (msgs ?? []).filter((m) => m.flagged);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="buddy" />
      <h1 className="font-display text-3xl font-extrabold">Champ Buddy log</h1>
      <p className="max-w-2xl text-sm text-muted">Every Champ Buddy chat is kept here for your team, and for each child&apos;s parents. Messages that sounded like a child needing help were never sent to the AI: the child was pointed to a trusted adult and Talk to Someone, and they are flagged below.</p>
      {flagged.length ? (
        <Card>
          <h2 className="mb-2 text-lg font-extrabold">Needs a look</h2>
          <ul className="flex flex-col gap-2" data-testid="buddy-flagged">
            {flagged.map((m) => (
              <li key={m.id} className="rounded-[12px] bg-[#FCEBC4] p-3 text-sm"><strong>{m.kids.first_name}{m.kids.last_initial ? ` ${m.kids.last_initial}.` : ""}</strong>: {m.body}
                <span className="block text-xs text-muted">{new Date(m.created_at).toLocaleString("en-GB")}</span></li>
            ))}
          </ul>
        </Card>
      ) : null}
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="buddy-log">
          {(msgs ?? []).map((m) => (
            <li key={m.id} className="flex flex-col gap-1 py-2 text-sm">
              <span className="flex items-center gap-2 font-bold">{m.role === "kid" ? `${m.kids.first_name}${m.kids.last_initial ? ` ${m.kids.last_initial}.` : ""}` : "Champ Buddy"}{m.flagged ? <Pill tone="warn">flagged</Pill> : null}</span>
              <span className="whitespace-pre-wrap">{m.body}</span>
            </li>
          ))}
          {(msgs ?? []).length === 0 ? <li className="py-2 text-sm text-muted">No chats yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}
