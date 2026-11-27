import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/features/auth/server/actions";
import { Bell } from "@/features/notifications/components/bell";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { VillageMap, villageSpots } from "@/features/kids/components/village-map";
import { getKidSnapshot } from "@/features/kids/server/data";
import { getViewer } from "@/lib/auth/viewer";

export const metadata = { title: "Champ Town" };

const ART = "/placeholders/landing";

// Rooms that are not buildings on the map, shown as bright app tiles under it.
const ROOMS = [
  { title: "Road to Champ", path: "road", bg: "linear-gradient(155deg,#2A2F4A,#0B1026)", ink: "#F2B33D", img: "feature-quiz" },
  { title: "Reading plans", path: "reading", bg: "linear-gradient(155deg,#FFD978,#F2B33D)", ink: "#0B1026", img: "icons-bible-journey-book", faithOnly: true, club: true },
  { title: "Record-a-verse", path: "verse", bg: "linear-gradient(155deg,#FF8FB3,#B3263E)", ink: "#fff", img: "village-bible-book", faithOnly: true, club: true },
  { title: "Champ Buddy", path: "buddy", bg: "linear-gradient(155deg,#7EE0B5,#1E8F5A)", ink: "#0B1026", img: "village-game-rocket", club: true },
  { title: "My Journal", path: "journal", bg: "linear-gradient(155deg,#FFB4A3,#FF5A3C)", ink: "#0B1026", img: "village-ears-hearttree" },
  { title: "My Stuff", path: "stuff", bg: "linear-gradient(155deg,#6E8BFF,#2F5BFF)", ink: "#fff", img: "feature-class", club: true },
  { title: "Collection", path: "collection", bg: "linear-gradient(155deg,#FFD978,#F2B33D)", ink: "#0B1026", img: "feature-achievements" },
  { title: "Events", path: "events", bg: "linear-gradient(155deg,#C9CBE0,#4D5172)", ink: "#fff", img: "icons-sunday-school-church", club: true },
  { title: "Trophies", path: "trophies", bg: "linear-gradient(155deg,#FFD978,#F2B33D)", ink: "#0B1026", img: "feature-achievements" },
  { title: "My Champ", path: "my-champ", bg: "linear-gradient(155deg,#8FB0FF,#1D3BB8)", ink: "#fff", img: "village-home-brickbuilding" },
] as const;

const glass = "bg-[rgba(11,16,38,.74)] border-[1.5px] border-[rgba(255,248,236,.18)] backdrop-blur-[14px] text-cream";

