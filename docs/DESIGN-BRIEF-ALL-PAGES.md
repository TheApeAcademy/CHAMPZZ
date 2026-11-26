# Champzz: page-by-page design brief for Claude Design

Prepared 2026-11-26. The landing page (`/`) is already designed (Landing v2). This brief covers **every other page in the app, 74 screens**, plus fixes for the landing page on phones.

Paste the **Global rules** section into every Claude Design session, then one page (or one small group) at a time.

---

## 0. Global rules (paste into every session)

### Brand and look (match Landing v2)
- **Palette (locked):**
  - Electric Blue `#2F5BFF`: primary actions. Swapped for the club's own colour on white-labelled screens.
  - Trophy Gold `#F2B33D`: points, wins, levels.
  - Hot Coral `#FF5A3C`: streaks, urgent counts.
  - Night Ink `#0B1026`: text, dark surfaces.
  - Warm Cream `#FFF8EC`: page ground.
  - White `#FFFFFF`: cards.
  - Line `#E6DCC6`: borders.
  - Muted `#4D5172`: secondary text.
  - Text on gold or coral is always Night Ink. Text on blue is white.
- **Type:**
  - Archivo for display. 800 upright on adult screens; 900 italic UPPERCASE on kid screens, like the landing's big stacked words.
  - Nunito Sans for body.
  - No other families.
- **Shape:**
  - Radius: 14px on controls, 20px on cards, 24 to 28px on kid tiles, pills on chips.
  - 8px grid.
  - Touch targets at least 44px; 56px for the kid nav, 64px in Little Champs.
- **Art:**
  - Reuse the landing's 3D crew: Daye (the host), Ellie (faith and reading), Conor (games), Tobi (sample kid), the leader, the teacher, and the parents peeking in.
  - Reuse the 3D object icons: house, trophy, flame, book, robot rocket, Champ Card, heart tree.
  - No emoji as icons. No characters from existing shows.
- **Logo:**
  - The landing currently uses a gold-swash **"Champions"** script wordmark.
  - `docs/DESIGN.md` says the wordmark must read **CHAMPZZ** (Archivo 900 italic, ZZ in gold).
  - **Banks: decide which one is final before page 1. Every page below uses it.**

### Three skins
1. **Public pages** (marketing, legal, auth): the landing's bold style with cream ground, giant stacked display words, and the crew.
2. **Adult workspace** (Org Admin, Teacher, Parent, Super Admin):
   - Calm and clear, on a cream ground with white cards.
   - Keep the brand energy in headers and empty states only.
   - No italic display type here, and no outlines with offset shadows.
3. **Kid world (Champ Town)**, in two age modes:
   - **Champ (ages 9 to 14):** bold tiles, italic display, the 3D map feel from the landing.
   - **Little Champs (ages 4 to 8):** three giant buttons, 3px ink outlines with 5px offset shadows, stars instead of numbers, icon-only nav with a Listen button, very little reading.

### Hard requirements (the code depends on these; changing them breaks sign-in and tests)
- Keep **every form field label, button label and `data-testid` exactly as listed** for each page below. You can restyle everything around them.
- Keep the existing routes and navigation items.
- Every page must work at **360px wide** with no sideways scroll. Design the phone version first: most parents and kids are on phones.
- Every page needs these states designed: **empty**, **error banner**, **success banner**, and **locked or Coming soon** where relevant. Add **read-only (club unpaid)** for workspace pages.
- Safeguarding screens (Talk to Someone, both sides) stay **plain and calm, never gamified**.
- Pages people print (certificates, weekly report, name tags) need a clean print layout.

---

## 1. Landing page fixes (from the phone review on 2026-11-26)

Desktop is good. At 360px:

1. **Hero wordmark breaks.** "CHAMPIONS" is squashed into unreadable blue vertical pillars. On phones, make it fit the width at a readable size, stack it, or swap to a phone-sized lockup.
2. **The side dot nav covers content.** The vertical section-dots rail overlaps text and cards (Faith Quest copy, Ears for You card, Faith mode card). Hide it on phones, or shrink it to a thin edge with no overlap.
3. **The memory verse falls apart.** In "Ellie's memory verse", the handwritten verse wraps to 2 or 3 letters per line ("STI / AN / GO / CO"). It needs a phone layout: verse under the picture, full width.
4. **"Faith that sticks after Sunday" is tiny on phones,** and the spinning globe sits on top of the text. Scale the title up and move the globe off the copy.
5. **The crew story header wraps.** "CHAMPZZ PRESENTS · MEET THE CREW" and "02 / 03" break onto two lines. Shorten it or let it truncate.

