# CCT Audit

Phase 1 deliverable for Champzz. Source audited: the CCT repo (branch `claude/quirky-gauss-2q4f0s`, head `a4565a1`, 108 commits, about 38,400 lines of TypeScript, CSS and SQL). CCT was not modified.

## 0. How this audit was done, and its limits

Read in full: every SQL migration (21 files), all four Edge Functions, the whole Supabase data layer (`src/lib/ministry.ts`, `src/lib/supabase.ts`, `src/lib/useMinistryAuth.ts`), `App.tsx`, `main.tsx`, `index.html`, `vite.config.ts`, `README.md`, `DATABASE-FIX-PROMPT.md`, and the git history. UI pages and components were read by structure (every component, tab and route mapped) with targeted reads where behaviour mattered. Every hardcoded MFM reference was found by search, not by eye.

Not done, on purpose:

- **The live MFM database was not queried.** It holds real children's data and is not ours to touch for this job. That matters because of finding D1 below: the core tables were never put in migrations, so their RLS policies can only be inferred from how the app calls them. Where a finding depends on that, it is marked *inferred*.
- No CCT code was run. Nothing in this document claims a test result.

Quality ratings use 1 to 5 (5 is production-grade for a multi-tenant SaaS). Recommendations are **Keep** (port the idea and logic largely as is), **Improve** (port the idea, rebuild the implementation), **Drop**.

---

## 1. What CCT is

A Vite + React 19 SPA (HashRouter, PWA) backed by one Supabase project, built for one church's children's ministry. Four portals with separate sign-ins (Kids, Teacher, Admin, Parent), a public marketing site, and an offline-first host-led Bible quiz that keeps its own data in the browser (Dexie / IndexedDB) and syncs results up when online.

Stack: Vite 8, React 19, TypeScript 6 (strict mode **off**), Tailwind 4 plus about 4,000 lines of hand-written CSS, framer-motion and gsap, Dexie, supabase-js, vite-plugin-pwa. No tests of any kind. No CI. Lint is oxlint on touched files only.

---

## 2. Feature inventory

### 2.1 Kids portal (`/student`, `src/pages/StudentPortal.tsx`, 3,611 lines)

