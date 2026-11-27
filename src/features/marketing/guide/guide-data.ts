// How Champzz works, role by role. Plain words, short steps, real screen names.
// Used by the landing page guide, the /guide page and the pitch deck.

export type GuideStep = { title: string; body: string; where: string; art: string };
export type GuideRole = {
  key: "leaders" | "teachers" | "parents" | "kids";
  label: string;
  who: string;
  promise: string;
  color: string;
  ink: string;
  tint: string;
  character: string;
  steps: GuideStep[];
  tip: string;
};

const A = "/placeholders/landing";

export const GUIDE: GuideRole[] = [
  {
    key: "leaders",
    label: "Club leaders",
    who: "Pastors, ministry heads and club founders",
    promise: "Your club online in an afternoon.",
    color: "#2F5BFF",
    ink: "#FFFFFF",
    tint: "#DDE4FF",
    character: "/landing/leader.webp",
    steps: [
      { title: "Start your club", body: "Create an account, then give your club a name and a web address. You get 14 days free for up to 15 kids, no card needed.", where: "Start your club", art: `${A}/icons-sunday-school-church.webp` },
      { title: "Make it yours", body: "Add your logo, colour and motto. Faith mode turns on memory verses, Faith Quest and the Bible games.", where: "Staff HQ › Settings", art: `${A}/village-profile-card.webp` },
      { title: "Add classes and teachers", body: "Make a class for each age group. Send each teacher an invite link by WhatsApp, text or email.", where: "Staff HQ › Team", art: `${A}/teacher-isometric.webp` },
      { title: "Share your join code", body: "Parents type your join code on your Clubhouse page to add their child. You can pause joining or approve every child.", where: "Staff HQ › Overview", art: `${A}/feature-class.webp` },
      { title: "Post news and events", body: "Your Clubhouse page is your club's front door: news, events, your motto and the Add your child form.", where: "Clubhouse posts", art: `${A}/kids-village-map.webp` },
      { title: "Watch it grow", body: "See who came on Sunday, who has not been seen in 3 weeks, and the points kids earn. Choose a plan when you are ready.", where: "Insights", art: `${A}/feature-leaderboard.webp` },
    ],
    tip: "Everything is set up for you to run on Sunday morning from your phone.",
  },
  {
    key: "teachers",
    label: "Teachers",
    who: "Sunday school and club volunteers",
    promise: "Sunday morning, sorted.",
    color: "#1E8F5A",
    ink: "#FFFFFF",
    tint: "#DCF5E6",
    character: "/landing/teacher.webp",
    steps: [
      { title: "Accept your invite", body: "Open the link your club leader sent you and sign in. You land straight in your club's Staff HQ.", where: "Your invite link", art: `${A}/village-messages-teacherhome.webp` },
      { title: "Check kids in", body: "Pick your class and tap each child as they arrive. Their parent gets a 4-number pickup code, and you check them out with it.", where: "Check-in", art: `${A}/feature-class.webp` },
      { title: "Add this week's lesson", body: "Give it a title, the memory verse and a Take-Home card: one question to talk about and one thing to do together.", where: "Lessons", art: `${A}/village-bible-book.webp` },
      { title: "Give stars, mark work", body: "A star adds Champ Points and makes a child's day. Set class work and mark it out of 100.", where: "Overview › Kids", art: `${A}/feature-achievements.webp` },
      { title: "Play Road to Champ", body: "Put the quiz on a TV or projector. Teams answer, five levels, a Shot Clock and Half Time. The room goes wild.", where: "Road to Champ", art: `${A}/feature-quiz.webp` },
      { title: "Listen when a child speaks up", body: "Talk to Someone messages come to you first, urgent ones at the top. A child can stay anonymous.", where: "Talk to Someone", art: `${A}/village-ears-hearttree.webp` },
    ],
    tip: "Every page works on a phone, so you can run the whole morning from the room.",
  },
  {
    key: "parents",
    label: "Parents",
    who: "Mums, dads and every grown-up who cares",
    promise: "See the week, not just Sunday.",
    color: "#FF5A3C",
    ink: "#0B1026",
    tint: "#FDE2DE",
    character: "/landing/parents-peek.webp",
    steps: [
      { title: "Create a parent account", body: "Use your email and a password. It takes a minute and it is free for families.", where: "Sign in › I'm a parent", art: `${A}/village-home-brickbuilding.webp` },
      { title: "Open your club's page", body: "Your club leader will share a link to their Clubhouse page. You can also search for it in Clubs.", where: "Clubs", art: `${A}/icons-sunday-school-church.webp` },
      { title: "Add your child", body: "Type the join code, your child's first name and the first letter of their surname, then pick 4 pictures together.", where: "Clubhouse › Add your child", art: `${A}/village-profile-card.webp` },
      { title: "Write down the username", body: "Your child gets a username like brave-lion-27. With their 4 pictures, that is all they need to sign in. No email, no password.", where: "After you add them", art: `${A}/stone-render.webp` },
      { title: "Follow their progress", body: "See Champ Points, Fire Streak, trophies, certificates and a weekly report. Pickup codes show up here on club days.", where: "My kids", art: `${A}/icons-streak-flame.webp` },
      { title: "Keep it going at home", body: "Each lesson comes with a Take-Home card. One question, one small thing to do together. That is the whole homework.", where: "Weekly report", art: `${A}/village-bible-book.webp` },
    ],
    tip: "Your child's data belongs to your family and your club. Nothing is ever public.",
  },
  {
    key: "kids",
    label: "Kids",
    who: "Champs aged 4 to 14",
    promise: "Kids don't log in. They level up.",
    color: "#F2B33D",
    ink: "#0B1026",
    tint: "#FCEBC4",
    character: "/landing/daye-sit.webp",
    steps: [
      { title: "Sign in with pictures", body: "Type your username, then tap your 4 secret pictures in the same order. Forgot them? Ask your teacher.", where: "Hi, Champ!", art: `${A}/feature-rocket.webp` },
      { title: "Explore Champ Town", body: "Tap any building to go in: your class, the Arena, Sunday School, the Hall of Champs and your own house.", where: "Champ Town", art: `${A}/kids-village-map.webp` },
      { title: "Play and earn points", body: "Six Arena games and Road to Champ. Every game gives you Champ Points once a day, so practise as much as you like.", where: "The Arena", art: `${A}/village-game-rocket.webp` },
      { title: "Keep your Fire Streak", body: "Come back each week and watch your Fire Streak grow. Read your plan and say your memory verse.", where: "Sunday School", art: `${A}/icons-streak-flame.webp` },
      { title: "Level up", body: "Go from Rookie to Rising Star, All-Star, Legend and Champ. Win trophies and unlock new looks for My Champ.", where: "Trophies", art: `${A}/feature-achievements.webp` },
      { title: "Worried? Tell someone", body: "Talk to Someone lets you tell a trusted grown-up. You can keep your name hidden.", where: "Talk to Someone", art: `${A}/village-ears-hearttree.webp` },
    ],
    tip: "Little Champs (ages 4 to 8) get bigger buttons, more pictures and less reading.",
  },
];
