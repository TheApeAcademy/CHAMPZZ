import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { changeRole, createInvite, removeMember, revokeInvite } from "@/features/admin/server/actions";
import { decideTeacherRequest } from "@/features/clubs/server/actions";

export const metadata = { title: "Team" };

export default async function TeamPage({ params }: PageProps<"/o/[org]/team">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin"]);
  const supabase = await supabaseServer();
  const [{ data: members }, { data: invites }, { data: requests }] = await Promise.all([
    supabase.rpc("team_members", { p_org: org.id }),
    supabase.from("team_invites").select("id, role, email, created_at, expires_at, accepted_at, revoked_at").eq("organization_id", org.id).order("created_at", { ascending: false }).limit(30),
    supabase.rpc("teacher_requests_for", { p_org: org.id }),
  ]);
  const now = new Date().toISOString();
  const state = (i: NonNullable<typeof invites>[number]) =>
    i.accepted_at ? "joined" : i.revoked_at ? "cancelled" : i.expires_at < now ? "expired" : "open";
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="team" />
      <h1 className="font-display text-3xl font-extrabold">Team</h1>
      {(requests ?? []).length > 0 ? (
        <Card>
          <h2 className="mb-1 text-lg font-extrabold">Asking to teach</h2>
          <p className="mb-3 text-sm text-muted">They found your club and asked to join as a teacher. Only approve people you know.</p>
          <ul className="flex flex-col gap-3" data-testid="teacher-requests">
            {(requests ?? []).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line p-3">
                <div>
                  <p className="font-extrabold">{r.full_name || r.email}</p>
                  <p className="text-sm text-muted">{r.email}{r.note ? ` · "${r.note}"` : ""}</p>
                </div>
                <div className="flex gap-2">
                  <ActionForm action={decideTeacherRequest.bind(null, slug, r.id, true)}><Submit>Approve</Submit></ActionForm>
                  <ActionForm action={decideTeacherRequest.bind(null, slug, r.id, false)}><Submit variant="outline">Decline</Submit></ActionForm>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <Card>
        <h2 className="mb-1 text-lg font-extrabold">Invite someone</h2>
        <p className="mb-3 text-sm text-muted">You get a private link to send them. It works once, for 7 days. They sign in or create an account, then join.</p>
        <ActionForm action={createInvite.bind(null, slug)} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Select label="Role" name="role" defaultValue="teacher">
            <option value="teacher">Teacher</option>
            <option value="org_admin">Org Admin (can manage everything)</option>
          </Select>
          <Field label="Their email (optional, a note for you)" name="email" type="email" maxLength={254} />
          <Submit>Create invite link</Submit>
        </ActionForm>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">People</h2>
        <ul className="flex flex-col divide-y divide-line" data-testid="team-list">
          {(members ?? []).map((m) => (
            <li key={m.membership_id} className="flex flex-col gap-2 py-3" data-testid={`member-${m.email}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold">{m.full_name || m.email}</span>
                <span className="text-sm text-muted">{m.email}</span>
                <Pill tone={m.role === "org_admin" ? "ok" : "neutral"}>{m.role === "org_admin" ? "Org Admin" : "Teacher"}</Pill>
                {m.is_me ? <Pill tone="new">You</Pill> : null}
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <ActionForm action={changeRole.bind(null, slug, m.membership_id)} className="flex flex-wrap items-end gap-2">
                  <Select label="Change role" name="role" defaultValue={m.role === "org_admin" ? "teacher" : "org_admin"}>
                    <option value="teacher">Teacher</option>
                    <option value="org_admin">Org Admin</option>
                  </Select>
                  <Submit variant="outline">Save role</Submit>
                </ActionForm>
                <details>
                  <summary className="min-h-11 cursor-pointer py-2 text-sm font-extrabold underline">Remove from team</summary>
                  <ActionForm action={removeMember.bind(null, slug, m.membership_id)} className="flex flex-col gap-2 pt-2">
                    <p className="text-sm">They will lose access to this club straight away.</p>
                    <div><Submit variant="danger">Yes, remove</Submit></div>
                  </ActionForm>
                </details>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Invites</h2>
        <ul className="flex flex-col divide-y divide-line" data-testid="invite-list">
          {(invites ?? []).map((i) => (
            <li key={i.id} className="flex flex-wrap items-center gap-2 py-3">
              <span className="font-bold">{i.role === "org_admin" ? "Org Admin" : "Teacher"}</span>
              {i.email ? <span className="text-sm text-muted">{i.email}</span> : null}
              <Pill tone={state(i) === "open" ? "warn" : state(i) === "joined" ? "ok" : "neutral"}>{state(i)}</Pill>
              {state(i) === "open" ? (
                <form action={revokeInvite.bind(null, slug, i.id)} className="ml-auto"><button type="submit" className="min-h-11 text-sm font-extrabold underline">Cancel invite</button></form>
              ) : null}
            </li>
          ))}
          {(invites ?? []).length === 0 ? <li className="py-3 text-sm text-muted">No invites yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}