| Feature | Where | Quality | Rec. | Notes |
|---|---|---|---|---|
| Village Map (home navigation as an illustrated village) | `VillageMap.tsx`, `KidsShell.tsx`, `public/village/*` | 3 | Improve | Strong concept, it is the "Kids Village". Art is CCT's, must be replaced with original Champzz art. |
| Bible Journey (bite-size lessons, hearts, checkpoints) | `BibleJourney.tsx`, `content/bibleJourney*.ts`, `journey_progress` | 3 | Improve | Content lives in code (Genesis only, 610 lines), so no org can add lessons. Lesson screen was built as "a replica of a Duolingo lesson" (commit log). Must become our own lesson format, content in the DB. |
| XP / points | triggers on `journey_progress`, `quiz_attempts`, etc. | 2 | Improve | Point values hardcoded in several trigger functions (+15 lesson, +10 reading). Quiz points are client-supplied. Needs one server-side XP ledger. |
| Streaks | `compute_bible_streak()`, `StreakScreen.tsx` | 2 | Improve | Was broken (read a table nothing wrote to) until the last migrations. Day boundary is server UTC, not the org's timezone. Loops one day at a time. |
| Achievements / badges | `achievements`, `student_achievements`, `award_achievement()`, `Achievements.tsx` | 3 | Keep | Trigger-driven awarding is the right idea. Badge definitions must become per-org plus platform defaults, with seasonal / limited-time support. |
| Bible Character Collection (unlock characters by XP + lesson) | `bible_characters`, `check_character_unlocks()`, `CharacterCollection.tsx` | 3 | Improve | Fun mechanic. Images reuse unrelated scenes (e.g. "Isaac" uses the Adam and Eve image). Needs data-driven content and real art. |
| Bible Quiz (host-led game show, 10 levels, lifelines, timer) | `pages/GameSetup.tsx`, `Gameplay.tsx` (1,083), `Results.tsx`, `MatchResults.tsx`, `GroundRules.tsx` | 4 (fun) / 2 (data) | Improve | The most loved feature, but it is explicitly a "Who Wants to Be a Millionaire" recreation (ladder, "Ask the Church" / 50:50 / "Ask a Friend" lifelines, branding in the PWA manifest). A paid product cannot ship that. Rebuild as an original Champzz quiz show format. Question bank is per-device (see 2.6). |
| Training Mode (solo practice) | `pages/Training.tsx` | 3 | Keep | Becomes a solo quiz mode inside the game framework. |
| Leaderboard (week / month / year / all, podium) | `get_leaderboard_ranked()`, `LeaderboardRoom` | 2 | Improve | Exposes every child's full name and photo to any signed-in user (S3). Correlated subqueries per student will not scale. |
| Bible Arcade (Memory Match, Verse Scramble, Who Am I?) | `BibleArcade.tsx` (656) | 2 | Improve | Three of our six games exist in prototype form. Content hardcoded, best scores in localStorage only, no XP. Rebuild on the shared game framework. |
| Pray for the World (prayer globe) | `PrayerJournal.tsx`, `content/prayerCountries.ts` | 2 | Improve | localStorage only. Keep as a faith-toggle feature. |
| Prayer Journal and Diary | `private_notes` table, `PrayerJournal.tsx` | 3 | Keep | Private notes per kid. Keep, faith toggle decides the "prayer" kind. |
| Personal Vault (files, notes) | `vault_items`, `vault` storage bucket, `PersonalVault.tsx` | 2 | Improve | Bucket policies not in VCS. Uploads use the raw file name in the path. Kids uploading arbitrary files needs moderation and size caps. Plan-gate it. |
| Avatar Studio (photo upload + look) | `AvatarStudio.tsx`, `lib/avatarLook.ts` | 2 | Improve | Photo stored as a base64 data URL in `profiles.avatar_url` (bloats every leaderboard query). Look stored in localStorage. Champzz spec wants a level-based growing avatar: replace photo-first with an illustrated avatar, keep photo as an opt-in, moderated, org-controlled setting. |
| Avatar moderation queue | `list_pending_avatars()`, `review_child_avatar()`, `AvatarReviewQueue.tsx` | 4 | Keep | Good safeguarding pattern. |
| Child text screening (contact details, abuse) | `screen_child_text()` | 4 | Keep | Good. Move list to a config table so it can be localised. |
| Digital ID card | `lib/idCard.ts` | 3 | Improve | Canvas-drawn ID with student code. Becomes the digital ID plus printable name tag in check-in. |
| Class room (lectures, memory verse, Sunday unlocks, assignments, submissions) | `ClassRoom`, `lectures`, `assignments`, `assignment_submissions`, `class_sunday_unlocks` | 3 | Keep | Solid core. Ports with `organization_id`. |
| Messages with teacher | `conversations`, `messages`, `ChatScreen` | 3 | Improve | One-to-one kid to teacher chat. For safeguarding, Champzz should default to org-visible (no truly private adult-child channel), with org setting. See section 4. |
| Ears for You (safeguarding channel) | `ears_messages`, replies, internal notes, audit log, escalation, notifications | 4 | Keep | The best-engineered part of CCT: anonymous masking enforced in the DB, escalation, audit log, urgent notifications. Carry over and strengthen (designated safeguarding lead role, SLA reminders). |
| Bible Buddy (AI Q&A) | `ai-companion` Edge Function, `ai_companion_messages` | 3 | Improve | Server-side key, logging, anonymous masking, parent visibility. Concerns: sends children's free text to a third-party AI with no consent record (COPPA / NDPA), no rate limit, upstream error text returned to the child. Keep as an opt-in, plan-gated, org toggle with parental consent. |
| Friends screen | `FriendsScreen` | 2 | Improve | Relies on the leaderboard view that leaks across classes. Scope to own class, first names only. |
| Profile with Student Code and Parent Link Code | `ProfileRoom`, `get_or_create_parent_link_code()` | 2 | Improve | Replaced by the Champzz parent flow (section 5 of the brief). |
| Ministry calendar | `ministry_events`, `MinistryCalendarView.tsx` | 3 | Keep | Becomes org events. |
| Anthem page | `pages/Anthem.tsx` | 2 | Drop (as is) | Lyrics are CCT's own ministry anthem. Champzz could let an org add its own song in the CMS. |
| Notifications bell | `notifications` table + triggers, `NotificationBell.tsx` | 4 | Keep | Trigger-only writes, revoked from clients. Good. |