export default async function KidHomePage({ params }: PageProps<"/k/[org]/home">) {
  const { org } = await params;
  const k = await getKidSnapshot(org, { recordVisit: true });
  const viewer = await getViewer();
  const span = k.next ? k.next.min_points - k.level.min_points : 1;
  const pct = k.next ? Math.max(2, Math.round(((k.points - k.level.min_points) / span) * 100)) : 100;
  const spots = villageSpots(k.org.faithMode, k.home);
  const rooms = ROOMS.filter((t) => (!("faithOnly" in t) || k.org.faithMode) && (!("club" in t) || !k.home));
  const dock = [
    ...spots.map((s) => ({ key: s.key, label: s.key === "games" ? "Games: The Arena" : s.label, path: s.path, img: s.image })),
    { key: "trophies", label: "Trophies", path: "trophies", img: `${ART}/feature-achievements.webp` },
  ];

  return (
    <div data-mode={k.little ? "little" : "champ"} className="relative min-h-[100svh] overflow-x-clip bg-ink text-ink">
      {/* Blurred map behind everything, so wide screens frame the village. */}
      <div aria-hidden="true" className="fixed -inset-10 bg-cover bg-center [filter:blur(28px)_saturate(1.2)_brightness(.7)] [transform:scale(1.1)]" style={{ backgroundImage: `url(${ART}/kids-village-map.webp)` }} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 [background:radial-gradient(ellipse_70%_90%_at_50%_50%,transparent_40%,rgba(11,16,38,.6)_100%)]" />

      <header className="fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-2 px-[clamp(10px,2.5vw,28px)] pt-[max(12px,env(safe-area-inset-top))]">
        <Link href={`/k/${org}/my-champ`} className={`flex min-w-0 flex-1 items-center gap-2 rounded-[22px] py-1.5 pl-1.5 pr-3 ${glass} max-w-[260px]`}>
          <span className="flex-none overflow-hidden rounded-[14px] border-[2.5px] border-cream bg-gold"><ChampAvatar a={k.avatar} level={k.level.sort} size={40} /></span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[16px] font-black uppercase italic leading-tight [font-stretch:72%]" data-testid="kid-greeting">Hi, {k.firstName}!</span>
            <span className="block truncate text-xs font-bold text-[#C9CBE0]"><span data-testid="kid-level">{k.level.name}</span>{k.className ? ` · ${k.className}` : ""}</span>
            <span className="mt-1.5 block h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </span>
          </span>
        </Link>
        <div className="flex flex-none flex-wrap items-center justify-end gap-1.5">
          <span className={`inline-flex min-h-10 items-center gap-1 rounded-full px-2.5 text-[15px] font-black !text-gold ${glass} !border-[rgba(242,179,61,.45)]`} aria-label={`${k.points} Champ Points`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>{k.points}
          </span>
          <span className={`hidden min-h-10 items-center gap-1.5 rounded-full px-3 text-[15px] font-black !text-[#FF8A6E] min-[400px]:inline-flex ${glass} !border-[rgba(255,90,60,.5)]`} aria-label={`${k.streak} day Fire Streak`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 3 3 3 0-3-1-5 0-8z" /></svg>{k.streak}
          </span>
          {viewer.kind === "kid" ? <Bell userId={viewer.userId} href={`/k/${org}/alerts`} className={`!min-h-10 !min-w-10 rounded-full ${glass}`} /> : null}
        </div>
      </header>

      {k.org.faithMode ? (
        <a href={`/k/${org}/town`} className="fixed right-3 top-[84px] z-[70] inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border-[2.5px] border-ink bg-gold py-0 pl-2.5 pr-4 text-sm font-black text-ink shadow-[0_4px_0_var(--ink)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M12 22V12M21 7l-9 5-9-5" /></svg>3D town
        </a>
      ) : null}

      <main className="relative z-10 pb-[calc(110px+env(safe-area-inset-bottom))]">
        <h1 className="sr-only">Champ Town</h1>
        <VillageMap slug={org} spots={spots} avatar={<ChampAvatar a={k.avatar} level={k.level.sort} size={48} />} />

        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-3 pt-5">
          <section aria-label="Today" className={`flex flex-col gap-3 rounded-[24px] p-4 ${glass}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-[.14em] text-gold">Today in Champ Town</span>
              <form action={signOut}><button type="submit" className="min-h-11 px-1 text-sm font-black text-[#C9CBE0] underline">Sign out</button></form>
            </div>
            <p className="text-lg font-extrabold"><span data-testid="kid-points">{k.points} Champ Points</span></p>
            <p className="-mt-2 text-sm font-bold text-[#C9CBE0]">{k.next ? `${k.next.min_points - k.points} more to ${k.next.name}` : "Top level! You're a Champ."}</p>
            <div className="grid grid-cols-2 gap-2">
              <span className="flex items-center gap-2 rounded-[16px] bg-white/[.06] p-3 font-extrabold">
                <Image src={`${ART}/icons-streak-flame.webp`} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                <span><span className="block text-2xl leading-none" data-testid="kid-streak">{k.streak}</span><span className="text-xs text-[#C9CBE0]">day Fire Streak</span></span>
              </span>
              <Link href={`/k/${org}/trophies`} className="flex items-center gap-2 rounded-[16px] bg-white/[.06] p-3 font-extrabold">
                <Image src={`${ART}/feature-achievements.webp`} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                <span><span className="block text-2xl leading-none" data-testid="kid-trophies">{k.trophies}</span><span className="text-xs text-[#C9CBE0]">Trophies</span></span>
              </Link>
            </div>
            {!k.confirmed ? <p className="rounded-[14px] bg-[#FCEBC4] px-3 py-2 text-sm font-bold text-[#5A3F00]">Welcome! Your teacher will say hi at your first visit.</p> : null}
          </section>

          {k.home ? (
            <p className="rounded-[22px] border-[2.5px] border-ink bg-[#E8F5EE] p-4 text-[15px] text-ink shadow-[0_5px_0_var(--ink)]" data-testid="home-grownup"><span className="block font-black">Worried or upset?</span>Tell your mum, dad or a grown-up you trust. You can also ask them to find your church or club on Champzz.</p>
          ) : (
            <Link href={`/k/${org}/talk`} className="flex items-center gap-3 rounded-[22px] border-[2.5px] border-ink bg-[#E8F5EE] p-4 text-ink shadow-[0_5px_0_var(--ink)]" data-testid="talk-tile">
              <Image src={`${ART}/village-ears-hearttree.webp`} alt="" width={52} height={52} className="h-[52px] w-[52px] flex-none object-contain" />
              <span><span className="block font-black">Talk to Someone</span><span className="text-sm">Worried or upset? Tell a trusted adult. You can stay anonymous.</span></span>
            </Link>
          )}

          <section aria-label="More rooms" className="grid grid-cols-2 gap-3 min-[420px]:grid-cols-3">
            {rooms.map((t) => (
              <Link key={t.title} href={`/k/${org}/${t.path}`} className={`relative flex flex-col justify-between overflow-hidden rounded-[24px] border-[2.5px] border-ink p-3 shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)] ${k.little ? "min-h-32" : "min-h-28"}`} style={{ background: t.bg, color: t.ink }}>
                <Image src={`${ART}/${t.img}.webp`} alt="" width={56} height={56} className="h-14 w-14 self-end object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,.35)]" />
                <span className="font-display text-[19px] font-black uppercase italic leading-[1.05] [font-stretch:80%]">{t.title}</span>
              </Link>
            ))}
          </section>
        </div>
      </main>

      <nav aria-label="Champ Town" className="cz-scroll-x fixed bottom-[max(14px,env(safe-area-inset-bottom))] left-1/2 z-50 flex max-w-[calc(100vw-20px)] -translate-x-1/2 gap-1 rounded-[28px] border-[1.5px] border-[rgba(255,248,236,.16)] bg-[rgba(11,16,38,.82)] p-[7px] shadow-[0_20px_50px_-14px_rgba(0,0,0,.7)] backdrop-blur-[18px]">
        <Link href={`/k/${org}/home`} aria-label="Home" aria-current="page" className="grid h-[60px] w-[60px] flex-none place-items-center rounded-[20px] border-[1.5px] border-gold bg-gold/20 text-gold">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7v9H3z" /></svg>
        </Link>
        {dock.map((d) => (
          <Link key={d.key} href={`/k/${org}/${d.path}`} aria-label={d.label} title={d.label}
            className="h-[60px] w-[60px] flex-none rounded-[20px] border-[1.5px] border-white/10 bg-white/[.06] p-1.5 transition-transform duration-300 hover:-translate-y-1.5 hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={d.img} alt="" className="h-full w-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,.4)]" loading="lazy" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