Also check: the footer logo sometimes shows only "Cha" mid-animation on phones. Make sure the draw-on animation always completes, or show it static on phones.

---

## 2. Recommended design order

Clients will see these screens first, so they come first:

| # | Group | Pages |
|---|---|---|
| 1 | Accounts | Sign in, Create account, Set up your club, Join a team |
| 2 | Club dashboard and payment | `/o/{club}` overview, including Choose a plan and Pay by bank transfer |
| 3 | Clubhouse | `/c/{club}`, the club's public page and parent registration |
| 4 | Parent | My kids, child Progress, Weekly report, certificate |
| 5 | Kid entry | Kid sign-in (picture password), Champ Town home (both age modes) |
| 6 | Kid world | All the other kid pages |
| 7 | Staff tools | Check-in, Lessons, Assignments, Events, Messages, Talk to Someone, and the rest |
| 8 | Club management | Team, Settings, Insights, Seasons, Audit log, and the rest |
| 9 | Super Admin console | Console, Organization detail |
| 10 | Public info pages | Features, Safety, Pricing, Privacy, Terms |
| 11 | Shared | Notifications, error pages (404, 500, no access), print layouts |

---

## 3. Shared pieces (design once, before the pages)

### A. Adult header and staff navigation
- **Header:** logo (links home), Notifications bell with unread count, the signed-in name, **Sign out** button.
- **Staff nav** (`navigation "Club"`), in this order:
  - **All staff (Org Admin and Teacher):** Overview, Check-in, Talk to Someone (coral urgent count), Messages, Lessons, Assignments, Events, Hall of Champs, Road to Champ, Arena, Certificates, Quests, Photo checks, Verse recordings, Clubhouse posts, Digital Bank, Champ Buddy log, Insights, Search, Name tags.
  - **Org Admin only:** Team, Seasons, Settings, Audit log.
- About 25 items is too many for a phone tab bar. Design grouped navigation:
  - **Today:** Overview, Check-in, Messages, Talk to Someone.
  - **Teach:** Lessons, Assignments, Events, Verse recordings, Quests.
  - **Play:** Road to Champ, Arena, Hall of Champs.
  - **Club:** Certificates, Name tags, Photo checks, Clubhouse posts, Digital Bank, Champ Buddy log, Insights, Search, and the admin items.
  - Use a drawer or bottom sheet on phones and a left sidebar on desktop.
- Status pill next to the club name: active / pending / grace / read_only / suspended.

### B. Kid shell (Champ Town)
- **Top:** greeting `Hi, {name}` (testid `kid-greeting`), Champ Points (`kid-points`), Fire Streak (`kid-streak`), level (`kid-level`), Sign out.
- **Bottom nav** (`navigation "Champ Town"`): Home, Class, Games, Hall, Trophies, and the rest via Home.
- **Little Champs variant:** icon-only nav, a Listen button, and giant buttons.
- The club's logo and colour show on the kid shell (white-label).

### C. Banners and form feedback
- Banners in ok, warn and error tones, used for "Payment received", "club pending", "grace", "read-only", "Upgrade".
- Form error text appears in `role="alert"`, success text in `role="status"`. Design both.
- A **Submit button pending state** (spinner and disabled), used on every form.

### D. Error and empty pages
- 404 "Not found", "You don't have access", 500 "Something went wrong", and an offline note for kid games.
- An empty state with a crew character, for every list.

---

## 4. Every page

Format for each page:
- **Who** can see it.
- **Purpose**.
- **Must contain** (field and button labels marked in **bold** are fixed).
- **States** to design.

### Group 1: Accounts

**1.1 Sign in: `/login`**
- **Who:** every adult (Org Admin, Teacher, Parent, Super Admin).
- **Must contain:**
  - Fields **Email** and **Password**, button **Sign in**.
  - A link to Create account.
  - A link "Kids sign in at your club's page".
  - **A "Forgot password?" link.** It doesn't exist yet and is being built, so design it plus a "Reset your password" page and a "Set a new password" page.
