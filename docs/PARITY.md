# CCT to Champzz parity map

Rule from Banks (2026-11-25): every page and feature CCT had, Champzz has too, upgraded, with nothing MFM-specific. Champzz adds more on top. Status is updated as each one ships.

Status key: **Live** (on champzz.vercel.app and tested), **Next** (in the current build batch), **Planned**.

## Public site

| CCT page | Champzz page | Upgrade | Status |
|---|---|---|---|
| Landing (`/`) | `/` full marketing site: hero, every feature section (kids, teachers, admins, parents), Road to Champ, games, safety, pricing, FAQ, CTA, "Built by Zebraish" at the end | No MFM content; light and fast on mobile data; real pricing from the database | Placeholder live, full page **Next** |
| Everything Inside (`/features`) | `/features` | Every feature, by role, with screenshots of the real product | **Next** |
| Safety (`/safety`) | `/safety` | Promises backed by tests (CCT's page promised things its database did not enforce) | **Next** |
| Anthem (`/anthem`) | Org-defined song or motto on each Clubhouse | Per org, not fixed MFM lyrics | Planned |
| (none) | `/pricing`, `/privacy`, `/terms` | New SaaS pages | **Next** |
| (none) | Clubhouse `/c/{club}` | Each club's own branded page with posts and events | Registration live, posts and events Planned |

## Quiz (CCT's centrepiece)

| CCT | Champzz | Status |
|---|---|---|
| Game Setup, Ground Rules, Gameplay, Results, Match Results, History, Seasons, Question Bank, Training | **Road to Champ**: setup, rules screen, host-led play on one screen, five tiers, Half Time / Ask the Squad / Coach's Call power-ups, Shot Clock, results, match history, seasons, question bank per club plus Champzz default packs, Training Ground solo mode, offline play | Planned (games phase) |

## Kids (CCT `/student`) becomes Champ Town `/k/{club}`

| CCT | Champzz | Status |
|---|---|---|
| Kid sign-in (name + guessable passcode) | Username + picture PIN with lockout | Live |
| Village Map home | Champ Town home, Champ and Little Champs age modes | Shell live, full **Next** |
| Bible Journey lessons | Faith Quest (Quest in secular clubs), content from the database | Planned |
| XP, streaks, badges | Champ Points ledger, Fire Streak, Trophies, levels | Planned |
| Character collection | Champ collection (data-driven, original art) | Planned |
| Leaderboard | Hall of Champs (class scoped, first names only, "new" kids hidden) | Planned |
| Bible Arcade (3 games) | The Arena: six games on one framework, XP on completion | Planned (games phase) |
| Pray for the World, Prayer Journal and Diary | Prayer and journal (faith mode), private notes | Planned |
| Personal Vault | My Stuff (moderated uploads, size caps) | Planned |
| Avatar Studio | My Champ avatar that grows with level | Planned |
| Digital ID card | Champ Card plus printable name tag | Planned |
| Class room: lessons, memory verse, assignments | Class room | Planned |
| Messages with teacher | Messages (visible to the club, safeguarding-first) | Planned |
| Ears for You | Talk to Someone (anonymity enforced in the database, escalation, audit log) | Planned |
| Bible Buddy (AI) | AI companion: off by default, Pro plan and up, parental consent | Planned |
| Ministry calendar | Events | Planned |
| Notifications bell | Notifications | Planned |

## Teachers (CCT `/teacher`) become the club workspace `/o/{club}`

| CCT | Champzz | Status |
|---|---|---|
| Apply to teach | Invite by Org Admin (plus optional request to join) | Planned |
| Classes, join code | Classes live, club-level join code | Live |
| Roster claiming, Student Code enrolment | Replaced by Clubhouse registration | Live |
| Attendance register and history | Check-in and check-out with guardian pickup codes, attendance history | Planned |
| Lectures, Sunday calendar unlocks | Lessons calendar | Planned |
| Assignments and grading | Assignments and grading | Planned |
| Certificates | Certificates (club branded, plus reading plans and levels) | Planned |
| Host a quiz | Road to Champ host mode | Planned |
| Ears inbox | Talk to Someone inbox | Planned |
| Bible Buddy log | AI companion log | Planned |
| Passcode reset | Picture PIN reset | Live |
| Avatar review queue | Photo moderation queue | Planned |
| Search | Search | Planned |
| Confirm new kids | Confirm at first visit | Live |

## Admins (CCT `/admin`) become the Org Admin workspace plus the Super Admin console

| CCT | Champzz | Status |
|---|---|---|
| Teacher applications, promote admins | Team management (invites, roles) | Planned |
| Classes at a glance, stats | Club dashboard and analytics | Partly live, analytics Planned |
| Seasons | Seasons | Planned |
| Bible reading plans | Reading plans (faith mode) | Planned |
| Ministry calendar | Events | Planned |
| Digital Bank | Media library | Planned |
| Safety tab | Safeguarding centre and audit log | Planned |
| (none) | Super Admin console: all clubs, Mark as paid, suspend | Live |
| (none) | Billing, plans, joining settings, kid limit | Live |

## Parents (CCT `/parent`)

| CCT | Champzz | Status |
|---|---|---|
| Sign up, link with FAM code | Parent account plus Clubhouse registration | Live |
| Per-child progress, star rating, printable report | Kid progress, weekly parent report | Planned |
| Take-Home Sunday | Take-Home (per club content) | Planned |
| Church calendar with .ics export | Events with calendar export | Planned |
| See Bible Buddy history | AI companion history (non-anonymous only) | Planned |
