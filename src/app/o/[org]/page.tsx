import Link from "next/link";
import { notFound } from "next/navigation";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Card, Field, Pill, Select, buttonClass } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { addClass, approveKid, confirmKid, giveStar, regenerateJoinCode, resetKidPin, updateRegistration } from "@/features/org/server/actions";
import { startCheckout } from "@/features/billing/server/actions";
import { assignTeacher } from "@/features/classlife/server/actions";
import { StaffNav } from "@/components/staff-nav";
import { PicturePin } from "@/features/kids/components/picture-pin";
import { env } from "@/lib/env";

export const metadata = { title: "Your club" };

function money(minor: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

export default async function OrgPage({ params, searchParams }: PageProps<"/o/[org]">) {
  const { org: slug } = await params;
  const { paid } = await searchParams;
  const { viewer, org, roles } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const isAdmin = roles.includes("org_admin");
  const supabase = await supabaseServer();

  const [{ data: details }, { data: classes }, { data: kids }, { data: code }, { data: sub }, { data: prices }] = await Promise.all([
    supabase.from("organizations").select("registration_mode, joining_paused, joining_paused_reason, billing_currency").eq("id", org.id).single(),
    supabase.from("classes").select("id, name, age_band, class_teachers(user_id)").eq("organization_id", org.id).eq("archived", false).order("name"),
    supabase
      .from("kids")
      .select("id, first_name, last_initial, username, status, confirmed_at, created_at, classes(name), kid_stats(points_total, streak_current)")
      .eq("organization_id", org.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
    supabase.from("join_codes").select("code").eq("organization_id", org.id).eq("active", true).maybeSingle(),
    isAdmin
      ? supabase.from("subscriptions").select("current_period_end, grace_until, kid_limit_override, plans(name, kid_limit)").eq("organization_id", org.id).maybeSingle()
      : Promise.resolve({ data: null }),
    isAdmin
      ? supabase.from("plan_prices").select("id, currency, billing_interval, amount_minor, plans!inner(name, kid_limit, sort, active)").eq("active", true)
      : Promise.resolve({ data: null }),
  ]);
  if (!details) notFound();
  const { data: teachers } = isAdmin
    ? await supabase.from("memberships").select("user_id").eq("organization_id", org.id).eq("role", "teacher").eq("status", "active")
    : { data: [] as { user_id: string }[] };
  const { data: teacherProfiles } = teachers && teachers.length
    ? await supabase.from("profiles").select("id, full_name").in("id", teachers.map((t) => t.user_id))
    : { data: [] as { id: string; full_name: string }[] };
  const teacherName = new Map((teacherProfiles ?? []).map((p) => [p.id, p.full_name || "Teacher"]));
  const e = env();
  const bank = e.OFFLINE_BANK_NAME && e.OFFLINE_ACCOUNT_NUMBER && e.OFFLINE_ACCOUNT_NAME
    ? { name: e.OFFLINE_BANK_NAME, number: e.OFFLINE_ACCOUNT_NUMBER, accountName: e.OFFLINE_ACCOUNT_NAME }
    : null;

  const active = (kids ?? []).filter((k) => k.status === "active").length;
  const limit = sub ? (sub.kid_limit_override ?? sub.plans?.kid_limit ?? 0) : 0;
  const payable = (prices ?? [])
    .filter((p) => p.currency === details.billing_currency && p.plans.active)
    .sort((a, b) => a.plans.sort - b.plans.sort);

  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="" />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-muted">{isAdmin ? "Org Admin" : "Teacher"}</p>
          <h1 className="font-display text-3xl font-extrabold" data-testid="org-name">{org.name}</h1>
        </div>
        <Pill tone={org.status === "active" ? "ok" : org.status === "pending" ? "new" : "warn"}>
          <span data-testid="org-status">{org.status}</span>
        </Pill>
      </div>

      {paid === "1" && org.status === "active" ? <Banner tone="ok">Payment received. Your club is active.</Banner> : null}
      {org.status === "pending" ? (
        <Banner tone="warn">Your club is set up but not active yet. Choose a plan to unlock teachers, parents and kids.</Banner>
      ) : null}
      {org.status === "grace" ? <Banner tone="warn">Your plan has ended. Everything still works for a few days. Renew now to avoid read-only mode.</Banner> : null}
      {org.status === "read_only" ? <Banner tone="error">Your club is read-only. Nothing has been deleted. Renew to switch everything back on.</Banner> : null}

      {isAdmin && org.status !== "active" && org.status !== "suspended" ? (
        <Card>
          <h2 className="mb-3 text-lg font-extrabold">Choose a plan</h2>
          {!e.FLUTTERWAVE_SECRET_KEY ? (
            <div className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {payable.map((p) => (
                  <div key={p.id} className="flex flex-col gap-1 rounded-[16px] border-2 border-line p-4">
                    <span className="font-display text-xl font-extrabold">{p.plans.name}</span>
                    <span className="font-bold">{money(p.amount_minor, p.currency)} / {p.billing_interval}</span>
                    <span className="text-sm text-muted">{p.plans.kid_limit ? `Up to ${p.plans.kid_limit} kids` : "Custom"}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted" data-testid="card-coming-soon">Card payments are coming soon. Pay for your plan by bank transfer below and we will activate your club as soon as it arrives.</p>
            </div>
          ) : payable.length === 0 ? (
            <p className="text-sm text-muted">No online prices in {details.billing_currency} yet. Contact Champzz to pay offline.</p>
          ) : (
            <ActionForm action={startCheckout.bind(null, slug)} className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-3">
                {payable.map((p, i) => (
                  <label key={p.id} className="flex cursor-pointer flex-col gap-1 rounded-[16px] border-2 border-line p-4 has-[:checked]:border-brand">
                    <input type="radio" name="priceId" value={p.id} defaultChecked={i === 0} className="sr-only" />
                    <span className="font-display text-xl font-extrabold">{p.plans.name}</span>
                    <span className="font-bold">{money(p.amount_minor, p.currency)} / {p.billing_interval}</span>
                    <span className="text-sm text-muted">{p.plans.kid_limit ? `Up to ${p.plans.kid_limit} kids` : "Custom"}</span>
                  </label>
                ))}
              </div>
              <div><Submit>Pay online</Submit></div>
            </ActionForm>
          )}
        </Card>
      ) : null}

      {isAdmin && bank && org.status !== "active" && org.status !== "suspended" ? (
        <Card>
          <h2 className="mb-2 text-lg font-extrabold">Pay by bank transfer</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm" data-testid="bank-details">
            <dt className="font-bold text-muted">Bank</dt><dd className="font-extrabold">{bank.name}</dd>
            <dt className="font-bold text-muted">Account number</dt><dd className="font-extrabold tracking-wider">{bank.number}</dd>
            <dt className="font-bold text-muted">Account name</dt><dd className="font-extrabold">{bank.accountName}</dd>
            <dt className="font-bold text-muted">Reference</dt><dd className="font-extrabold">{slug}</dd>
          </dl>
          <p className="mt-2 text-sm text-muted">Use your club address ({slug}) as the transfer reference. We activate your club as soon as the payment arrives.</p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-bold text-muted">Active kids</p>
          <p className="font-display text-3xl font-extrabold" data-testid="kid-count">{active}{isAdmin && sub ? <span className="text-lg text-muted"> / {limit}</span> : null}</p>
          {isAdmin && sub && active >= limit ? <p className="mt-2 text-sm font-bold text-danger" data-testid="upgrade-prompt">You have reached your kid limit. Upgrade your plan to add more.</p> : null}
        </Card>
        {isAdmin && sub ? (
          <Card>
            <p className="text-sm font-bold text-muted">Plan</p>
            <p className="font-display text-2xl font-extrabold">{sub.plans?.name}</p>
            <p className="text-sm text-muted">Paid until {new Date(sub.current_period_end).toLocaleDateString("en-GB")}</p>
          </Card>
        ) : null}
        {code ? (
          <Card>
            <p className="text-sm font-bold text-muted">Join code</p>
            <p className="font-display text-2xl font-extrabold tracking-widest" data-testid="join-code">{code.code}</p>
            <p className="text-sm text-muted">Parents enter it on your <Link className="font-extrabold text-brand underline" href={`/c/${slug}`}>Clubhouse page</Link>.</p>
            {isAdmin ? (
              <form action={regenerateJoinCode.bind(null, slug)} className="mt-3">
                <Submit variant="outline">New code</Submit>
              </form>
            ) : null}
          </Card>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-lg font-extrabold">Classes</h2>
            <ul className="mb-4 flex flex-col gap-1" data-testid="class-list">
              {(classes ?? []).map((c) => (
                <li key={c.id} className="flex flex-wrap justify-between gap-x-2"><span className="font-bold">{c.name}</span><span className="text-sm text-muted">{c.age_band === "little" ? "Little Champs (4 to 8)" : "Champ (9 to 14)"}</span>
                  <span className="w-full text-xs text-muted">Teachers: {c.class_teachers.length ? c.class_teachers.map((ct) => teacherName.get(ct.user_id) ?? "Teacher").join(", ") : "none yet"}</span></li>
              ))}
              {(classes ?? []).length === 0 ? <li className="text-sm text-muted">No classes yet.</li> : null}
            </ul>
            <ActionForm action={addClass.bind(null, slug)} className="flex flex-col gap-3">
              <Field label="New class name" name="name" required maxLength={60} />
              <Select label="Age band" name="ageBand" defaultValue="champ">
                <option value="little">Little Champs (4 to 8)</option>
                <option value="champ">Champ (9 to 14)</option>
              </Select>
              <div><Submit variant="outline">Add class</Submit></div>
            </ActionForm>
            {(classes ?? []).length && (teachers ?? []).length ? (
              <ActionForm action={assignTeacher.bind(null, slug)} className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
                <p className="text-sm text-muted">Teachers of a class receive its Talk to Someone messages and handle its kids.</p>
                <Select label="Class" name="classId">{(classes ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
                <Select label="Teacher" name="userId">{(teachers ?? []).map((tch) => <option key={tch.user_id} value={tch.user_id}>{teacherName.get(tch.user_id)}</option>)}</Select>
                <div><Submit variant="outline">Add teacher to class</Submit></div>
              </ActionForm>
            ) : null}
          </Card>
          <Card>
            <h2 className="mb-3 text-lg font-extrabold">Joining</h2>
            <ActionForm action={updateRegistration.bind(null, slug)} className="flex flex-col gap-3">
              <Select label="How kids join" name="mode" defaultValue={details.registration_mode}>
                <option value="open">Open: a verified parent with the code adds their kid</option>
                <option value="approval">Approval: every new kid waits for you</option>
              </Select>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="paused" defaultChecked={details.joining_paused} className="h-5 w-5" /> Pause joining
              </label>
              {details.joining_paused_reason === "spike" ? <Banner tone="warn">Joining paused itself after a sudden rush of sign-ups. Check the list below, then unpause.</Banner> : null}
              <div><Submit variant="outline">Save</Submit></div>
            </ActionForm>
          </Card>
        </div>
      ) : null}

      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Kids</h2>
        {(kids ?? []).length === 0 ? <p className="text-sm text-muted">No kids yet.</p> : null}
        <ul className="flex flex-col divide-y divide-line" data-testid="kid-list">
          {(kids ?? []).map((k) => (
            <li key={k.id} className="flex flex-col gap-2 py-3" data-testid={`kid-${k.username}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</span>
                <span className="text-sm text-muted">{k.username}</span>
                {k.classes?.name ? <span className="text-sm text-muted">· {k.classes.name}</span> : null}
                {k.status === "pending" ? <Pill tone="warn">Waiting for approval</Pill> : k.confirmed_at ? <Pill tone="ok">Confirmed</Pill> : <Pill tone="new">New</Pill>}
                <span className="text-sm font-bold" data-testid="kid-points">{k.kid_stats?.[0]?.points_total ?? 0} pts</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {k.status === "pending" ? (
                  <ActionForm action={approveKid.bind(null, slug, k.id)} className="flex flex-col gap-2"><Submit variant="outline">Approve</Submit></ActionForm>
                ) : null}
                {k.status === "active" ? (
                  <ActionForm action={giveStar.bind(null, slug, k.id)} className="flex flex-col gap-2"><Submit variant="outline">Give a star</Submit></ActionForm>
                ) : null}
                {k.status === "active" && !k.confirmed_at ? (
                  <ActionForm action={confirmKid.bind(null, slug, k.id)} className="flex flex-col gap-2"><Submit variant="outline">Confirm</Submit></ActionForm>
                ) : null}
                <details className="w-full max-w-sm">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm font-extrabold underline">Reset picture PIN</summary>
                  <ActionForm action={resetKidPin.bind(null, slug, k.id)} className="flex flex-col gap-3 pt-2">
                    <PicturePin />
                    <div><Submit variant="outline">Set new PIN</Submit></div>
                  </ActionForm>
                </details>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <p className="text-sm"><a className={buttonClass("ghost")} href={`/k/${slug}`}>Kid sign-in page</a></p>
    </AdultShell>
  );
}