- **States:** wrong password ("That email and password do not match."), pending (button disabled).

**1.2 Create account: `/signup`**
- **Who:** new club founders and parents.
- **Must contain:**
  - Fields **Your name**, **Email**, **Password** (at least 10 characters, show the rule), button **Create account**.
  - A link to Sign in.
  - Short trust line: what happens next.
- **States:**
  - Validation errors.
  - "Check your email to confirm your account, then sign in." as a full success screen with a mail illustration.
  - "An account with that email already exists."

**1.3 Set up your club (onboarding): `/onboarding`**
- **Who:** a newly signed-up founder.
- **Must contain:**
  - **Club or ministry name**.
  - **Web address** (slug), with a live preview `champzz…/c/your-club`.
  - **What kind of organization?** (church, club, school).
  - **Country**, **Time zone**, **Billing currency** (NGN, GBP, USD, EUR, CAD).
  - Button **Create my club**.
- **Design as:** a friendly 2 or 3 step wizard with progress, the leader character, and a final "Now choose a plan" step that leads to the dashboard.
- **States:** web address taken, validation errors.

**1.4 Join a team: `/join/{token}`**
- **Who:** a teacher or admin opening an invite link.
- **Must contain:** "You have been invited" with the club name, logo and role; button **Accept invite**. If not signed in: sign in or create account first.
- **States:** link expired, link already used, wrong account.

### Group 2: Club dashboard and payment

**2.1 Club overview: `/o/{club}`** (the most important adult screen)
- **Who:** Org Admin (everything); Teacher (no billing, no joining settings).
- **Must contain:**
  - **Header:** role label, club name (`org-name`), status pill (`org-status`).
  - **Status banners:**
    - pending: "Choose a plan to unlock…"
    - grace: "Renew now…"
    - read_only
    - "Payment received. Your club is active."
  - **Choose a plan** (Org Admin, unpaid):
    - Selectable plan cards: name, price per month, kid limit.
    - Button **Pay online**.
    - Show a "Card payments coming soon" state for when online payment is off.
  - **Pay by bank transfer** card (`bank-details`): Bank, Account number, Account name, Reference (the club address), plus a copy button for each.
  - **Stat cards:**
    - Active kids `kid-count` (n / limit). At the limit, show `upgrade-prompt` "You have reached your kid limit…".
    - Plan, with "Paid until".
    - Join code `join-code` with button **New code** and a link to the Clubhouse page.
  - **Classes:** list, **New class name**, **Age band** (Champ or Little Champs), **Add class**; **Teacher**, **Class**, **Add teacher to class**.
  - **Joining:** **How kids join** (instant or approval), **Save**.
  - **Kids list** (rows `kid-{username}`):
    - Name, username, class, points, "new" badge.
    - Buttons: **Confirm** (new kids), **Approve** (approval mode), **Give a star**, **Set new PIN** (opens the 12-picture grid), and a Class picker.
- **States:** pending (mostly locked), active, grace, read-only, suspended; empty classes and empty kids.

### Group 3: Clubhouse

**3.1 Clubhouse page: `/c/{club}`**
- **Who:** public (families). Each club's own branded home.
- **Must contain:**
  - Club logo, colour, name (`clubhouse-name`), tagline, motto.
  - **News** (published Clubhouse posts).
  - **Add your child:**
    - Sign in or create account first if signed out.
    - Then fields **Join code** (placeholder ABCD-2345), **Child's first name**, **Surname initial**.
    - Pick 4 pictures (the 12-picture PIN grid: Star, Heart, Sun, Moon, Ball, Fish, Tree, House, Rocket, Flower, Cloud, Car).
    - Consent checkbox "I am this child's parent or guardian…".
    - Button **Add my child**.
  - **Success:** show the child's new username (`new-username`) big, with "write this down" and the 4 pictures recap.
- **States:** wrong code, club full ("ask the club to upgrade"), waiting for approval, club not active, unknown club (404).

### Group 4: Parent

