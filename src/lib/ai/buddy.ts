import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Champ Buddy: a friendly helper for children, on Claude.
 *
 * Privacy: the child's name, club and any identifiers are never sent. Buddy
 * calls everyone "Champ". Messages that look like a child in distress, or
 * that contain contact details, never reach the model at all (see screen()).
 */

export const BUDDY_MODEL = "claude-opus-5-5";

export function buddyConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const DISTRESS = [
  /\b(kill|hurt|cut|harm)\s+(my ?self|me)\b/i, /\bsuicid/i, /\bwant(ed)? to die\b/i, /\bdon'?t want to (live|be alive)\b/i,
  /\b(hits?|hitting|beats?|beating|touch(ed|es|ing)?)\s+me\b/i, /\babus(e|ed|ing)\b/i, /\b(not|don'?t feel) safe\b/i, /\bunsafe\b/i,
  /\brun(ning)? away\b/i, /\bscared (at|of going) home\b/i, /\bbully(ing)? me\b/i, /\bsecret (touch|game)\b/i,
];
const CONTACT = [/[\w.+-]+@[\w-]+\.[\w.]+/, /(?:\d[\s-]?){7,}/, /\b(my|our) (address|house number|postcode|zip code)\b/i];

export const DISTRESS_REPLY =
  "I'm really glad you told me. I'm a computer helper, so I can't help with this the way a person can. " +
  "Please tell a trusted grown-up right now, like a parent, a teacher or a club leader. You can also use Talk to Someone in Champ Town. " +
  "If you are in danger, tell an adult near you straight away.";
export const CONTACT_REPLY =
  "Let's keep personal things like phone numbers, emails and addresses private, even from me! What else would you like to talk about?";

/** Decide before any AI call: "distress" and "contact" messages are answered here, never sent out. */
export function screen(text: string): "distress" | "contact" | "ok" {
  if (DISTRESS.some((r) => r.test(text))) return "distress";
  if (CONTACT.some((r) => r.test(text))) return "contact";
  return "ok";
}

function systemPrompt(faith: boolean): string {
  return [
    "You are Champ Buddy, a friendly helper inside Champzz, an app for children aged about 5 to 13 at clubs and church children's ministries.",
    "Call the child \"Champ\". Never ask for or repeat their name, age, school, address, phone number, email, photos or any other personal details.",
    "Answer in short, warm, simple sentences a young child can read: usually two to four sentences. Use plain words. No links, no lists of websites.",
    "Help with learning, curiosity, encouragement, kindness, feelings in a light way, and ideas for games, drawing and reading.",
    faith
      ? "This club is a church ministry. You may talk about the Bible and Christian faith gently and accurately, quoting only short, well-known verses. Do not argue about denominations."
      : "This club is not faith-based. Do not bring up religion unless the child asks; if they do, answer briefly and respectfully.",
    "You are a computer helper, not a person, and you say so if asked. Never pretend to be a human, a friend in real life, or a grown-up they know.",
    "Never suggest meeting anyone, keeping secrets from parents or teachers, or moving to another app or chat.",
    "If the child seems sad, scared, hurt, in danger, or mentions anyone hurting them, kindly tell them to talk to a trusted grown-up right away and to use Talk to Someone in Champ Town. Do not try to handle it yourself.",
    "Refuse anything unsafe, violent, sexual, hateful, or not suitable for young children, kindly and briefly, and suggest something fun instead.",
    "Do not do homework for them; help them think it through with hints and questions.",
  ].join("\n");
}

export type BuddyTurn = { role: "kid" | "buddy"; body: string };

/** One reply from Claude, given recent history (oldest first). */
export async function askBuddy(history: BuddyTurn[], text: string, faith: boolean): Promise<string> {
  // Explicit key and address: never pick up other Anthropic settings that happen
  // to be in the server's environment. CHAMPZZ_ANTHROPIC_BASE_URL is for local tests only.
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.CHAMPZZ_ANTHROPIC_BASE_URL || "https://api.anthropic.com",
  });
  const messages: Anthropic.Beta.BetaMessageParam[] = [];
  for (const t of history) {
    if (messages.length === 0 && t.role === "buddy") continue; // the conversation must start with the child
    messages.push({ role: t.role === "kid" ? "user" : "assistant", content: t.body });
  }
  messages.push({ role: "user", content: text });
  try {
    const res = await client.beta.messages.create({
      model: BUDDY_MODEL,
      max_tokens: 2048,
      // Low effort keeps replies quick for a chat; the server-side fallback
      // re-runs a request on another model if this one declines.
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt(faith),
      messages,
    });
    if (res.stop_reason === "refusal") return "Let's talk about something else! What's something fun you did this week?";
    const reply = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    return reply || "Hmm, I'm not sure what to say. Can you ask me another way?";
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return "Lots of champs are chatting right now. Try again in a minute!";
    if (err instanceof Anthropic.APIError) console.error("champ-buddy: api error", err.status ?? "connection");
    if (err instanceof Anthropic.APIError) return "Champ Buddy is having a little rest. Please try again soon.";
    throw err;
  }
}