### 2.2 Teacher portal (`/teacher`, `TeacherPortal.tsx`, 1,998 lines)

| Feature | Quality | Rec. | Notes |
|---|---|---|---|
| Apply to Teach, wait for admin approval (`teacher_applications`, `approve_teacher()`) | 3 | Improve | Champzz flips it: Org Admin invites teachers by email. Keep an optional "request to join" path. |
| Classes with join code and shareable link | 3 | Improve | Join codes move to org level (brief section 5). Class assignment happens at approval. |
| Pre-entered roster names, kids "claim" a name (`class_roster`, `join-class`) | 1 | Drop | Anyone holding a code sees every child's name and can claim any unclaimed one (S5). |
| Enroll a child by Student Code (`enroll_student_by_code()`) | 2 | Drop | Replaced by approval queue. |
| Attendance register + history over weeks | 3 | Keep | Becomes the base of check-in / analytics. |
| Lectures, Sunday lesson calendar unlocks | 3 | Keep | Becomes "Lessons" in the CMS. |
| Assignments + grading + notifications | 3 | Keep | |
| Printable certificates (`lib/certificate.ts`) | 3 | Improve | Hardcodes "MFM Children's Ministry". Make org-branded, add reading plan and level certificates. |
| Host a quiz, quiz leaderboards | 3 | Improve | Via new quiz show. |
| Ears inbox (acknowledge, reply, note, escalate) | 4 | Keep | |
| Bible Buddy log | 3 | Keep | |
| Passcode reset for a child (`reset-passcode`) | 2 | Improve | Right idea (teacher resets, logged). Wrong mechanism (plaintext passcode, see S1). Becomes "reset picture PIN". |
| Avatar review queue | 4 | Keep | |
| Search (`ministry_search()`) | 3 | Keep | Authorisation in one SQL function is a good pattern. Add `organization_id`. |

### 2.3 Admin portal (`/admin`, `AdminPortal.tsx`, 1,350 lines)

| Feature | Quality | Rec. | Notes |
|---|---|---|---|
| Teacher applications | 3 | Improve | See above. |
| Every class at a glance + stats | 3 | Keep | Becomes org analytics. |
| Seasons | 2 | Improve | Exists twice: in Dexie (per device) and in Postgres. One source of truth. |
| Bible reading plans (plans + day readings) | 3 | Keep | Note: per the migrations, `complete_bible_reading()` had no call sites in the kids UI at one point. Rebuild end to end, faith toggle. |
| Ministry calendar CRUD | 3 | Keep | |
| Digital Bank (songs, videos, docs) | 1 | Improve | Stored in Dexie, so it exists only in the browser that uploaded it. Becomes org media library in Supabase Storage. |
| Admins tab (promote to admin) | 2 | Improve | Global `is_admin()`. First admin made by hand in SQL. Becomes org roles + Super Admin. |
| Safety tab (Ears audit) | 4 | Keep | |

### 2.4 Parent portal (`/parent`, `ParentPortal.tsx`, `components/parent/*`)

| Feature | Quality | Rec. | Notes |
|---|---|---|---|
| Self sign-up, link child with `FAM` + 6 digit code | 2 | Improve | No rate limit on guesses, no approval, link is permanent (S9). Replaced by parent-led registration. |
| Per-child progress, monthly star rating | 3 | Keep | Feeds the weekly parent report. |
| Printable progress report | 3 | Improve | Hardcoded MFM logo and name. |
| Take-Home Sunday (weekly talk / do / pray) | 3 | Improve | Content hardcoded in `content/takeHomeSunday.ts`. Move to CMS, faith toggle. |
| Church calendar with .ics export | 3 | Keep | Hardcoded `PRODID` and location. |
| See child's Bible Buddy history (non-anonymous) | 4 | Keep | |