**4.1 My kids: `/p`**
- **Who:** parent.
- **Must contain:**
  - A card per child (`parent-stats-{username}`): name, level, points, streak, class, "View progress".
  - **At the club now** (pickup codes for kids checked in).
  - **Certificates**.
  - **Club events** with an "Add to my calendar" .ics link.
  - **Files from the club**.
  - "Add another child", which links to the Clubhouse.
- **States:** no kids yet, kid checked in (big pickup code).

**4.2 Child progress: `/p/kids/{id}`**
- **Must contain:**
  - Level bar, avatar.
  - **Trophies**, **Certificates**, **Class work** (with grades), **Recent visits**.
  - **My Stuff** (approved pictures).
  - **Champ Buddy:** history plus the consent switch ("Yes, {name} may use Champ Buddy" / "You have said yes").
  - Take-Home card (Talk / Do / Pray, or Reflect when faith mode is off).
  - Link to the weekly report.

**4.3 Weekly report: `/p/kids/{id}/report`**
- **Must contain:** **Weeks** picker; stars, visits, points, work, and a "missed Sunday" alert.
- **Print-friendly.**

**4.4 Certificate (parent view): `/p/certificates/{id}`**
- Club-branded printable certificate with a Print button.

### Group 5: Kid entry

**5.1 Kid sign-in: `/k/{club}`**
- **Who:** kids, on the club's page.
- **Must contain:**
  - "Hi, Champ!".
  - Field **Your username** (placeholder brave-lion-27).
  - The 12-picture PIN pad with 4 slots that fill.
  - Button **Let's go**.
  - "Forgot your pictures? Ask your teacher to set new ones."
  - Club logo and colour.
- **States:** wrong pictures, locked ("try again in 15 minutes"), club not active. Matches the landing's "NO PASSWORD" section.

**5.2 Champ Town home: `/k/{club}/home`**
- **Must contain:**
  - The 3D town map from the landing, with buildings: My House, My Class, My Teacher, Ears for You (Talk), Games, My Card, Sunday School (Quest), Leaderboard (Hall).
  - Points, streak, **Progress to next level** bar, level name (Rookie, Rising Star, All-Star, Legend, Champ).
- **Design both modes:**
  - **Champ:** the map.
  - **Little Champs:** 3 giant buttons, Play, Story, Trophies.

### Group 6: Kid world (both age modes for each)

| # | Route | Page | Must contain |
|---|---|---|---|
| 6.1 | `/k/{club}/class` | My Class | **Lessons** (memory verse, Take-Home), **Class work** with hand-in box and marks |
| 6.2 | `/k/{club}/messages` | Messages | Chat with club staff, **Send**; locked state "until your teacher confirms you" |
| 6.3 | `/k/{club}/events` | Events | Upcoming club events |
| 6.4 | `/k/{club}/games` | Games | **The Arena** game tiles: Verse/Word Scramble, Memory Match, Who Am I?, Word Search, Jigsaw, Ark/Star Catch; Road to Champ entry |
| 6.5 | `/k/{club}/arena/{game}` | Arena game | The game screen, score, "+points" celebration, "points once a day" note. One layout per game (6 games) |
| 6.6 | `/k/{club}/road` | Road to Champ (Training Ground) | **Pick your questions**, pack list, **Play** |
| 6.7 | `/k/{club}/road/{run}` | Training round | Question, 4 answers, Shot Clock, Half Time power-up, tier ladder, results |
| 6.8 | `/k/{club}/hall` | Hall of Champs | **Time period** switch (week, season, all time), ranked list `hall-list` (first names only, "(you)") |
| 6.9 | `/k/{club}/trophies` | Trophies | Trophy grid (earned or locked, `data-code`), **Certificates** |
| 6.10 | `/k/{club}/certificates/{id}` | My certificate | Big printable certificate |
| 6.11 | `/k/{club}/card` | Champ Card | Collectible ID card with avatar, level, club; flip animation |
| 6.12 | `/k/{club}/my-champ` | My Champ | Avatar editor: skin, hair, outfit, extras locked by level, Save |
| 6.13 | `/k/{club}/collection` | Champ collection | 12 collectibles unlocked by points, with a locked silhouette state |
| 6.14 | `/k/{club}/quest` | Faith Quest (Quest when faith mode is off) | Quest path list with progress |
| 6.15 | `/k/{club}/quest/{id}` | Quest step | Step story, checkpoint question with 3 answers, path progress |
| 6.16 | `/k/{club}/reading` | Reading plans | Today's reading, streak days, **I read it**, certificate at the end |
| 6.17 | `/k/{club}/verse` | Record-a-verse | Record, stop, play back and send; stars from the teacher |
| 6.18 | `/k/{club}/journal` | My journal | Pray for the World prompt, prayers, **Mark as answered**, notes, **Save**, **Delete**. Private |
| 6.19 | `/k/{club}/stuff` | My Stuff | Upload a picture, **Send to My Stuff**, "waiting for a grown-up" state, 20-picture cap |
| 6.20 | `/k/{club}/talk` | Talk to Someone | **Plain and calm.** Message box, anonymous option, **Send**, replies. Never gamified |
| 6.21 | `/k/{club}/buddy` | Champ Buddy (AI) | Chat with **Send**. States: off at club (`buddy-off`), needs parent yes, Pro plan only |
| 6.22 | `/k/{club}/alerts` | Alerts | Kid notifications list |

