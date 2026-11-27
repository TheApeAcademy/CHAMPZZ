import Image from "next/image";
import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { todayIn } from "@/lib/time";

export const metadata = { title: "Sunday School" };

const ART = "/placeholders/landing";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TINTS = ["#DDE4FF", "#DCF5E6", "#FDE2DE", "#FCEBC4", "#EADCF5"];
const TABS = [
  { label: "Sundays", path: "sunday", icon: "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4" },
  { label: "Faith Quest", path: "quest", icon: "M6 3h12v18l-6-4-6 4z" },
  { label: "Reading Plan", path: "reading", icon: "M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2zM20 5a2 2 0 0 0-2-2h-5v18h5a2 2 0 0 0 2-2z" },
  { label: "Champ Buddy", path: "buddy", icon: "M4 6h16v10H8l-4 4zM9 11h.01M15 11h.01" },
];

/** Sunday School hub (Claude Design): every Sunday's lesson by month, plus the other faith rooms. */
export default async function SundaySchoolPage({ params, searchParams }: PageProps<"/k/[org]/sunday">) {
  const { org } = await params;
  const { m } = await searchParams;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const { data: lessons } = k.home
    ? { data: [] as { id: string; title: string; memory_verse: string | null; lesson_date: string | null }[] }
    : await supabase.from("lessons").select("id, title, memory_verse, lesson_date").not("lesson_date", "is", null).order("lesson_date").limit(200);

  const today = todayIn(k.org.timezone);
  const all = lessons ?? [];
  const byMonth = new Map<string, typeof all>();
  for (const l of all) {
    const key = l.lesson_date!.slice(0, 7);
    byMonth.set(key, [...(byMonth.get(key) ?? []), l]);
  }
  const months = [...byMonth.keys()];
  const current = today.slice(0, 7);
  const picked = typeof m === "string" && byMonth.has(m) ? m : byMonth.has(current) ? current : months.findLast((x) => x <= current) ?? months[0];
  const shown = picked ? byMonth.get(picked)! : [];
  const thisWeek = [...all].reverse().find((l) => l.lesson_date! <= today && l.memory_verse) ?? all.find((l) => l.memory_verse);
  const tabs = k.home ? TABS.filter((t) => t.path !== "buddy") : TABS;

  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <section className="relative overflow-hidden rounded-[clamp(28px,4vw,40px)] border-4 border-ink bg-gold p-[clamp(20px,5vw,32px)] pb-6 shadow-[0_10px_0_var(--ink)]">
        <div aria-hidden="true" className="cz-dots-ink absolute inset-0" />
        <span className="relative inline-flex items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-black uppercase tracking-[.1em] text-cream"><span className="h-2 w-2 rounded-full bg-gold" />Sunday School</span>
        <h1 className="cz-display cz-rise relative mt-3 max-w-[8ch] text-[clamp(56px,16vw,96px)] text-ink [text-shadow:3px_3px_0_#FFF8EC]">Every Sunday</h1>
        <p className="relative mt-3 max-w-[22ch] text-[17px] font-extrabold leading-snug min-[420px]:max-w-[28ch]">
          A new Bible story every week. Sundays open as we reach them, so you and your class learn together.
        </p>
        <Image src="/landing/teacher.webp" alt="" width={220} height={330} className="cz-bob pointer-events-none absolute bottom-0 right-[-4%] h-[52%] w-auto object-contain drop-shadow-[0_16px_24px_rgba(11,16,38,.3)]" />
        {thisWeek?.memory_verse ? (
          <div className="relative mt-5 max-w-[min(26ch,64%)] -rotate-1 rounded-[18px] bg-ink px-4 py-3 text-cream">
            <span className="text-[11px] font-black uppercase tracking-[.14em] text-gold">This week</span>
            <p className="mt-1 text-[17px] font-bold leading-snug">&ldquo;{thisWeek.memory_verse}&rdquo;</p>
          </div>
        ) : null}
      </section>

      <nav aria-label="Sunday School" className="grid grid-cols-2 gap-2 rounded-[24px] border-[2.5px] border-ink bg-[#F3EADA] p-2">
        {tabs.map((t) => {
          const on = t.path === "sunday";
          return (
            <Link key={t.path} href={`/k/${org}/${t.path}`} aria-current={on ? "page" : undefined}
              className={`flex min-h-14 items-center justify-center gap-2 rounded-[18px] px-2 text-[15px] font-black ${on ? "border-[2.5px] border-ink bg-gold shadow-[0_4px_0_var(--ink)]" : "text-ink"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.icon} /></svg>
              {t.label}
            </Link>
          );
        })}
      </nav>

      {months.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[28px] border-[2.5px] border-dashed border-ink/40 bg-[#FFFDF7] p-6 text-center">
          <Image src={`${ART}/icons-sunday-school-church.webp`} alt="" width={96} height={96} className="h-24 w-24 object-contain" />
          <p className="text-lg font-black">{k.home ? "Sundays live in your club" : "Your first Sunday is coming"}</p>
          <p className="text-[15px] text-muted">{k.home ? "Ask a grown-up to find your church or club on Champzz. Until then, try a Faith Quest or a Reading Plan." : "When your teacher adds this week's lesson, it shows up here."}</p>
        </div>
      ) : (
        <>
          <nav aria-label="Months" className="cz-scroll-x -mx-4 flex gap-2 px-4 pb-1">
            {months.map((key) => {
              const on = key === picked;
              const n = byMonth.get(key)!;
              const open = n.filter((l) => l.lesson_date! <= today).length;
              return (
                <Link key={key} href={`/k/${org}/sunday?m=${key}`} aria-current={on ? "true" : undefined}
                  className={`flex min-h-[52px] min-w-[72px] flex-none flex-col items-center justify-center rounded-[16px] border-[2.5px] border-ink px-3 leading-tight ${on ? "bg-ink text-cream" : "bg-[#FFFDF7]"}`}>
                  <span className="text-base font-black">{MONTHS[+key.slice(5, 7) - 1]}</span>
                  <span className="text-[11px] font-extrabold opacity-75">{open}/{n.length}</span>
                </Link>
              );
            })}
          </nav>
          {picked ? (
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="cz-display text-[clamp(32px,9vw,44px)]">{FULL[+picked.slice(5, 7) - 1]} {picked.slice(0, 4)}</h2>
              <span className="text-sm font-extrabold text-muted">{shown.filter((l) => l.lesson_date! <= today).length} of {shown.length} open</span>
            </div>
          ) : null}
          <ul className="flex flex-col gap-4">
            {shown.map((l, i) => {
              const d = new Date(`${l.lesson_date}T12:00:00Z`);
              const open = l.lesson_date! <= today;
              const isToday = l.lesson_date === today;
              const card = (
                <>
                  <div className="relative h-28 border-b-[2.5px] border-ink" style={{ background: TINTS[i % TINTS.length] }}>
                    <div aria-hidden="true" className="cz-dots-ink absolute inset-0" />
                    <span className="absolute left-3 top-3 flex flex-col items-center rounded-[12px] border-[2.5px] border-ink bg-[#FFFDF7] px-2.5 py-1 leading-none">
                      <span className="text-[11px] font-black uppercase">{MONTHS[d.getUTCMonth()]}</span>
                      <span className="text-[26px] font-black">{d.getUTCDate()}</span>
                    </span>
                    <span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-black ${open ? (isToday ? "bg-gold" : "bg-[#DCF5E6] text-[#0B5A2E]") : "bg-[#DDE4FF] text-[#1D3BB8]"}`}>
                      {open ? (isToday ? "Today" : "Open") : (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3" /></svg>Opens {MONTHS[d.getUTCMonth()]} {d.getUTCDate()}</>)}
                    </span>
                    <span aria-hidden="true" className="cz-display absolute bottom-0 right-4 text-[84px] leading-[.8] text-ink/10">{d.getUTCDate()}</span>
                  </div>
                  <div className="flex flex-col gap-1 px-4 py-3.5">
                    <span className="text-xs font-black uppercase tracking-[.1em] text-muted">Sunday lesson</span>
                    <span className="text-[21px] font-black leading-tight">{open ? l.title : "A new story"}</span>
                    {open && l.memory_verse ? <span className="line-clamp-2 text-sm font-semibold text-muted">&ldquo;{l.memory_verse}&rdquo;</span> : null}
                  </div>
                </>
              );
              return (
                <li key={l.id}>
                  {open ? (
                    <Link href={`/k/${org}/class`} className="block overflow-hidden rounded-[26px] border-[2.5px] border-ink bg-[#FFFDF7] shadow-[0_6px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_3px_0_var(--ink)]">{card}</Link>
                  ) : (
                    <div className="overflow-hidden rounded-[26px] border-[2.5px] border-ink bg-[#FFFDF7] opacity-80 shadow-[0_6px_0_var(--ink)]" aria-label={`Locked until ${l.lesson_date}`}>{card}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </KidShell>
  );
}
