"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getViewer, requireOrgRole } from "@/lib/auth/viewer";
import { friendlyError } from "@/lib/errors";
import { isPdf, mimeFor, sniffAudio, sniffImage } from "@/lib/images";
import type { ActionState } from "@/components/ui/action-form";

const uuid = z.uuid();

// ---------- Clubhouse posts ----------

export async function createPost(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const p = z.object({ title: z.string().trim().min(2, "Give the post a title.").max(100), body: z.string().trim().min(1, "Write the post.").max(3000) }).safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("club_posts").insert({ organization_id: org.id, title: p.data.title, body: p.data.body, published: data.get("publish") === "on", created_by: auth.user?.id });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/posts`);
  revalidatePath(`/c/${slug}`);
  return { ok: data.get("publish") === "on" ? "Posted on your Clubhouse." : "Saved as a draft." };
}

export async function setPostPublished(slug: string, id: string, published: boolean): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(id).success) return;
  const supabase = await supabaseServer();
  await supabase.from("club_posts").update({ published }).eq("id", id);
  revalidatePath(`/o/${slug}/posts`);
  revalidatePath(`/c/${slug}`);
}

export async function deletePost(slug: string, id: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(id).success) return;
  const supabase = await supabaseServer();
  await supabase.from("club_posts").delete().eq("id", id);
  revalidatePath(`/o/${slug}/posts`);
  revalidatePath(`/c/${slug}`);
}

// ---------- reading plans ----------

export async function markReadingDay(slug: string, dayId: string): Promise<void> {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug || !uuid.safeParse(dayId).success) return;
  const supabase = await supabaseServer();
  await supabase.rpc("mark_reading_day", { p_day: dayId });
  revalidatePath(`/k/${slug}/reading`);
}

// ---------- Digital Bank ----------

export async function uploadMedia(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const title = z.string().trim().min(1, "Give the file a title.").max(100).safeParse(data.get("title"));
  const audience = z.enum(["staff", "families"]).safeParse(data.get("audience"));
  if (!title.success) return { error: title.error.issues[0]?.message };
  if (!audience.success) return { error: "Choose who can see it." };
  const file = data.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pick a file first." };
  if (file.size > 10 * 1024 * 1024) return { error: "That file is over 10 MB." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const img = sniffImage(bytes);
  const kind = isPdf(bytes) ? { ext: "pdf", mime: "application/pdf" as const } : img ? { ext: img, mime: mimeFor(img) } : null;
  if (!kind) return { error: "Use a PDF, PNG, JPG or WebP file." };
  const supabase = await supabaseServer();
  const { data: o } = await supabase.from("organizations").select("status").eq("id", org.id).single();
  if (!o || !["active", "grace"].includes(o.status)) return { error: friendlyError({ message: "organization_not_active" }) };
  const path = `${org.id}/${crypto.randomUUID()}.${kind.ext}`;
  const admin = supabaseAdmin();
  const { error: upErr } = await admin.storage.from("club-media").upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (upErr) return { error: "Upload failed. Please try again." };
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await admin.from("media_items").insert({ organization_id: org.id, title: title.data, path, mime: kind.mime, size_bytes: file.size, audience: audience.data, created_by: auth.user?.id });
  if (error) { await admin.storage.from("club-media").remove([path]); return { error: friendlyError(error) }; }
  revalidatePath(`/o/${slug}/media`);
  return { ok: "Added to the Digital Bank." };
}

export async function deleteMedia(slug: string, id: string): Promise<void> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(id).success) return;
  const admin = supabaseAdmin();
  const { data: row } = await admin.from("media_items").select("path").eq("id", id).eq("organization_id", org.id).maybeSingle();
  if (!row) return;
  await admin.from("media_items").delete().eq("id", id);
  await admin.storage.from("club-media").remove([row.path]);
  revalidatePath(`/o/${slug}/media`);
}

// ---------- Record-a-verse ----------

export async function sendVerse(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) return { error: "Please sign in again." };
  const file = data.get("audio");
  if (!(file instanceof File) || file.size === 0) return { error: "Record your verse first." };
  if (file.size > 2 * 1024 * 1024) return { error: "That recording is too long. Keep it under a minute." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffAudio(bytes);
  if (!kind) return { error: "That does not look like a recording. Try again." };
  const lesson = uuid.safeParse(data.get("lesson"));
  const path = `${viewer.org.id}/${viewer.kid.id}/${crypto.randomUUID()}.${kind.ext}`;
  const admin = supabaseAdmin();
  const { error: upErr } = await admin.storage.from("verse-recordings").upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (upErr) return { error: "Upload failed. Please try again." };
  const { error } = await admin.rpc("svc_register_verse", { p_kid: viewer.kid.id, p_path: path, p_lesson: lesson.success ? lesson.data : undefined });
  if (error) {
    await admin.storage.from("verse-recordings").remove([path]);
    return { error: error.message === "too_many_recordings" ? "That's 5 recordings today. Great practising! Try again tomorrow." : friendlyError(error) };
  }
  revalidatePath(`/k/${slug}/verse`);
  return { ok: "Sent to your teacher. Well done!" };
}

export async function verseStar(slug: string, recordingId: string, kidId: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(recordingId).success || !uuid.safeParse(kidId).success) return;
  const supabase = await supabaseServer();
  await supabase.rpc("give_star", { p_kid: kidId, p_note: "Memory verse recording" });
  await supabase.rpc("mark_verse_heard", { p_recording: recordingId });
  revalidatePath(`/o/${slug}/verses`);
}

export async function verseHeard(slug: string, recordingId: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(recordingId).success) return;
  const supabase = await supabaseServer();
  await supabase.rpc("mark_verse_heard", { p_recording: recordingId });
  revalidatePath(`/o/${slug}/verses`);
}
