"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getViewer, requireOrgRole } from "@/lib/auth/viewer";
import { friendlyError } from "@/lib/errors";
import { mimeFor, sniffImage } from "@/lib/images";
import { askBuddy, buddyConfigured, CONTACT_REPLY, DISTRESS_REPLY, screen, type BuddyTurn } from "@/lib/ai/buddy";
import type { ActionState } from "@/components/ui/action-form";

const uuid = z.uuid();

async function kidFor(slug: string) {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) return null;
  return viewer;
}

// ---------- Quest ----------

export async function completeStep(stepId: string, choice: number): Promise<{ correct: boolean; points: number } | { error: string }> {
  if (!uuid.safeParse(stepId).success || !Number.isInteger(choice)) return { error: "Unknown step." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc("complete_quest_step", { p_step: stepId, p_choice: choice });
  if (error) return { error: error.message === "step_locked" ? "Finish the step before this one first." : friendlyError(error) };
  return data as { correct: boolean; points: number };
}

export async function createQuest(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const p = z.object({ title: z.string().trim().min(2, "Give the quest a title.").max(80), summary: z.string().trim().max(200).optional() }).safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: o } = await supabase.from("organizations").select("faith_mode").eq("id", org.id).single();
  const { error } = await supabase.from("quests").insert({ organization_id: org.id, title: p.data.title, summary: p.data.summary || null, faith: Boolean(o?.faith_mode) });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/quests`);
  return { ok: "Quest created. Now add its steps." };
}

export async function addQuestStep(slug: string, questId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(questId).success) return { error: "Unknown quest." };
  const p = z.object({
    title: z.string().trim().min(2, "Give the step a title.").max(80),
    body: z.string().trim().min(1, "Write what kids will read.").max(2000),
    prompt: z.string().trim().min(3, "Write the checkpoint question.").max(200),
    a: z.string().trim().min(1, "Fill in all three answers.").max(120),
    b: z.string().trim().min(1, "Fill in all three answers.").max(120),
    c: z.string().trim().min(1, "Fill in all three answers.").max(120),
    answer: z.enum(["0", "1", "2"], "Pick the right answer."),
  }).safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: last } = await supabase.from("quest_steps").select("position").eq("quest_id", questId).order("position", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("quest_steps").insert({
    quest_id: questId, position: (last?.position ?? 0) + 1, title: p.data.title, body: p.data.body,
    check_prompt: p.data.prompt, check_choices: [p.data.a, p.data.b, p.data.c], check_answer: Number(p.data.answer),
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/quests`);
  return { ok: "Step added." };
}

// ---------- journal (private to the child) ----------

export async function addJournal(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const kid = await kidFor(slug);
  if (!kid) return { error: "Please sign in again." };
  const p = z.object({ kind: z.enum(["prayer", "thanks", "note"]), body: z.string().trim().min(1, "Write something first.").max(1000) }).safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.from("journal_entries").insert({ organization_id: kid.org.id, kid_id: kid.kid.id, kind: p.data.kind, body: p.data.body });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/k/${slug}/journal`);
  return { ok: "Saved. Only you can see this." };
}

export async function markAnswered(slug: string, id: string): Promise<void> {
  if (!(await kidFor(slug)) || !uuid.safeParse(id).success) return;
  const supabase = await supabaseServer();
  await supabase.from("journal_entries").update({ answered_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/k/${slug}/journal`);
}

export async function deleteJournal(slug: string, id: string): Promise<void> {
  if (!(await kidFor(slug)) || !uuid.safeParse(id).success) return;
  const supabase = await supabaseServer();
  await supabase.from("journal_entries").delete().eq("id", id);
  revalidatePath(`/k/${slug}/journal`);
}

// ---------- My Stuff ----------

