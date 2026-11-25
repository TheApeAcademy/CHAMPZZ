// One source of truth for what Champzz offers and what has shipped. The
// landing, features and pricing pages read this, so a "Coming soon" tag
// disappears the moment a feature's status flips to "live".

export type FeatureStatus = "live" | "soon";
export type Audience = "kids" | "teachers" | "leaders" | "parents";

export type Feature = {
  key: string;
  name: string;
  blurb: string;
  audience: Audience;
  status: FeatureStatus;
  faithOnly?: boolean;
  /** Placeholder art (see docs/ASSETS.md); swapped for original art before launch. */
  art?: string;
};

export const FEATURES: Feature[] = [
  // kids
  { key: "pin", audience: "kids", status: "live", name: "Picture PIN sign-in", blurb: "No email, no password to forget. Kids tap 4 pictures. Too many wrong tries and the account locks until a teacher helps.", art: "champ-card" },
  { key: "town", audience: "kids", status: "live", name: "Champ Town", blurb: "A bright home base that grows with them. Little Champs mode for ages 4 to 8 with big buttons and fewer words.", art: "house" },
  { key: "road", audience: "kids", status: "live", name: "Road to Champ", blurb: "The quiz show. Climb from Rookie to Champ with power-ups and a shot clock. Teams or solo, on one big screen, even offline.", art: "quiz" },
  { key: "arena", audience: "kids", status: "live", name: "The Arena", blurb: "Six games: Verse Scramble, Memory Match, Who Am I?, Word Search, Jigsaw and Ark Catch. Clubs add their own content.", art: "game-rocket" },
  { key: "quest", audience: "kids", status: "live", name: "Faith Quest", blurb: "Bite-size lessons with checkpoints. Called Quest in clubs that switch faith content off.", faithOnly: false, art: "bible" },
  { key: "points", audience: "kids", status: "live", name: "Champ Points, Fire Streak and Trophies", blurb: "Points for learning and playing, a daily streak, and trophies including limited-time seasonal ones.", art: "flame" },
  { key: "hall", audience: "kids", status: "live", name: "Hall of Champs", blurb: "Leaderboards inside the class only, first names only. Never public.", art: "trophy" },
  { key: "mychamp", audience: "kids", status: "live", name: "My Champ", blurb: "An avatar that grows as they level up.", art: "robot-coins" },
  { key: "classroom", audience: "kids", status: "live", name: "My Class", blurb: "Lessons, class work and messages with their teachers, all in one place. Hand in work and earn Champ Points.", art: "school" },
  { key: "card", audience: "kids", status: "live", name: "Champ Card", blurb: "A digital ID card, plus printable name tags for check-in.", art: "champ-card" },
  { key: "talk", audience: "kids", status: "live", name: "Talk to Someone", blurb: "A calm, private way to tell a trusted adult something is wrong, with anonymity protected by the database itself.", art: "heart-tree" },
  { key: "verse", audience: "kids", status: "soon", name: "Record-a-verse", blurb: "Kids record their memory verse and teachers award stars.", faithOnly: true, art: "book" },
  // teachers
  { key: "classes", audience: "teachers", status: "live", name: "Classes and kid list", blurb: "Every kid in your club in one list, with a one-tap confirm for new kids at their first visit.", art: "class" },
  { key: "stars", audience: "teachers", status: "live", name: "Give stars", blurb: "Spot a kid doing well? Give a star worth 10 Champ Points. Up to 5 per kid a day.", art: "trophy" },
  { key: "pinreset", audience: "teachers", status: "live", name: "PIN resets", blurb: "A kid forgot their pictures? Set new ones in seconds. Every reset is logged." },
  { key: "inbox", audience: "teachers", status: "live", name: "Talk to Someone inbox", blurb: "Urgent alerts, replies, private staff notes and escalation. Every time a message is opened it is logged." },
  { key: "checkin", audience: "teachers", status: "live", name: "Check-in and pickup codes", blurb: "Secure check-in and check-out with guardian pickup codes and printable name tags.", art: "school" },
  { key: "attendance", audience: "teachers", status: "live", name: "Attendance", blurb: "Mark the register on a phone and see trends over the term." },
  { key: "lessons", audience: "teachers", status: "live", name: "Lessons and assignments", blurb: "Publish lessons, set work, mark it and send feedback." },
  { key: "host", audience: "teachers", status: "live", name: "Host Road to Champ", blurb: "Run the quiz show for the whole room from one screen.", art: "quiz" },
  { key: "certs", audience: "teachers", status: "live", name: "Certificates", blurb: "Printable, club-branded certificates for finished plans and levels.", art: "trophy" },
  // leaders
  { key: "clubhouse", audience: "leaders", status: "live", name: "Your Clubhouse", blurb: "Your club's own page where families join with your code. Your name, your link.", art: "cabin" },
  { key: "joincode", audience: "leaders", status: "live", name: "Join codes you control", blurb: "Share one code with families. Leaked? Make a new one and the old one stops working instantly." },
  { key: "joining", audience: "leaders", status: "live", name: "Open or approval joining", blurb: "Let verified parents add kids straight away, or approve every kid yourself." },
  { key: "billing", audience: "leaders", status: "live", name: "Simple billing", blurb: "Monthly plans by club size. Pay online or by bank transfer." },
  { key: "brand", audience: "leaders", status: "live", name: "Your logo and colours", blurb: "Champzz wears your club's colours inside your space." },
  { key: "faith", audience: "leaders", status: "live", name: "Faith mode", blurb: "On for churches and ministries, off for clubs and schools. Bible plans, verses and Bible games follow the switch." },
  { key: "team", audience: "leaders", status: "live", name: "Team invites", blurb: "Invite teachers by email and choose who can do what." },
  { key: "analytics", audience: "leaders", status: "live", name: "Attendance and engagement analytics", blurb: "See who is coming, who is learning and who you have not seen in a while." },
  { key: "export", audience: "leaders", status: "live", name: "Data export", blurb: "Download your club's data any time. It is yours." },
  // parents
  { key: "addchild", audience: "parents", status: "live", name: "Add your child safely", blurb: "Sign in, enter the club's code, give consent. We only ask for a first name and a surname initial.", art: "heart-tree" },
  { key: "mykids", audience: "parents", status: "live", name: "My kids", blurb: "See each child's username and status in one place." },
  { key: "report", audience: "parents", status: "live", name: "Weekly report", blurb: "What they learned, their streak and their new trophies, every week.", art: "rocket" },
  { key: "takehome", audience: "parents", status: "live", name: "Take-Home", blurb: "A short talk, do and pray (or reflect) card to carry the lesson home." },
  { key: "calendar", audience: "parents", status: "live", name: "Club calendar", blurb: "Events you can add to your own phone calendar." },
];

export const AUDIENCES: { key: Audience; title: string; lead: string; art: string }[] = [
  { key: "kids", title: "For kids", lead: "Big buttons, bright colours, games worth coming back for.", art: "house" },
  { key: "teachers", title: "For teachers", lead: "Run a class from your phone in minutes, not hours.", art: "teacher" },
  { key: "leaders", title: "For club leaders", lead: "Everything your club needs, under your name.", art: "school" },
  { key: "parents", title: "For parents", lead: "Know what your child is learning, and that they are safe.", art: "heart-tree" },
];

export const GAMES = ["Verse Scramble", "Memory Match", "Who Am I?", "Word Search", "Jigsaw", "Ark Catch"];
