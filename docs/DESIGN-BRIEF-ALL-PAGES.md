# Champzz: every page that needs designing

The landing page (`/`) is designed. Below are **all the other pages in the app**: who sees each one, what it's for, and what's on it today. The design direction is yours. Take the landing page as the starting point and go wherever you think is best.

**One functional note.** Keep the wording of buttons and form fields as listed (for example **Sign in**, **Email**, **Add my child**). The app's sign-in and its automated tests find things by those words. Everything else, including layout, structure, flow and visuals, is open.

The app is used mostly on phones.

---

## Fixes for the landing page (phone, 360px wide)

1. The hero word "CHAMPIONS" is squashed into unreadable vertical pillars.
2. The side section-dots rail sits on top of text and cards.
3. "Ellie's memory verse" wraps to 2 or 3 letters per line.
4. "Faith that sticks after Sunday" is very small, and the globe covers the text.
5. "CHAMPZZ PRESENTS · MEET THE CREW" and "02 / 03" wrap onto two lines.

Also: the footer logo sometimes shows only "Cha" (the animation doesn't finish). And the header says "Champions" while other docs say the brand is "CHAMPZZ". Banks to confirm which.

---

## The people who use it

- **Visitor:** a church or club leader looking at Champzz, or a parent finding their club.
- **Org Admin:** runs a club (pastor, ministry head, club founder) and pays for it.
- **Teacher:** runs classes on the day.
- **Parent:** adds their kids and follows their progress.
- **Kid:** ages 4 to 14 in two modes, Champ (9 to 14) and Little Champs (4 to 8, more pictures, less reading). Signs in with a username and 4 pictures, no password.
- **Super Admin:** Banks, running the platform.

---

## Pages

### Accounts
| Page | Route | Who | What it does and what's on it |
|---|---|---|---|
| Sign in | `/login` | Adults | **Email**, **Password**, **Sign in**; links to Create account and **Forgot your password?**; a message when an email link has expired |
| Create account | `/signup` | Adults | **Your name**, **Email**, **Password** (at least 10 characters), **Create account**; then "Check your email to confirm" |
| Reset your password | `/forgot-password` | Adults | **Email**, **Send reset link**; then "a reset link is on its way" |
| Choose a new password | `/reset-password` | Adults (from the email link) | **New password**, **Type it again**, **Save new password**; an expired-link state |
| Set up your club | `/onboarding` | New Org Admin | **Club or ministry name**, **Web address**, **What kind of organization?**, **Country**, **Time zone**, **Billing currency**, **Create my club** |
| Join a team | `/join/{invite}` | Invited teacher or admin | Accept an invite to a club (**Accept invite**); asks them to sign in or create an account first |

### Club dashboard and payment
| Page | Route | Who | What it does and what's on it |
|---|---|---|---|
| Club overview | `/o/{club}` | Org Admin, Teacher | Club name and status (pending, active, grace, read-only, suspended).<br>Org Admin while unpaid: **Choose a plan** (plans, prices, kid limits, **Pay online**, or "card payments coming soon") and **Pay by bank transfer** (bank, account number, account name, reference).<br>Then: active kids against the limit, current plan and paid-until date, join code (**New code**).<br>**Classes** (**New class name**, **Age band**, **Add class**, **Teacher**, **Class**, **Add teacher to class**).<br>**Joining** (**How kids join**, **Save**).<br>**Kids** list (**Confirm**, **Approve**, **Give a star**, **Set new PIN**, class) |

### Clubhouse (each club's public page)
| Page | Route | Who | What it does and what's on it |
|---|---|---|---|
| Clubhouse | `/c/{club}` | Public, parents | The club's own page: logo, colour, name, tagline, motto, **News**.<br>**Add your child**: **Join code**, **Child's first name**, **Surname initial**, pick 4 pictures out of 12, a parent consent checkbox, **Add my child**. Then show the child's new username.<br>States: wrong code, club full, waiting for approval |

### Parents
| Page | Route | Who | What it does and what's on it |
|---|---|---|---|
| My kids | `/p` | Parent | Each child's points, streak and level; **At the club now** (pickup codes); **Certificates**; **Club events** (add to calendar); **Files from the club** |
| Child progress | `/p/kids/{id}` | Parent | Level and avatar, **Trophies**, **Certificates**, **Class work** with marks, **Recent visits**, **My Stuff** pictures, **Champ Buddy** history and the yes/no consent, Take-Home card |
| Weekly report | `/p/kids/{id}/report` | Parent | Choose a week (**Weeks**): stars, visits, points, work, missed-Sunday alert. Printable |
| Certificate | `/p/certificates/{id}` | Parent | The child's certificate, printable |

### Kids (Champ Town)
| Page | Route | What it does and what's on it |
|---|---|---|
| Kid sign-in | `/k/{club}` | **Your username**, a 12-picture pad (pick 4), **Let's go**; "Forgot your pictures? Ask your teacher"; wrong-pictures and locked-out states |
| Home | `/k/{club}/home` | The kid's town: points, streak, level, **Progress to next level**, and the way into every area below. Champ and Little Champs versions |
| My Class | `/k/{club}/class` | **Lessons** (memory verse, Take-Home) and **Class work** (hand in, see marks) |
| Messages | `/k/{club}/messages` | Chat with club staff, **Send**; locked until a teacher confirms the kid |
| Events | `/k/{club}/events` | Club events |
| Games | `/k/{club}/games` | **The Arena** (6 games) and Road to Champ |
| Arena game | `/k/{club}/arena/{game}` | One page per game: Verse Scramble, Memory Match, Who Am I?, Word Search, Jigsaw, Ark Catch. Points once a day |
| Road to Champ | `/k/{club}/road` | Solo practice: **Pick your questions**, **Play** |
| Practice round | `/k/{club}/road/{run}` | Questions, answers, timer, Half Time, levels, result |
| Hall of Champs | `/k/{club}/hall` | Class leaderboard by **Time period**, first names only |
| Trophies | `/k/{club}/trophies` | Earned and locked trophies, **Certificates** |
| My certificate | `/k/{club}/certificates/{id}` | A certificate |
| Champ Card | `/k/{club}/card` | The kid's ID card |
| My Champ | `/k/{club}/my-champ` | Avatar maker; extras unlock by level |
| Champ collection | `/k/{club}/collection` | 12 collectibles unlocked by points |
| Faith Quest (Quest when faith mode is off) | `/k/{club}/quest` | List of quests with progress |
| Quest step | `/k/{club}/quest/{id}` | A story step and a checkpoint question |
| Reading plans | `/k/{club}/reading` | Today's reading, **I read it**, certificate at the end |
| Record-a-verse | `/k/{club}/verse` | Record the memory verse and **Send to my teacher** |
| Prayer and journal | `/k/{club}/journal` | Private prayers and notes: **Save**, **Mark as answered**, **Delete** |
| My Stuff | `/k/{club}/stuff` | Upload pictures (**Send to My Stuff**); a grown-up checks them first |
| Talk to Someone | `/k/{club}/talk` | Tell a trusted adult something, anonymously if they want (**Send**); see replies. A safeguarding page |
| Champ Buddy | `/k/{club}/buddy` | AI helper chat (**Send**); off unless the club and the parent both say yes; Pro plan only |
| Alerts | `/k/{club}/alerts` | The kid's notifications |

### Staff (Org Admin and Teacher)
| Page | Route | What it does and what's on it |
|---|---|---|
| Check-in | `/o/{club}/checkin` | Check kids in by **Class**; check out with the parent's **Pickup code**; **Release** with **Why?**; **Attendance history** |
| Talk to Someone inbox | `/o/{club}/talk` | Concerns from kids, urgent first |
| Concern | `/o/{club}/talk/{id}` | **Conversation** (**Send reply**), **Staff notes** (**Save note**), **Status** (**Set status**, **Update**) |
| Messages | `/o/{club}/messages` | One conversation per kid |
| Conversation | `/o/{club}/messages/{kid}` | Thread, **Send** |
| Lessons | `/o/{club}/lessons` | **New lesson** (**Title**, **Date (optional)**, **Memory verse (optional)**, **Talk: a question to ask at home**, **Do: something to do together**, **Save lesson**) and the list |
| Assignments | `/o/{club}/assignments` | **New assignment** (**Title**, **Due (optional)**, **Save assignment**) and the list |
| Assignment | `/o/{club}/assignments/{id}` | Kids' work; **Mark /100**, **Feedback**, **Save mark** |
| Events | `/o/{club}/events` | **New event** (**Title**, **Where (optional)**, **Details (optional)**, **Add event**) and the list |
| Hall of Champs | `/o/{club}/hall` | Leaderboard by **Classes** |
| Road to Champ | `/o/{club}/quiz` | **Start a match** (**Questions**, **Shot Clock**, **Go to the rules screen**), **Match history** |
| Host a match | `/o/{club}/quiz/play` | The live quiz on one shared screen (projector or TV): rules, teams, questions, five levels, Half Time, Ask the Squad, Coach's Call, Shot Clock, scores, result |
| Question bank | `/o/{club}/quiz/bank` | Question packs; **Pack name**, **Create pack** |
| Question pack | `/o/{club}/quiz/bank/{pack}` | Questions; **Add a question** (**Question**, **Answer A–D**, **Right answer**, **Level**, **Why (optional, shown after)**, **Add question**), **Delete** |
| Arena content | `/o/{club}/arena` | The club's own game content (**Game**, **Title**, **Add**, **Remove**) |
| Certificates | `/o/{club}/certificates` | **Give a certificate** (**Kid**, **Title**, **Why (optional)**, **Issue certificate**), **Given so far** |
| Certificate | `/o/{club}/certificates/{id}` | Printable certificate |
| Name tags | `/o/{club}/tags` | Printable name tags per class |
| Quests | `/o/{club}/quests` | Write quests (**Quest title**, steps, **Checkpoint question**, **Answer 1–3**, **Right answer**, **Add step**, **Create quest**) |
| Verse recordings | `/o/{club}/verses` | Listen to kids' recordings, **Mark heard**, **Give a star** |
| Photo checks | `/o/{club}/moderation` | Kids' pictures waiting for a check: **Approve**, **Reject** |
| Clubhouse posts | `/o/{club}/posts` | News for the Clubhouse page (**Title**, draft or published, **Save post**, **Delete**) |
| Digital Bank | `/o/{club}/media` | Club files (**Title**, **Who can see it**, **Upload**, **Delete**) |
| Champ Buddy log | `/o/{club}/buddy` | Kids' AI chats, **Needs a look** first |
| Insights | `/o/{club}/insights` | Kids, here today, new, points this week, work handed in, attendance trend, **Not seen in 3 weeks**, **Download your data** |
| Search | `/o/{club}/search` | Search kids, lessons, class work and events |

### Org Admin only
| Page | Route | What it does and what's on it |
|---|---|---|
| Team | `/o/{club}/team` | **People** (**Change role**, **Save role**, remove), **Invite someone** (**Role**, **Create invite link**), **Invites** (**Cancel invite**) |
| Club settings | `/o/{club}/settings` | **Club name**, **Tagline**, motto, colour, faith mode, **Time zone**, **Save settings**; **Logo** (**Upload logo**); **Champ Buddy (AI helper)** switch |
| Seasons | `/o/{club}/seasons` | **Name**, **Starts**, **Ends**, **Save season**, list |
| Audit log | `/o/{club}/audit` | Who did what, when |

### Super Admin
| Page | Route | What it does and what's on it |
|---|---|---|
| Console | `/console` | All **Organizations** with status |
| Organization | `/console/orgs/{id}` | Club details, **Mark as paid** (**Plan**, **Billing**, **Paid until**, **Amount received**, **Currency**, **Method**, **Note (optional)**), **Payments** history, suspend or lift (**Reason**) |

### Public pages
| Page | Route | What's on it |
|---|---|---|
| Features | `/features` | Every feature by audience, live or coming soon |
| Safety | `/safety` | How kids are kept safe |
| Pricing | `/pricing` | Starter, Basic, Pro, Network |
| Privacy notice | `/privacy` | Legal text |
| Terms | `/terms` | Legal text |

### Shared
| Page | Route | What's on it |
|---|---|---|
| Notifications | `/notifications` | Adult notifications |
| Not found, no access, error | (any) | When something isn't there or goes wrong |

**76 pages in total**, plus the landing fixes above.
