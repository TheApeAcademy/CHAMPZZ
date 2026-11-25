// My Champ avatar options. Shared by the renderer (server or client) and the
// editor. The database re-checks every value, including level unlocks.

export const SKINS = ["#F6D3B3", "#E0AC69", "#C68642", "#8D5524", "#6B4226", "#4A2C1A"];
export const HAIR_COLORS = ["#1B1B1B", "#4A2C1A", "#8B5A2B", "#D9A441", "#B23A2E", "#6C6F7A"];
export const OUTFITS = ["#2F5BFF", "#F2B33D", "#FF5A3C", "#0B1026", "#1E8F5A", "#8A4FFF", "#FF7AB6", "#00A3C4"];
export const HAIRS = ["Short", "Puffs", "Braids", "Bun", "Curly", "Cap"];

export type Extra = "none" | "headband" | "cape" | "medal" | "crown";
export const EXTRAS: { key: Extra; name: string; level: number; levelName: string }[] = [
  { key: "none", name: "Nothing", level: 1, levelName: "Rookie" },
  { key: "headband", name: "Headband", level: 2, levelName: "Rising Star" },
  { key: "cape", name: "Cape", level: 3, levelName: "All-Star" },
  { key: "medal", name: "Gold medal", level: 4, levelName: "Legend" },
  { key: "crown", name: "Crown", level: 5, levelName: "Champ" },
];

export type AvatarConfig = { skin: number; hair: number; hairColor: number; outfit: number; extra: Extra };

export function parseAvatar(raw: unknown): AvatarConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const n = (v: unknown, max: number, fallback: number) => {
    if (v === undefined || v === null || v === "") return fallback;
    const x = Number(v);
    return Number.isInteger(x) && x >= 0 && x <= max ? x : fallback;
  };
  const extra = EXTRAS.some((e) => e.key === r.extra) ? (r.extra as Extra) : "none";
  // A new kid starts with a medium-brown skin tone (Nigeria first); they can change it.
  return { skin: n(r.skin, 5, 3), hair: n(r.hair, 5, 0), hairColor: n(r.hairColor, 5, 0), outfit: n(r.outfit, 7, 0), extra };
}

export function toDbAvatar(a: AvatarConfig) {
  return { skin: String(a.skin), hair: String(a.hair), hairColor: String(a.hairColor), outfit: String(a.outfit), extra: a.extra };
}
