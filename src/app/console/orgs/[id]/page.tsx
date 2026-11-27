import { notFound } from "next/navigation";
import { z } from "zod";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Pill, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requirePlatformAdmin } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { markAsPaid, setSuspended } from "@/features/console/server/actions";

export const metadata = { title: "Organization" };

function defaultPaidUntil() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default async function ConsoleOrgPage({ params }: PageProps<"/console/orgs/[id]">) {
  const viewer = await requirePlatformAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const supabase = await supabaseServer();
  const [{ data: org }, { data: plans }, { data: payments }] = await Promise.all([
    supabase.from("organizations").select("id, name, slug, status, billing_currency, subscriptions(current_period_end, plans(name))").eq("id", id).maybeSingle(),
    supabase.from("plans").select("id, name, kid_limit").eq("active", true).order("sort"),
    supabase.from("payments").select("id, provider, method, amount_minor, currency, created_at, approved_at, note").eq("organization_id", id).order("created_at", { ascending: false }),
  ]);
  if (!org) notFound();

  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">{org.name}</h1>
        <Pill tone={org.status === "active" ? "ok" : "warn"}><span data-testid="console-org-status">{org.status}</span></Pill>
      </div>
      <p className="text-sm text-muted">/{org.slug} · {org.subscriptions?.plans?.name ?? "No plan"}{org.subscriptions ? ` · paid until ${new Date(org.subscriptions.current_period_end).toLocaleDateString("en-GB")}` : ""}</p>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Mark as paid</h2>
        <p className="mb-3 text-sm text-muted">For bank transfers and cash. This is recorded with your name and the time.</p>
        <ActionForm action={markAsPaid.bind(null, org.id)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select label="Plan" name="planId" required>
            {(plans ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}{p.kid_limit ? ` (${p.kid_limit} kids)` : ""}</option>)}
          </Select>
          <Select label="Billing" name="interval" defaultValue="month">
            <option value="month">Monthly</option>
            <option value="year">Annual</option>
          </Select>
          <Field label="Paid until" name="periodEnd" type="date" defaultValue={defaultPaidUntil()} required />
          <Select label="Method" name="method" defaultValue="bank_transfer">
            <option value="bank_transfer">Bank transfer</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </Select>
          <Field label="Amount received" name="amount" type="number" min={0} step="0.01" required />
          <Select label="Currency" name="currency" defaultValue={org.billing_currency}>
            {["NGN", "GBP", "USD", "EUR", "CAD"].map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div className="sm:col-span-2"><Field label="Note (optional)" name="note" maxLength={500} /></div>
          <div><Submit>Mark as paid</Submit></div>
        </ActionForm>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold">{org.status === "suspended" ? "Lift suspension" : "Suspend"}</h2>
        <ActionForm action={setSuspended.bind(null, org.id, org.status !== "suspended")} className="flex flex-col gap-3">
          {org.status !== "suspended" ? <Field label="Reason" name="reason" maxLength={300} required /> : null}
          <div><Submit variant={org.status === "suspended" ? "outline" : "danger"}>{org.status === "suspended" ? "Lift suspension" : "Suspend"}</Submit></div>
        </ActionForm>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Payments</h2>
        <ul className="flex flex-col divide-y divide-line">
          {(payments ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
              <span className="font-bold">{new Intl.NumberFormat("en", { style: "currency", currency: p.currency }).format(p.amount_minor / 100)}</span>
              <span>{p.provider} · {p.method}</span>
              <span className="text-muted">{new Date(p.created_at).toLocaleString("en-GB")}</span>
            </li>
          ))}
          {(payments ?? []).length === 0 ? <li className="text-sm text-muted">No payments yet.</li> : null}
        </ul>
      </Card>
    </AdultShell>
  );
}