### Group 7: Staff tools (Teacher and Org Admin)

| # | Route | Page | Must contain |
|---|---|---|---|
| 7.1 | `/o/{club}/checkin` | Check-in | **Class** filter, kids to check in, checked-in list with **Pickup code** and **Check out**, **Release** with **Why? (logged, and the parent is told)**, **Attendance history** |
| 7.2 | `/o/{club}/talk` | Talk to Someone inbox | Concerns list, urgent first, status chips. Calm |
| 7.3 | `/o/{club}/talk/{id}` | Concern detail | **Conversation** with **Send reply**, **Staff notes** with **Save note**, **Status** with **Set status** and **Update**, open-access log |
| 7.4 | `/o/{club}/messages` | Messages | Conversations per kid, unread counts |
| 7.5 | `/o/{club}/messages/{kid}` | Conversation | Thread and **Send** |
| 7.6 | `/o/{club}/lessons` | Lessons | **New lesson**: **Title**, **Date (optional)**, **Memory verse (optional)**, **Talk: a question to ask at home**, **Do: something to do together**, class, draft or published, **Save lesson**; list |
| 7.7 | `/o/{club}/assignments` | Assignments | **New assignment**: **Title**, **Due (optional)**, **Save assignment**; list with hand-in counts |
| 7.8 | `/o/{club}/assignments/{id}` | Assignment | Submissions, **Mark /100**, **Feedback**, **Save mark** |
| 7.9 | `/o/{club}/events` | Events | **New event**: **Title**, **Where (optional)**, **Details (optional)**, date and time, **Add event**; list with **Remove** |
| 7.10 | `/o/{club}/hall` | Hall of Champs | **Classes** picker, board |
| 7.11 | `/o/{club}/quiz` | Road to Champ host | **Start a match**: pack, **Questions**, **Shot Clock**, **Go to the rules screen**; **Match history**; pending offline uploads |
| 7.12 | `/o/{club}/quiz/play` | Host game (big screen) | Rules screen, teams, question on a TV-sized layout, five tiers, Half Time / Ask the Squad / Coach's Call, Shot Clock, scoring, results. **Design for a projector and a laptop** |
| 7.13 | `/o/{club}/quiz/bank` | Question bank | Packs (club plus Champzz defaults), **New pack for your club**, **Pack name**, **Create pack** |
| 7.14 | `/o/{club}/quiz/bank/{pack}` | Question pack | Questions list, **Add a question**: **Question**, **Answer A–D**, **Right answer**, **Level**, **Why (optional, shown after)**, **Add question**, **Delete** |
| 7.15 | `/o/{club}/arena` | Arena content | **Game**, **Title**, content box, **Answer (Who Am I? only)**, **Add**, **Remove** |
| 7.16 | `/o/{club}/certificates` | Certificates | **Give a certificate**: **Kid**, **Title**, **Why (optional)**, **Issue certificate**; **Given so far** |
| 7.17 | `/o/{club}/certificates/{id}` | Certificate | Printable |
| 7.18 | `/o/{club}/tags` | Name tags | Printable name-tag sheet per class (avatar, name, username) |
| 7.19 | `/o/{club}/quests` | Quests | **Create quest** (**Quest title**, **One-line summary (optional)**), steps with **Step title**, **Checkpoint question**, **Answer 1–3**, **Right answer**, **Add step** |
| 7.20 | `/o/{club}/verses` | Verse recordings | Recordings list, audio player, **Mark heard**, **Give a star** |
| 7.21 | `/o/{club}/moderation` | Photo checks | Kid pictures waiting: **Approve**, **Reject** |
| 7.22 | `/o/{club}/search` | Search | Search box (kids, lessons, class work, events), **Search**, grouped results |

