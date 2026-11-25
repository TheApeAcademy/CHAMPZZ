"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer, requireOrgRole } from "@/lib/auth/viewer";
import { friendlyError } from "@/lib/errors";
import type { ActionState } from "@/components/ui/action-form";

const uuid = z.uuid();

// ---------- Road to Champ: host results ----------

const matchSchema = z.object({
  packId: z.uuid(),
  teams: z.array(z.object({ name: z.string().trim().min(1).max(30), score: z.number().int().min(0).max(100000) })).min(1).max(6),
  questions: z.number().int().min(0).max(200),
  clientId: z.uuid(),
  playedAt: z.iso.datetime(),
});
export type MatchPayload = z.infer<typeof matchSchema>;

/** Called by the host screen; also used to upload results that were saved on the device while offline. */
export async function saveMatch(slug: string, payload: MatchPayload): Promise<{ ok: boolean; error?: string }> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const p = matchSchema.safeParse(payload);
  if (!p.success) return { ok: false, error: "Bad result." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("save_quiz_match", {
    p_org: org.id, p_pack: p.data.packId, p_teams: p.data.teams, p_questions: p.data.questions,
    p_client_id: p.data.clientId, p_played_at: p.data.playedAt,
  });
  if (error) return { ok: false, error: friendlyError(error) };
  revalidatePath(`/o/${slug}/quiz`);
  return { ok: true };
}

// ---------- Training Ground ----------

export async function startTraining(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) return { error: "Please sign in again." };
  const pack = uuid.safeParse(data.get("pack"));
  if (!pack.success) return { error: "Pick a pack." };
  const supabase = await supabaseServer();
  const { data: run, error } = await supabase.rpc("start_training", { p_pack: pack.data });
  if (error || !run) return { error: error?.message === "slow_down" ? "Take a little break and come back soon!" : friendlyError(error) };
  redirect(`/k/${slug}/road/${run}`);
}

export type TrainingState = {
  finished: boolean; index: number; total: number; correct: number; half_time_available?: boolean;
  question?: { tier: number; prompt: string; choices: string[] };
};
export type TrainingResult = { correct: boolean; answer_index: number; explanation: string | null; finished: boolean; correct_total: number; total: number; points: number };

export async function trainingState(runId: string): Promise<TrainingState | null> {
  if (!uuid.safeParse(runId).success) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("training_state", { p_run: runId });
  return (data as TrainingState | null) ?? null;
}

export async function trainingAnswer(runId: string, choice: number): Promise<TrainingResult | null> {
  if (!uuid.safeParse(runId).success || !Number.isInteger(choice) || choice < -1 || choice > 3) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("training_answer", { p_run: runId, p_choice: choice });
  return (data as TrainingResult | null) ?? null;
}

export async function trainingHalfTime(runId: string): Promise<number[]> {
  if (!uuid.safeParse(runId).success) return [];
  const supabase = await supabaseServer();
  const { data } = await supabase.rpc("training_half_time", { p_run: runId });
  return data ?? [];
}

// ---------- Arena ----------

const GAMES = ["scramble", "memory", "whoami", "wordsearch", "jigsaw", "catch"] as const;

export async function finishArena(game: string, score: number): Promise<{ points: number } | { error: string }> {
  const g = z.enum(GAMES).safeParse(game);
  if (!g.success || !Number.isFinite(score)) return { error: "Unknown game." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("finish_arena_game", { p_game: g.data, p_score: Math.max(0, Math.min(100000, Math.round(score))) });
  if (error) return { error: error.message === "slow_down" ? "Wow, lots of games! Take a little break." : friendlyError(error) };
  return { points: data ?? 0 };
}

// ---------- question bank (staff) ----------

export async function createPack(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const name = z.string().trim().min(1, "Name the pack.").max(60).safeParse(data.get("name"));
  if (!name.success) return { error: name.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const { data: pack, error } = await supabase.from("question_packs").insert({ organization_id: org.id, name: name.data, created_by: auth.user?.id }).select("id").single();
  if (error || !pack) return { error: friendlyError(error) };
  redirect(`/o/${slug}/quiz/bank/${pack.id}`);
}

const questionSchema = z.object({
  tier: z.coerce.number().int().min(1).max(5),
  prompt: z.string().trim().min(3, "Write the question.").max(300),
  a: z.string().trim().min(1, "Fill in all four answers.").max(120),
  b: z.string().trim().min(1, "Fill in all four answers.").max(120),
  c: z.string().trim().min(1, "Fill in all four answers.").max(120),
  d: z.string().trim().min(1, "Fill in all four answers.").max(120),
  answer: z.enum(["0", "1", "2", "3"], "Pick the right answer."),
  explanation: z.string().trim().max(300).optional(),
});

export async function addQuestion(slug: string, packId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(packId).success) return { error: "Unknown pack." };
  const p = questionSchema.safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.from("questions").insert({
    pack_id: packId, tier: p.data.tier, prompt: p.data.prompt, choices: [p.data.a, p.data.b, p.data.c, p.data.d],
    answer_index: Number(p.data.answer), explanation: p.data.explanation || null,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/quiz/bank/${packId}`);
  return { ok: "Question added." };
}

export async function deleteQuestion(slug: string, packId: string, questionId: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(questionId).success) return;
  const supabase = await supabaseServer();
  await supabase.from("questions").delete().eq("id", questionId);
  revalidatePath(`/o/${slug}/quiz/bank/${packId}`);
}

// ---------- Arena content (staff) ----------

export async function addArenaContent(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const game = z.enum(["scramble", "whoami", "wordsearch"]).safeParse(data.get("game"));
  if (!game.success) return { error: "Pick a game." };
  const title = z.string().trim().min(1, "Give it a title.").max(80).safeParse(data.get("title"));
  if (!title.success) return { error: title.error.issues[0]?.message };
  const raw = String(data.get("content") ?? "").trim();
  let content: { text: string } | { answer: string; clues: string[] } | { words: string[] };
  if (game.data === "scramble") {
    if (raw.length < 5 || raw.length > 200 || raw.split(/\s+/).length < 3) return { error: "Write a sentence of 3 or more words (under 200 characters)." };
    content = { text: raw };
  } else if (game.data === "whoami") {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const answer = String(data.get("answer") ?? "").trim();
    if (!answer || answer.length > 40) return { error: "Write the answer (who or what it is)." };
    if (lines.length < 2 || lines.length > 5 || lines.some((l) => l.length > 120)) return { error: "Write 2 to 5 clues, one per line." };
    content = { answer, clues: lines };
  } else {
    const words = raw.toUpperCase().split(/[\s,]+/).filter(Boolean);
    if (words.length < 4 || words.length > 10 || words.some((w) => !/^[A-Z]{3,10}$/.test(w))) return { error: "Write 4 to 10 words of 3 to 10 letters, separated by commas." };
    content = { words: [...new Set(words)] };
  }
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("arena_content").insert({ organization_id: org.id, game: game.data, title: title.data, data: content, created_by: auth.user?.id });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/arena`);
  return { ok: "Added to your club's Arena." };
}

export async function deleteArenaContent(slug: string, id: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(id).success) return;
  const supabase = await supabaseServer();
  await supabase.from("arena_content").delete().eq("id", id);
  revalidatePath(`/o/${slug}/arena`);
}
