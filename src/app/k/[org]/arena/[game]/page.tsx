import { notFound } from "next/navigation";
import { KidShell } from "@/features/kids/components/kid-shell";
import { getKidSnapshot } from "@/features/kids/server/data";
import { ARENA, arenaName, JIGSAW_IMAGES, type ArenaGame } from "@/features/games/meta";
import { arenaContent } from "@/features/games/server/data";
import { buildJigsaw, buildMemory, buildScramble, buildWhoAmI, buildWordSearch } from "@/features/games/arena/build";
import { Scramble } from "@/features/games/arena/scramble";
import { Memory } from "@/features/games/arena/memory";
import { WhoAmI } from "@/features/games/arena/whoami";
import { WordSearch } from "@/features/games/arena/wordsearch";
import { Jigsaw } from "@/features/games/arena/jigsaw";
import { Catch } from "@/features/games/arena/catch";

export const metadata = { title: "The Arena" };

export default async function ArenaGamePage({ params }: PageProps<"/k/[org]/arena/[game]">) {
  const { org, game: raw } = await params;
  const meta = ARENA.find((g) => g.key === raw);
  if (!meta) notFound();
  const game = meta.key as ArenaGame;
  const k = await getKidSnapshot(org);
  const faith = k.org.faithMode;

  let body: React.ReactNode;
  if (game === "scramble") {
    const items = (await arenaContent(k.org.id, faith, "scramble")).map((c) => ({ title: c.title, text: String((c.data as { text: string }).text) }));
    body = <Scramble slug={org} items={items} initial={buildScramble(items)} />;
  } else if (game === "whoami") {
    const items = (await arenaContent(k.org.id, faith, "whoami")).map((c) => c.data as { answer: string; clues: string[] });
    body = <WhoAmI slug={org} items={items} initial={buildWhoAmI(items)} />;
  } else if (game === "wordsearch") {
    const lists = (await arenaContent(k.org.id, faith, "wordsearch")).map((c) => ({ title: c.title, words: (c.data as { words: string[] }).words }));
    body = <WordSearch slug={org} lists={lists} initial={buildWordSearch(lists)} />;
  } else if (game === "memory") {
    body = <Memory slug={org} initial={buildMemory()} />;
  } else if (game === "jigsaw") {
    const images = faith ? [...JIGSAW_IMAGES.faith, ...JIGSAW_IMAGES.general] : JIGSAW_IMAGES.general;
    body = <Jigsaw slug={org} images={images} initial={buildJigsaw(images)} />;
  } else {
    body = <Catch slug={org} faith={faith} />;
  }
  return (
    <KidShell slug={org} clubName={k.org.name} active="games" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">{arenaName(game, faith)}</h1>
      <p className="-mt-2 text-sm text-muted">{meta.blurb}</p>
      {body}
    </KidShell>
  );
}