export async function uploadStuff(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const kid = await kidFor(slug);
  if (!kid) return { error: "Please sign in again." };
  const file = data.get("picture");
  if (!(file instanceof File) || file.size === 0) return { error: "Pick a picture first." };
  if (file.size > 1024 * 1024) return { error: "That picture is too big. Pick one under 1 MB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return { error: "Use a PNG, JPG or WebP picture." };
  const caption = String(data.get("caption") ?? "").trim().slice(0, 100);
  const path = `${kid.org.id}/${kid.kid.id}/${crypto.randomUUID()}.${kind}`;
  const admin = supabaseAdmin();
  const { error: upErr } = await admin.storage.from("kid-uploads").upload(path, bytes, { contentType: mimeFor(kind), upsert: false });
  if (upErr) return { error: "Upload failed. Please try again." };
  const { error } = await admin.rpc("svc_register_upload", { p_kid: kid.kid.id, p_path: path, p_caption: caption });
  if (error) {
    await admin.storage.from("kid-uploads").remove([path]);
    return { error: error.message === "too_many_uploads" ? "My Stuff is full (20 pictures). Ask a grown-up to help you tidy up." : friendlyError(error) };
  }
  revalidatePath(`/k/${slug}/stuff`);
  return { ok: "Sent! A grown-up will check it, then it will show in My Stuff." };
}

export async function moderate(slug: string, uploadId: string, approve: boolean): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(uploadId).success) return;
  const supabase = await supabaseServer();
  const { data: path, error } = await supabase.rpc("moderate_upload", { p_upload: uploadId, p_approve: approve });
  // a rejected picture is deleted for good; the row stays as a record that it was checked
  if (!error && !approve && path) await supabaseAdmin().storage.from("kid-uploads").remove([path]);
  revalidatePath(`/o/${slug}/moderation`);
}

// ---------- Champ Buddy ----------

type BuddyStatus = { plan: boolean; club: boolean; consent: boolean; active: boolean; used_today: number; limit: number; faith: boolean };

export async function buddySend(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const kid = await kidFor(slug);
  if (!kid) return { error: "Please sign in again." };
  const text = z.string().trim().min(1, "Write a message first.").max(500, "Keep it under 500 characters.").safeParse(data.get("message"));
  if (!text.success) return { error: text.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: s } = await supabase.rpc("ai_status");
  const st = s as BuddyStatus | null;
  if (!st?.plan || !st.club || !st.consent || !st.active) return { error: "Champ Buddy is not switched on for you." };
  if (st.used_today >= st.limit) return { error: "That's lots of chatting today! Champ Buddy will be back tomorrow." };

  const verdict = screen(text.data);
  let reply: string;
  if (verdict === "distress") reply = DISTRESS_REPLY;
  else if (verdict === "contact") reply = CONTACT_REPLY;
  else {
    if (!buddyConfigured()) return { error: "Champ Buddy is not set up yet. Check back soon!" };
    const { data: recent } = await supabase.from("ai_messages").select("role, body").eq("kid_id", kid.kid.id).order("id", { ascending: false }).limit(10);
    reply = await askBuddy(((recent ?? []) as BuddyTurn[]).reverse(), text.data, st.faith);
  }
  // logged with the service role so the record cannot be edited by the child
  const { error } = await supabaseAdmin().rpc("svc_log_ai", { p_kid: kid.kid.id, p_kid_text: text.data, p_reply: reply, p_flagged: verdict === "distress" });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/k/${slug}/buddy`);
  return null;
}

export async function setBuddyConsent(kidId: string, allow: boolean): Promise<void> {
  const viewer = await getViewer();
  if (viewer.kind !== "adult" || !uuid.safeParse(kidId).success) return;
  const supabase = await supabaseServer();
  await supabase.rpc("set_ai_consent", { p_kid: kidId, p_allow: allow });
  revalidatePath(`/p/kids/${kidId}`);
}

export async function setBuddyEnabled(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const supabase = await supabaseServer();
  const { data: updated, error } = await supabase.from("organizations").update({ ai_enabled: data.get("enabled") === "on" }).eq("id", org.id).select("id");
  if (error || !updated?.length) return { error: friendlyError(error ?? { message: "organization_not_active" }) };
  revalidatePath(`/o/${slug}/settings`);
  return { ok: "Champ Buddy setting saved." };
}
