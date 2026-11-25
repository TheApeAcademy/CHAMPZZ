// Database errors are raised with short codes. Turn them into plain words and
// never show raw database messages to anyone.
const messages: Record<string, string> = {
  not_allowed: "You do not have permission to do that.",
  invalid_join_code: "That join code is not valid. Ask the club leader for the current one.",
  organization_not_active: "This club is not active right now.",
  joining_paused: "Joining is paused for this club right now. Ask the club leader.",
  kid_limit_reached: "This club is full right now. Ask the club leader.",
  too_many_kids_for_parent: "You have added the most kids allowed for one parent. Ask the club leader to add more.",
  invalid_class: "Please pick a class from the list.",
  too_many_organizations: "You have reached the limit of organizations for one account.",
  bad_timezone: "Please pick a valid time zone.",
  kid_not_pending: "That kid is not waiting for approval.",
  bad_pin: "A picture PIN is 4 pictures.",
  period_end_in_past: "The paid-until date must be in the future.",
  star_limit_reached: "That is 5 stars from you today. Try again tomorrow.",
  locked_item: "Keep playing to unlock that one!",
  empty_message: "Please write something first.",
  messaging_locked: "Messages open after your teacher says hi at your first visit.",
  already_graded: "Your teacher has already marked this.",
  bad_grade: "Give a mark from 0 to 100.",
  bad_status: "Pick a status.",
  bad_role: "Pick teacher or Org Admin.",
  too_many_invites: "You have a lot of open invites. Revoke some first.",
  invite_invalid: "This invite link has expired, been used, or been cancelled. Ask the club leader for a new one.",
  last_admin: "A club always needs at least one Org Admin. Make someone else an Org Admin first.",
  already_checked_out: "Already checked out.",
  reason_required: "Write a short reason.",
  title_required: "Give the certificate a title.",
  step_locked: "Finish the step before this one first.",
  bad_pack: "That question pack is not available here.",
  pack_too_small: "That pack needs at least 5 questions first.",
  bad_teams: "Check the team names.",
  run_finished: "That round is already over.",
  power_up_used: "You already used that power-up.",
};

export function friendlyError(err: { message?: string; code?: string } | null | undefined, fallback = "Something went wrong. Please try again."): string {
  if (!err?.message) return fallback;
  if (messages[err.message]) return messages[err.message]!;
  if (err.code === "23505") return "That name is already taken.";
  return fallback;
}