### 2.5 Public site

| Feature | Quality | Rec. | Notes |
|---|---|---|---|
| Landing page (`Home.tsx`, 2,149 lines, framer-motion + gsap) | 2 | Drop | Entirely MFM-branded, heavy for slow networks. Champzz needs (a) its own marketing site and (b) a light per-org public page. |
| Features showcase (`/features`) | 3 | Improve | Good content inventory; becomes Champzz marketing. |
| Safety page | 3 | Improve | Made promises the DB did not keep (leaderboard was public, see migration `20260919120000`). Champzz copy must be checked against tests. |
| Kids sign-in page | 2 | Drop | Built as a copy of "the icloud.com landing page" (commit log). |
| PWA install, offline quiz | 4 | Keep | Offline play is a real advantage on Nigerian networks. Keep for the quiz show and games. |

### 2.6 Offline quiz data (Dexie)

Question Bank (370 seeded KJV questions, import / export), local match history, local seasons, Digital Bank, pending sync queues. All per device. **Improve**: the question bank becomes server data (platform default packs + org packs) cached offline, results queue and sync with server-side scoring. The 370 questions are generic KJV Bible trivia and can seed the platform default pack after a review pass.

---

## 3. Current data model and its weaknesses

### 3.1 Tables seen

From migrations: `journey_progress`, `bible_characters`, `attendance`, `parent_links`, `ai_companion_messages`, `notifications`.

Referenced by the app but **never created in any migration**: `profiles`, `students`, `classes`, `class_roster`, `class_history`, `teacher_applications`, `seasons`, `quiz_attempts`, `quiz_sessions`, `conversations`, `messages`, `ears_messages`, `ears_message_replies`, `ears_internal_notes`, `ears_audit_log`, `lectures`, `assignments`, `assignment_submissions`, `class_sunday_unlocks`, `bible_plans`, `bible_plan_readings`, `student_bible_progress`, `achievements`, `student_achievements`, `private_notes`, `vault_items`, `ministry_events`, plus views `leaderboard`, `ears_teacher_inbox`, and RPCs such as `get_class_by_join_code`, `get_student_login_email`, `enroll_student_by_code`, `find_student_by_code`, `promote_to_admin`, `approve_teacher`, `is_admin`, `is_teacher_of_class`, `award_achievement`.

### 3.2 Weaknesses