### Group 8: Club management (Team, Settings, Seasons and Audit log are Org Admin only; the rest are shared with teachers)

| # | Route | Page | Must contain |
|---|---|---|---|
| 8.1 | `/o/{club}/team` | Team | **People** with **Change role**, **Save role**, remove (**Yes, remove**; the last Org Admin is protected); **Invite someone** (**Role**, **Their email (optional, a note for you)**, **Create invite link**, a copy-link state); **Invites** with **Cancel invite** |
| 8.2 | `/o/{club}/settings` | Club settings | **Club name**, **Tagline (shown on your Clubhouse page)**, motto, brand colour (live preview), faith mode switch, **Time zone**, **Save settings**; **Logo** with **Upload logo**; **Champ Buddy (AI helper)** switch "Switch on Champ Buddy for our club" (Pro only) with **Save** |
| 8.3 | `/o/{club}/insights` | Insights | Stat tiles (**Kids**, **Here today**, **New, not yet confirmed**, **Champ Points this week**, **Work handed in this week**), attendance trend chart, **Not seen in 3 weeks**, **Download your data** (CSV: kids, attendance, points) |
| 8.4 | `/o/{club}/seasons` | Seasons | **Name** (placeholder Autumn term), **Starts**, **Ends**, **Save season**, list with **Remove** |
| 8.5 | `/o/{club}/posts` | Clubhouse posts | **Title**, body, draft or publish, **Save post**, **Delete** |
| 8.6 | `/o/{club}/media` | Digital Bank | **Title**, file, **Who can see it** (team only or families), **Upload**, list with **Delete** |
| 8.7 | `/o/{club}/buddy` | Champ Buddy log | **Needs a look** (flagged first), chat logs per kid |
| 8.8 | `/o/{club}/audit` | Audit log | Filterable table: who, what, when |

### Group 9: Super Admin (Banks only)

| # | Route | Page | Must contain |
|---|---|---|---|
| 9.1 | `/console` | Super Admin | **Organizations** table: name, status, plan, kids, paid until; filters (pending first) |
| 9.2 | `/console/orgs/{id}` | Organization | Details; **Mark as paid** form (**Plan**, **Billing**, **Paid until**, **Amount received**, **Currency**, **Method**, **Note (optional)**); **Payments** history; suspend or lift with **Reason** |

### Group 10: Public info pages (same style as the landing)

| # | Route | Page | Must contain |
|---|---|---|---|
| 10.1 | `/features` | Features | **Jump to** (by role: kids, teachers, leaders, parents), every feature with Live or Coming soon tags, **Start building your club** CTA |
| 10.2 | `/safety` | Safety | "Safe by design": each promise (pickup codes, photo checks, private journals, anonymous Talk to Someone, club data separation, Champ Buddy rules) |
| 10.3 | `/pricing` | Pricing | "Simple monthly plans": Starter, Basic, Pro, Network, currency switch, kid limits, what's included, FAQ |
| 10.4 | `/privacy` | Privacy notice | Long-form legal reading layout: What we collect, What we do not collect from children, Why we use it, Who can see a child's information, Where it is stored, How long we keep it, Your choices, Who we are, Contact |
| 10.5 | `/terms` | Terms | Same layout: The service, Club accounts, Payment, Your content, Acceptable use, Contact |

### Group 11: Shared

| # | Route | Page | Must contain |
|---|---|---|---|
| 11.1 | `/notifications` | Notifications | List, read or unread, empty state |
| 11.2 | (any) | 404 / no access / 500 | Friendly crew illustration and a way home |
| 11.3 | (print) | Print styles | Certificates, weekly report, name tags |
| 11.4 | (new) | Forgot password, Reset password | Being built now (see 1.1) |

---

**Total: 74 screens** (the landing is done), plus 2 new screens (password reset), plus shared shells and states.
