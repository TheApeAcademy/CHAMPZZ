# CCT to Champzz parity map

Rule from Banks (2026-11-25): every page and feature CCT had, Champzz has too, upgraded, with nothing MFM-specific. Champzz adds more on top. Status is updated as each one ships.

Status key: **Live** (on champzz.vercel.app and tested), **Next** (in the current build batch), **Planned**.

## Public site

| CCT page | Champzz page | Upgrade | Status |
|---|---|---|---|
| Landing (`/`) | `/` full marketing site: hero, every feature section (kids, teachers, admins, parents), Road to Champ, games, safety, pricing, FAQ, CTA, "Built by Zebraish" at the end | No MFM content; light and fast on mobile data; real pricing from the database; unfinished features tagged Coming soon | **Live** |
| Everything Inside (`/features`) | `/features` | Every feature, by role, with live or Coming soon status | **Live** |
| Safety (`/safety`) | `/safety` | Promises backed by tests (CCT's page promised things its database did not enforce) | **Live** |
| Anthem (`/anthem`) | Org-defined song or motto on each Clubhouse | Per org, not fixed MFM lyrics | **Live** |
| (none) | `/pricing`, `/privacy`, `/terms` | New SaaS pages (privacy and terms are drafts pending legal review) | **Live** |
| (none) | Clubhouse `/c/{club}` | Each club's own branded page: logo, colour, motto, news posts and registration (events stay members-only for safety) | **Live** |

## Quiz (CCT's centrepiece)

| CCT | Champzz | Status |
|---|---|---|
| Game Setup, Ground Rules, Gameplay, Results, Match Results, History, Seasons, Question Bank, Training | **Road to Champ**: setup, rules screen, host-led play on one screen, five tiers, Half Time / Ask the Squad / Coach's Call power-ups, Shot Clock, results, match history, seasons, question bank per club plus Champzz default packs, Training Ground solo mode, offline play | **Live** (host results save later when offline; question bank per club; Training Ground answers checked by the server) |

## Kids (CCT `/student`) becomes Champ Town `/k/{club}`

| CCT | Champzz | Status |
|---|---|---|
| Kid sign-in (name + guessable passcode) | Username + picture PIN with lockout | Live |
| Village Map home | Champ Town home, Champ and Little Champs age modes | **Live** |
| Bible Journey lessons | Faith Quest (Quest in secular clubs): steps open in order, checkpoint answers checked by the server, clubs write their own | **Live** |
| XP, streaks, badges | Champ Points ledger, Fire Streak (club time zone), Trophies incl. seasonal, five levels | **Live** (earned by daily visits and teacher stars; games and lessons add more later) |
| Character collection | Champ collection: 12 collectibles unlocked by Champ Points | **Live** (simple icon art; swap for illustrated characters later) |
| Leaderboard | Hall of Champs (class scoped, first names only, "new" kids hidden) | **Live** |
| Bible Arcade (3 games) | The Arena: Verse/Word Scramble, Memory Match, Who Am I?, Word Search, Jigsaw, Ark/Star Catch; Champ Points once per game per day; clubs add their own content | **Live** |
| Pray for the World, Prayer Journal and Diary | Prayer and journal: daily Pray for the World prompt, prayers marked answered, thanks and notes; private to the child | **Live** |
| Personal Vault | My Stuff: private bucket, checked by a grown-up before parents see it, 1 MB and 20-picture caps | **Live** |
| Avatar Studio | My Champ avatar that grows with level, extras unlock by level | **Live** |
| Digital ID card | Champ Card plus printable name tags for teachers | **Live** |
| Class room: lessons, memory verse, assignments | My Class: lessons, memory verse (faith mode), class work with hand-in and marks | **Live** |
| Messages with teacher | Messages (visible to all club staff, locked until the kid is confirmed) | **Live** |
| Memory verse | Record-a-verse: kids record, teachers listen and give stars (faith mode) | **Live** |
| Ears for You | Talk to Someone (anonymity enforced in the database, escalation, audit log) | **Live** |
| Bible Buddy (AI) | Champ Buddy: Pro plan, club switch and per-child parental consent; names never sent; distress and contact details never reach the AI | **Live** (needs `ANTHROPIC_API_KEY` in production) |
| Ministry calendar | Events | **Live** |
| Notifications bell | Notifications | **Live** |

## Teachers (CCT `/teacher`) become the club workspace `/o/{club}`

| CCT | Champzz | Status |
|---|---|---|
| Apply to teach | Invite link from an Org Admin (works once, 7 days); request-to-join later | **Live** |
| Classes, join code | Classes live, club-level join code | Live |
| Roster claiming, Student Code enrolment | Replaced by Clubhouse registration | Live |
| Attendance register and history | Check-in and check-out with guardian pickup codes (5-try lock, logged Org Admin release), attendance history, +10 Champ Points | **Live** |
| Lectures, Sunday calendar unlocks | Lessons (draft or published, dated, per class or whole club) | **Live** |
| Assignments and grading | Assignments and grading (+10 Champ Points on hand-in) | **Live** |
| Certificates | Club-branded printable certificates, seen by the kid and their parents | **Live** |
| Host a quiz | Road to Champ host mode, match history, seasons | **Live** |
| Ears inbox | Talk to Someone inbox (urgent alerts, staff notes, escalation, open log) | **Live** |
| Bible Buddy log | Champ Buddy log with flagged chats first | **Live** |
| Passcode reset | Picture PIN reset | Live |
| Avatar review queue | Photo checks queue for My Stuff (rejected pictures are deleted) | **Live** |
| Search | Search kids, lessons, class work and events | **Live** |
| Confirm new kids | Confirm at first visit | Live |

## Admins (CCT `/admin`) become the Org Admin workspace plus the Super Admin console

| CCT | Champzz | Status |
|---|---|---|
| Teacher applications, promote admins | Team: invites, roles, remove (last Org Admin protected) | **Live** |
| Classes at a glance, stats | Club dashboard plus Insights (attendance trend, not seen in 3 weeks, weekly points) | **Live** |
| Seasons | Seasons with a fresh Hall of Champs board each season | **Live** |
| Bible reading plans | Reading plans (faith mode): references and summaries, 5 Champ Points a day, a certificate at the end | **Live** |
| Ministry calendar | Events (Org Admin creates, in club time zone) | **Live** |
| Digital Bank | Digital Bank: private club files (PDF and images), team-only or shared with families | **Live** |
| Safety tab | Safeguarding centre and audit log | **Live** (Talk to Someone inbox, audit log viewer) |
| (none) | Super Admin console: all clubs, Mark as paid, suspend | Live |
| (none) | Billing, plans, joining settings, kid limit | Live |
| (none) | Club settings: logo, colour, tagline, motto, faith mode, time zone | **Live** |
| (none) | Data export (kids, attendance, Champ Points as CSV) | **Live** |

## Parents (CCT `/parent`)

| CCT | Champzz | Status |
|---|---|---|
| Sign up, link with FAM code | Parent account plus Clubhouse registration | Live |
| Per-child progress, star rating, printable report | Progress page (level bar, trophies, grades, visits) and a printable weekly report with stars, Sunday alert | **Live** |
| Take-Home Sunday | Take-Home card on every lesson: Talk, Do, Pray (Reflect when faith mode is off) | **Live** |
| Church calendar with .ics export | Events with .ics calendar export | **Live** |
| See Bible Buddy history | Champ Buddy history and the consent switch on each child's page | **Live** |