- **D1. The base schema is not in version control.** Roughly 30 tables, their RLS policies and most RPCs were made in the dashboard. The database cannot be rebuilt from the repo, reviewed, or tested. This is the single biggest structural flaw.
- **D2. Single tenant.** No `organization_id` anywhere. `is_admin()` is global. Every query assumes one church.
- **D3. One global role per person** (`profiles.role`). A parent who also teaches, or a teacher at two orgs, cannot exist.
- **D4. Kid identity is welded to the auth user** (`students.id = auth.users.id`) with credentials (`login_key`), codes and profile fields mixed into one row.
- **D5. Plaintext credential in a data table** (`students.login_key` is the kid's password). See S1.
- **D6. Images as base64 in rows** (`profiles.avatar_url`). Every leaderboard and roster read drags image bytes.
- **D7. XP has no ledger.** `students.total_points` is a counter bumped by many triggers with hardcoded values, plus a client-supplied `quiz_attempts.points`. Leaderboard windows are recomputed from source tables with correlated subqueries. Results drifted (see `DATABASE-FIX-PROMPT.md`: 48,980 vs 7,770).
- **D8. Content in code.** Bible Journey lessons, Take-Home Sunday, arcade verses and characters, prayer countries, Sunday calendar art are TypeScript constants. No org can add content without a deploy.
- **D9. Split sources of truth.** Seasons, question bank, Digital Bank and match history live per device in IndexedDB.
- **D10. No timezone.** Streaks and "today" use server `current_date` (UTC).
- **D11. Fixes applied by hand.** `DATABASE-FIX-PROMPT.md` is a prompt for an agent to paste SQL into production. Live DB and repo can drift silently.
- **D12. No generated types.** `as any` casts on joined rows; TypeScript `strict` is off.

---

## 4. Everything hardcoded to one church or to MFM

92 matches for `mfm|wuye|etomi|pastor|zebraish` in `src/` alone. Grouped:

**Identity and branding**
- Names: "MFM Children's Ministry", "MFM Kids", "MFM Wuye", "MFM Children's Ministry, Wuye" in `Layout.tsx`, `SiteFooter.tsx`, `SplashScreen.tsx`, `KidsShell.tsx`, `PortalShell.tsx`, `KidsSignIn.tsx`, `QuizStage.tsx`, `TeacherPortal.tsx`, `ParentHome.tsx`, `ProgressReport.tsx`, `ChurchCalendar.tsx`, `PublicShell.tsx`, `index.html`, `vite.config.ts` (PWA manifest).
- Logos and photos in `public/`: `mfm-logo.png`, `church-logo.png`, `children-ministry-logo-splash.png`, `children-ministry-seal.png`, `ministry-logo-full.png`, `mfm-wuye-building.jpg`, `pastor-edwin-etomi.jpg`, `children-pastor.jpg`, hero photos (`hero-*.jpg`), `teacher-home-bg.jpg`, `classroom-bible-reading-bg.jpg`, and the app icons.
- External link: `https://www.mountainoffire.org/live` (`Layout.tsx`, `SiteFooter.tsx`).
- Colours: theme colour `#1b1030` and the gold / purple system in `index.css` and `design/*.css`.

**Credentials and generated values**
- Student code prefix `MFM` + 4 digits (`student-register`).
- Kid passcodes built as `<firstname>mfm<digits>` (`student-register`, `reset-passcode`, `JoinClass.tsx`).
- Synthetic kid emails on `@kids.mfmchildren.app`.
- Parent link code prefix `FAM`.

**Infrastructure**
- Supabase project ref and publishable key in `src/lib/supabase.ts`, `README.md`, every Edge Function header comment and `DATABASE-FIX-PROMPT.md`. (The publishable key is public by design, not a leaked secret, but it ties the code to one project.) No service-role keys, Anthropic keys or payment keys were found anywhere in the git history.

**Content and copy**
- Anthem lyrics ("Little Lights, Shining Bright"), "A Message From Pastor", "Our Church Family" tiles (`sundaySchoolCalendar.ts`), pastor-specific Take-Home Sunday lesson, church-specific Safety copy, ministry-specific feature copy (`featureShowcase.ts`).
- Lifeline named "Ask the Church".
- Bible Buddy system prompt assumes a church Sunday School.
- Teacher title parsing (`sis|bro|pastor|pst|deacon|evang`) is Nigerian church specific; fine as a default list, should be locale data.

**Storage keys**
- localStorage keys prefixed `mfm-` and `cct-` (theme, arcade best, avatar look, sky, dashboard state, last portal).

**Third party branding**
- "Built by Zebraish" footer and `zebraish-lockup.png`, link to a personal portfolio. Decision needed (open question Q9).

None of this carries into Champzz. Org name, logo, colours, contact, public links, anthem, timezone, faith mode and code prefixes become org settings.

---

## 5. Security findings

Severity is for a multi-tenant children's platform. "Inferred" means the relevant SQL is not in VCS (D1) and the behaviour was read from how the client calls it.

### Critical

- **S1. Kids' passwords are guessable, stored in plaintext, and used as the login lookup key.** At sign-up the passcode is `<firstname>mfm<one digit>` (ten possibilities per first name); after a reset, three digits. It is stored in `students.login_key` in plaintext, unique across all kids, and readable by anyone who can read that `students` row (teachers, admins, linked parents, the kid). `get_student_login_email_by_login_key(p_login_key, p_full_name)` returns the auth email for a matching passcode and is never revoked from `anon` in any migration (Postgres grants EXECUTE to PUBLIC by default), so *inferred*: a signed-out stranger can call it with `joshmfm0` to `joshmfm9`, get the email, then sign in with the same string as the password. The fallback branch matches any older account by **full name alone**. Result: takeover of a child's account, their teacher chat and their Ears for You history. Supabase Auth's own rate limit is the only brake.
- **S2. Unauthenticated, unlimited account creation.** `student-register` runs with the service role, `verify_jwt` off, no join code, no captcha, no rate limit. Anyone can mint authenticated "student" accounts at will.
- **S3. Children's data readable by any signed-in user.** The `leaderboard` view (SECURITY DEFINER, so no RLS) is granted to all `authenticated` users and returns every child's full name, photo, class and points. `quiz_sessions` is readable by any signed-in user (`auth.uid() is not null`) and carries child names and every answer. Combined with S2, "any signed-in user" means anyone on the internet.

### High

- **S4. Forgeable scores.** `quiz_attempts.points` is client-supplied. `quiz_sessions` accepts inserts from anyone, including signed-out clients, with no check on `student_id` (acknowledged in CCT as open items W12 / W13).
- **S5. A class code leaks the class list.** `get_class_by_join_code` (callable pre-auth) returns every claimed and unclaimed child's full name. `join-class` lets anyone with the code claim any unclaimed name and set its PIN. A forwarded code equals access, which the Champzz brief explicitly forbids.
- **S6. Brute-forceable parent linking.** `link_child_by_code` accepts `FAM` + 6 digits (1,000,000 space, generated with non-cryptographic `random()`), with no rate limit, no lockout, no admin approval, and creates a permanent parent link with read access to the child's attendance, lessons, badges and AI chats.
- **S7. Teacher can pull any child into their class.** *Inferred*: `enroll_student_by_code` lets an approved teacher enroll a child by `MFM` + 4 digit code (10,000 space). Enrolment then authorises `reset-passcode`, which hands the teacher a working password for that child. One rogue or compromised teacher account can take over arbitrary children.
- **S8. Unknown RLS on the most sensitive tables.** Policies for `profiles`, `students`, `classes`, `messages`, `conversations`, `ears_*`, `private_notes`, `vault_items` and the `vault` bucket are not in VCS. They cannot be reviewed or tested from the repo. Treat as unverified.

### Medium

- **S9. Session tokens in localStorage** (supabase-js default in an SPA). Any XSS yields a usable refresh token. Next.js with `@supabase/ssr` keeps the session in httpOnly-capable cookies and lets most reads run on the server.
- **S10. Edge Functions return raw internal errors** (`error.message` from Postgres and Auth, and up to 200 chars of the AI provider's error body) to the browser, and send `Access-Control-Allow-Origin: *`.
- **S11. Global admin with self-propagation.** Any admin can promote anyone to admin; the first admin is created by hand-run SQL. No audit log for role changes.
- **S12. Unsanitised storage paths.** Vault uploads use the raw `file.name` in the object path, and there is no size or type limit in the client code.
- **S13. AI without consent or limits.** Bible Buddy sends a child's free text to a third-party model with no parental consent record and no per-child rate limit (cost and abuse risk).
- **S14. No consent or minimisation.** Guardian phone and date of birth are collected with no consent capture, no retention policy, no export or deletion path.

### Low

- **S15.** Hardcoded project ref and publishable key (not secret, but blocks environments).
- **S16.** `random()` used for every code (student, parent link, passcode digits). Use `gen_random_bytes` / `crypto.getRandomValues`.
- **S17.** The role-escalation trigger relies on a transaction GUC flag (`app.role_claim`). It works, but a cleaner model is to never let clients write role columns at all.

### Done well (carry the pattern forward)

- Ears for You anonymity enforced in the DB (base-table policy hides anonymous rows, masking view, escalation, audit log).
- Notifications writable only by SECURITY DEFINER triggers, with EXECUTE revoked from PUBLIC (after a fix).
- `screen_child_text()` and the avatar moderation queue.
- Service role and AI key kept server-side only.
- Search authorisation centralised in one SQL function.
- Thoughtful comments explaining why. Champzz should keep that habit.

---

## 6. Tech debt, and what breaks at 50+ organizations

**Tech debt**
- God files: `StudentPortal.tsx` 3,611 lines, `index.css` 3,842, `Home.tsx` 2,149, `TeacherPortal.tsx` 1,998, `ministry.ts` 1,699.
- TypeScript strict mode off; `as any` on joined rows; no generated DB types.
- No tests, no CI, no lint gate on the whole repo.
- No input validation library; ad-hoc checks in Edge Functions, none on most client writes.
- HashRouter plus an `index.html` script that rewrites bare paths, plus a service-worker workaround for stale HTML. Symptoms of a static SPA standing in for a server-rendered app.
- Three CSS systems at once (Tailwind, `index.css`, per-page `design/*.css`), inline style objects everywhere, six font families shipped.
- Duplicate helpers between portals (`Face`, `AV`, `MON`, `TITLES` copied in Teacher and Admin).
- Content and data mixed into components.
- `DATABASE-FIX-PROMPT.md`: production changes made by pasting SQL, not migrations.

**What breaks at 50+ organizations**
- Everything in section 4: one name, one logo, one set of codes, one calendar.
- Global uniqueness of `login_key`, student codes and class join codes. Collisions grow with every org, and every collision is an information leak (it confirms another child's passcode exists).
- Leaderboard and streak functions do per-student correlated subqueries and day-by-day loops across the whole database.
- Base64 avatars in rows multiply payload size with every child.
- Per-device data (question bank, Digital Bank) means an org's content is lost when a teacher clears their browser.
- No plans, limits, billing, org status, usage metering, audit log or Super Admin. None of the SaaS layer exists.
- No migrations for the core, so no way to stand up staging, preview branches or a second region.
- Single timezone.
- Landing page bundle weight (framer-motion + gsap + many large JPGs) on slow mobile data.

---

## 7. IP and content risks to resolve before anything ships

- **Game show format.** The quiz is openly modelled on "Who Wants to Be a Millionaire" (ladder, named lifelines, music cues, manifest description). Rebuild as an original format with its own name, structure and look.
- **Copied UI.** Commit history describes the lesson screen as "a replica of a Duolingo lesson" and the kids sign-in as "the icloud.com landing page". Champzz designs these from scratch.
- **Image provenance unknown.** `public/scenes/*`, `public/journey/*` (including 38 Bible book covers), `public/village/*`, feature PNGs and hero photos have no licence record in the repo. Treat all of them as not reusable. No CCT image carries over.
- **Audio.** `public/sounds/*.mp3` (applause, cheer, background music) have no licence record. Do not reuse. CCT's synthesized Web Audio effects (`lib/sound.ts`) are code and can be ported.
- **Bible text.** CCT uses KJV, which is public domain in Nigeria, the US and most of Europe (the UK has Crown letters patent; KJV in UK products is customarily tolerated but should be noted). Any modern translation (NIV, NLT, ESV) needs a licence. Champzz should store a `translation` field on every verse and default to KJV / WEB.
- **External kids' brands.** CCT links to SuperBook. Links are fine; no characters or art from SuperBook or any other show.

---

## 8. Keep / improve / drop summary

**Keep (logic and pattern):** Ears for You, notifications, text screening, avatar moderation, achievements engine, attendance, assignments and grading, lectures, Bible reading plans, events calendar, private journal, Bible Buddy logging and masking, centralised search authorisation, offline-first quiz with sync.

**Improve (rebuild):** Bible Journey, XP / streaks / leaderboards, character collection, the quiz (as an original format), arcade games (into the six-game framework), Village Map (new art), avatar (level-based), Digital ID (plus name tags), certificates, parent dashboard and reports, Take-Home Sunday, vault, media library, seasons, teacher onboarding, search, AI companion.

**Drop:** roster claiming, Student Code enrolment, `FAM` link codes, name-based passcodes, MFM landing page, kids sign-in page clone, Anthem as fixed content, all CCT images and audio, HashRouter / bare-path rewriting, the hand-run SQL fix workflow.
