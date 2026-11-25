"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { getViewer, requireOrgRole } from "@/lib/auth/viewer";
import { friendlyError } from "@/lib/errors";
import type { ActionState } from "@/components/ui/action-form";

const uuid = z.uuid();
const optionalClass = z.union([z.literal(""), z.uuid()]).transform((v) => (v === "" ? null : v));

export async function sendMessage(path: string, kidId: string | null, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind === "anonymous") return { error: "Please sign in again." };
  const text = z.string().trim().min(1, "Write a message first.").max(1000).safeParse(data.get("body"));
  if (!text.success) return { error: text.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("send_message", { p_body: text.data, p_kid: kidId ?? undefined });
  if (error) return { error: error.message === "messaging_locked" ? "Messages open after your teacher says hi at your first visit." : friendlyError(error) };
  revalidatePath(path);
  return { ok: "Sent." };
}

const lessonSchema = z.object({
  title: z.string().trim().min(1, "Give it a title.").max(120),
  body: z.string().trim().max(10000).default(""),
  memoryVerse: z.string().trim().max(400).optional(),
  lessonDate: z.union([z.literal(""), z.iso.date()]).optional(),
  classId: optionalClass,
  publish: z.literal("on").optional(),
});

export async function createLesson(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const p = lessonSchema.safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("lessons").insert({
    organization_id: org.id, class_id: p.data.classId, title: p.data.title, body: p.data.body,
    memory_verse: p.data.memoryVerse || null, lesson_date: p.data.lessonDate || null,
    status: p.data.publish ? "published" : "draft", created_by: auth.user?.id,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/lessons`);
  return { ok: p.data.publish ? "Lesson published." : "Lesson saved as a draft." };
}

export async function setLessonStatus(slug: string, lessonId: string, status: "draft" | "published"): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(lessonId).success) return;
  const supabase = await supabaseServer();
  await supabase.from("lessons").update({ status }).eq("id", lessonId);
  revalidatePath(`/o/${slug}/lessons`);
}

const assignmentSchema = z.object({
  title: z.string().trim().min(1, "Give it a title.").max(120),
  instructions: z.string().trim().max(4000).default(""),
  dueDate: z.union([z.literal(""), z.iso.date()]).optional(),
  classId: optionalClass,
  publish: z.literal("on").optional(),
});

export async function createAssignment(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const p = assignmentSchema.safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("assignments").insert({
    organization_id: org.id, class_id: p.data.classId, title: p.data.title, instructions: p.data.instructions,
    due_date: p.data.dueDate || null, status: p.data.publish ? "published" : "draft", created_by: auth.user?.id,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/assignments`);
  return { ok: p.data.publish ? "Published. The class has been told." : "Saved as a draft." };
}

export async function setAssignmentStatus(slug: string, id: string, status: "draft" | "published" | "closed"): Promise<void> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  if (!uuid.safeParse(id).success) return;
  const supabase = await supabaseServer();
  await supabase.from("assignments").update({ status }).eq("id", id);
  revalidatePath(`/o/${slug}/assignments`);
}

export async function gradeSubmission(slug: string, assignmentId: string, submissionId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  await requireOrgRole(slug, ["org_admin", "teacher"]);
  const p = z.object({ grade: z.coerce.number().int().min(0).max(100), feedback: z.string().trim().max(1000).optional() }).safeParse(Object.fromEntries(data));
  if (!p.success || !uuid.safeParse(submissionId).success) return { error: "Give a mark from 0 to 100." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("grade_submission", { p_submission: submissionId, p_grade: p.data.grade, p_feedback: p.data.feedback || undefined });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/assignments/${assignmentId}`);
  return { ok: "Marked. The kid has been told." };
}

export async function submitWork(slug: string, assignmentId: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const viewer = await getViewer();
  if (viewer.kind !== "kid" || viewer.org.slug !== slug) return { error: "Please sign in again." };
  const text = z.string().trim().min(1, "Write your answer first.").max(4000).safeParse(data.get("body"));
  if (!text.success || !uuid.safeParse(assignmentId).success) return { error: "Write your answer first." };
  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("submit_assignment", { p_assignment: assignmentId, p_body: text.data });
  if (error) return { error: error.message === "already_graded" ? "Your teacher has already marked this." : friendlyError(error) };
  revalidatePath(`/k/${slug}/class`);
  return { ok: "Handed in! +10 Champ Points." };
}

const eventSchema = z.object({
  title: z.string().trim().min(1, "Give it a title.").max(120),
  description: z.string().trim().max(2000).optional(),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick a date and time."),
  location: z.string().trim().max(200).optional(),
});

export async function createEvent(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const p = eventSchema.safeParse(Object.fromEntries(data));
  if (!p.success) return { error: p.error.issues[0]?.message };
  const supabase = await supabaseServer();
  const { data: tz } = await supabase.from("organizations").select("timezone").eq("id", org.id).single();
  const { data: auth } = await supabase.auth.getUser();
  // the form's local time is in the club's time zone
  const { data: startsAt } = await supabase.rpc("club_local_to_utc", { p_local: p.data.startsAt, p_tz: tz?.timezone ?? "UTC" });
  const { error } = await supabase.from("events").insert({
    organization_id: org.id, title: p.data.title, description: p.data.description || null,
    starts_at: (startsAt as string | null) ?? `${p.data.startsAt}:00Z`, location: p.data.location || null, created_by: auth.user?.id,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/o/${slug}/events`);
  return { ok: "Event added." };
}

export async function deleteEvent(slug: string, eventId: string): Promise<void> {
  await requireOrgRole(slug, ["org_admin"]);
  if (!uuid.safeParse(eventId).success) return;
  const supabase = await supabaseServer();
  await supabase.from("events").delete().eq("id", eventId);
  revalidatePath(`/o/${slug}/events`);
}

export async function assignTeacher(slug: string, _prev: ActionState, data: FormData): Promise<ActionState> {
  const { org } = await requireOrgRole(slug, ["org_admin"]);
  const p = z.object({ classId: z.uuid(), userId: z.uuid() }).safeParse(Object.fromEntries(data));
  if (!p.success) return { error: "Pick a class and a teacher." };
  const supabase = await supabaseServer();
  const { error } = await supabase.from("class_teachers").insert({ organization_id: org.id, class_id: p.data.classId, user_id: p.data.userId });
  if (error) return { error: error.code === "23505" ? "That teacher already teaches this class." : friendlyError(error) };
  revalidatePath(`/o/${slug}`);
  return { ok: "Teacher added to the class." };
}
