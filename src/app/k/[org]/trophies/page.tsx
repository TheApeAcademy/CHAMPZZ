import Link from "next/link";
import { KidShell } from "@/features/kids/components/kid-shell";
import { BadgeIcon } from "@/features/kids/components/badge-icon";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Trophies" };

function hasEnded(iso: string) {
  return new Date(iso).getTime() < new Date().getTime();
}

export default async function TrophiesPage({ params }: PageProps<"/k/[org]/trophies">) {
  const { org } = await params;
  const k = await getKidSnapshot(org);
  const supabase = await supabaseServer();
  const [{ data: badges }, { data: earned }, { data: certs }] = await Promise.all([
    supabase.from("badges").select("id, code, name, description, icon, window_start, window_end, sort").eq("active", true).order("sort"),
    supabase.from("kid_badges").select("badge_id, earned_at").eq("kid_id", k.kidId),
    supabase.from("certificates").select("id, title, issued_at").eq("kid_id", k.kidId).order("issued_at", { ascending: false }),
  ]);
  const got = new Map((earned ?? []).map((e) => [e.badge_id, e.earned_at]));
  const visible = (badges ?? []).filter((b) => got.has(b.id) || !b.window_end || !hasEnded(b.window_end));

  return (
    <KidShell slug={org} clubName={k.org.name} active="trophies" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">Trophies</h1>
      <p className="font-bold text-muted">{k.trophies} of {visible.length} collected</p>
      <ul className="grid grid-cols-2 gap-3" data-testid="trophy-list">
        {visible.map((b) => {
          const when = got.get(b.id);
          const seasonal = Boolean(b.window_end);
          return (
            <li key={b.id} data-earned={when ? "yes" : "no"} data-code={b.code} className={`flex flex-col gap-2 rounded-[20px] p-4 ${when ? "bg-gold" : "border-2 border-dashed border-line bg-surface"}`}>
              <BadgeIcon icon={b.icon} earned={Boolean(when)} />
              <span className={`font-extrabold ${when ? "text-ink" : "text-muted"}`}>{b.name}</span>
              <span className={`text-xs ${when ? "text-ink" : "text-muted"}`}>{b.description}</span>
              {seasonal && !when ? <span className="self-start rounded-full bg-coral px-2 py-0.5 text-[11px] font-extrabold text-ink">Limited time</span> : null}
              {when ? <span className="text-[11px] font-bold text-ink">Won {new Date(when).toLocaleDateString("en-GB")}</span> : null}
            </li>
          );
        })}
      </ul>
      {(certs ?? []).length > 0 ? (
        <>
          <h2 className="font-display text-2xl font-black italic uppercase">Certificates</h2>
          <ul className="flex flex-col gap-2" data-testid="kid-certificates">
            {(certs ?? []).map((c) => (
              <li key={c.id}>
                <Link href={`/k/${org}/certificates/${c.id}`} className="flex items-center justify-between gap-3 rounded-[20px] border-2 border-gold bg-surface p-4 font-extrabold">
                  <span>{c.title}</span><span className="text-xs font-bold text-muted">{new Date(c.issued_at).toLocaleDateString("en-GB")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </KidShell>
  );
}
