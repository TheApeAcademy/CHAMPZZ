import { upcomingSince } from "@/lib/time";
import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { Banner, Card, Field, Pill, buttonClass } from "@/components/ui/primitives";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { PicturePin } from "@/features/kids/components/picture-pin";
import { addHomeKid } from "@/features/registration/server/actions";
import { requireAdult } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "My kids" };

export default async function ParentPage({ searchParams }: PageProps<"/p">) {
  const viewer = await requireAdult("/p");
  const { added } = await searchParams;
  const supabase = await supabaseServer();
  const { data: links } = await supabase
    .from("guardians")
    .select("kid_id, kids!inner(id, first_name, last_initial, username, status, confirmed_at, avatar, organizations!inner(name, slug), kid_stats(points_total, streak_current, streak_best, stars))")
    .eq("user_id", viewer.userId);
  const { data: events } = await supabase
    .from("events")
    .select("id, title, starts_at, location, organizations!inner(name, timezone)")
    .gte("starts_at", upcomingSince())
    .order("starts_at")
    .limit(20);
  const [{ data: pickups }, { data: certs }, { data: files }] = await Promise.all([
    supabase.rpc("my_pickup_codes"),
    supabase.from("certificates").select("id, title, issued_at, kids!inner(first_name)").order("issued_at", { ascending: false }).limit(20),
    supabase.from("media_items").select("id, title, organizations!inner(name)").eq("audience", "families").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <h1 className="font-display text-3xl font-extrabold">My kids</h1>
      {(pickups ?? []).length > 0 ? (
        <section className="flex flex-col gap-2 rounded-[20px] border-2 border-gold bg-[#FFF3D6] p-4" data-testid="pickup-codes">
          <h2 className="font-extrabold">At the club now</h2>
          {(pickups ?? []).map((p) => (
            <p key={p.attendance_id} className="text-lg">
              <strong>{p.first_name}</strong> at {p.club}. Pickup code{" "}
              <span className="rounded-[8px] bg-ink px-2 py-0.5 font-mono text-2xl font-extrabold tracking-[0.2em] text-white" data-testid={`pickup-${p.first_name}`}>{p.pickup_code}</span>
            </p>
          ))}
          <p className="text-sm">Show this code to the teacher when you collect your child. Do not share it with anyone who is not collecting them.</p>
        </section>
      ) : null}
      {typeof added === "string" ? (
        <Banner tone="ok">
          Added. Their username is <strong data-testid="new-username">{added}</strong>. They sign in on the{" "}
          <Link className="underline" href="/login?kid=1">sign-in page</Link> with that username and the 4 pictures you chose.
        </Banner>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-testid="parent-kids">
        {(links ?? []).map(({ kids: k }) => (
          <Card key={k.id}>
            <p className="font-display text-2xl font-extrabold">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</p>
            <p className="text-sm text-muted">{k.organizations.name}</p>
            <p className="mt-2 text-sm">Username: <strong>{k.username}</strong></p>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center" data-testid={`parent-stats-${k.username}`}>
              <div className="rounded-[12px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Champ Points</dt><dd className="font-extrabold">{k.kid_stats?.[0]?.points_total ?? 0}</dd></div>
              <div className="rounded-[12px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Best streak</dt><dd className="font-extrabold">{k.kid_stats?.[0]?.streak_best ?? 0}</dd></div>
              <div className="rounded-[12px] bg-cream p-2"><dt className="text-[11px] font-bold text-muted">Stars</dt><dd className="font-extrabold">{k.kid_stats?.[0]?.stars ?? 0}</dd></div>
            </dl>
            {k.status === "active" ? (
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-extrabold">
                <Link className="underline" href={`/p/kids/${k.id}`} data-testid={`progress-link-${k.username}`}>Progress</Link>
                <Link className="underline" href={`/p/kids/${k.id}/report`}>This week&apos;s report</Link>
              </div>
            ) : null}
            <div className="mt-2">{k.status === "pending" ? <Pill tone="warn">Waiting for the club to approve</Pill> : k.confirmed_at ? <Pill tone="ok">Confirmed</Pill> : <Pill tone="new">New: confirmed at first visit</Pill>}</div>
          </Card>
        ))}
        {(links ?? []).length === 0 ? <p className="text-sm text-muted">No kids yet. Add one below, or open your club&apos;s Clubhouse page to add them to a club.</p> : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-1 text-lg font-extrabold">Add a child at home</h2>
          <p className="mb-3 text-sm text-muted">No club needed. They get Champ Town with games, quests, prayer and their collection. You can add them to a club later.</p>
          <ActionForm action={addHomeKid}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
              <Field label="Child's first name" name="firstName" required maxLength={40} />
              <Field label="Surname initial" name="lastInitial" maxLength={1} />
            </div>
            <fieldset className="flex flex-col gap-2 text-sm">
              <legend className="mb-1 font-bold">What should they see?</legend>
              <label className="flex items-center gap-2"><input type="radio" name="content" value="faith" defaultChecked className="h-5 w-5" /> Bible adventures and games</label>
              <label className="flex items-center gap-2"><input type="radio" name="content" value="play" className="h-5 w-5" /> Games and quests only</label>
            </fieldset>
            <PicturePin />
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5" />
              <span>I am this child&apos;s parent or guardian and I agree to the privacy notice.</span>
            </label>
            <Submit>Add my child</Submit>
          </ActionForm>
        </Card>
        <Card>
          <h2 className="mb-1 text-lg font-extrabold">Did your child start an account?</h2>
          <p className="mb-3 text-sm text-muted">Kids can start their own account and get a code. Type it in to approve it.</p>
          <Link className={buttonClass("outline")} href="/approve">Approve with a code</Link>
          <h2 className="mb-1 mt-6 text-lg font-extrabold">Join a club</h2>
          <p className="mb-3 text-sm text-muted">Got a join code from a church or club? Find them and add your child there.</p>
          <Link className={buttonClass("outline")} href="/clubs">Find a club</Link>
        </Card>
      </div>
      {(certs ?? []).length > 0 ? (
        <>
          <h2 className="font-display text-2xl font-extrabold">Certificates</h2>
          <ul className="flex flex-col gap-2" data-testid="parent-certificates">
            {(certs ?? []).map((c) => (
              <li key={c.id} className="rounded-[14px] border border-line bg-surface p-3">
                <Link href={`/p/certificates/${c.id}`} className="font-extrabold underline">{c.title}</Link>
                <span className="text-sm text-muted"> · {c.kids.first_name} · {new Date(c.issued_at).toLocaleDateString("en-GB")}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {(files ?? []).length > 0 ? (
        <>
          <h2 className="font-display text-2xl font-extrabold">Files from the club</h2>
          <ul className="flex flex-col gap-2" data-testid="parent-files">
            {(files ?? []).map((f) => (
              <li key={f.id} className="rounded-[14px] border border-line bg-surface p-3"><a href={`/media/${f.id}`} className="font-extrabold underline">{f.title}</a><span className="text-sm text-muted"> · {f.organizations.name}</span></li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-extrabold">Club events</h2>
        {(events ?? []).length > 0 ? <a href="/p/calendar" className="text-sm font-bold underline" data-testid="ics-link">Add to my calendar (.ics)</a> : null}
      </div>
      <ul className="flex flex-col gap-2" data-testid="parent-events">
        {(events ?? []).map((e) => (
          <li key={e.id} className="rounded-[14px] border border-line bg-surface p-3">
            <p className="font-extrabold">{e.title}</p>
            <p className="text-sm text-muted">
              {new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: e.organizations.timezone }).format(new Date(e.starts_at))}
              {" · "}{e.organizations.name}{e.location ? ` · ${e.location}` : ""}
            </p>
          </li>
        ))}
        {(events ?? []).length === 0 ? <li className="text-sm text-muted">No events yet.</li> : null}
      </ul>
    </AdultShell>
  );
}
