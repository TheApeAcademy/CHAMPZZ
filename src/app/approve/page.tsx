import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { ActionForm } from "@/components/ui/action-form";
import { Banner, Card, Field, buttonClass } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { getViewer } from "@/lib/auth/viewer";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { approveKidSignup } from "@/features/registration/server/actions";

export const metadata = { title: "Approve your child's account" };

/** A grown-up approves an account their child started. They must sign in first. */
export default async function ApprovePage({ searchParams }: PageProps<"/approve">) {
  const { code: raw } = await searchParams;
  const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  const viewer = await getViewer();
  const valid = /^[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(code);
  const found = valid && viewer.kind === "adult"
    ? (await supabaseAdmin().rpc("svc_kid_approval_lookup", { p_code: code })).data?.[0] ?? null
    : null;

  return (
    <AdultShell who={viewer.kind === "adult" ? viewer.fullName || viewer.email || undefined : undefined}>
      <Card className="mx-auto w-full max-w-xl">
        <h1 className="mb-1 font-display text-3xl font-extrabold">Approve your child&apos;s account</h1>
        <p className="mb-4 text-sm text-muted">Your child started a Champzz account and got a code. Approving makes you their grown-up: you see their progress and can close the account at any time.</p>
        {viewer.kind !== "adult" ? (
          <div className="flex flex-col gap-3">
            <Banner>Sign in or create a parent account first. It takes a minute.</Banner>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonClass()} href={`/signup?next=${encodeURIComponent(`/approve${valid ? `?code=${code}` : ""}`)}`}>Create a parent account</Link>
              <Link className={buttonClass("outline")} href={`/login?next=${encodeURIComponent(`/approve${valid ? `?code=${code}` : ""}`)}`}>Sign in</Link>
            </div>
          </div>
        ) : !found ? (
          <form className="flex flex-col gap-3" method="get">
            {valid ? <Banner tone="warn">That code is not valid or has expired. Ask your child to start again.</Banner> : null}
            <Field label="The code your child gave you" name="code" required placeholder="ABCD-2345" defaultValue={code} autoComplete="off" />
            <button type="submit" className={buttonClass()}>Continue</button>
          </form>
        ) : (
          <ActionForm action={approveKidSignup}>
            <input type="hidden" name="code" value={code} />
            <p className="rounded-[14px] bg-cream p-3">You are approving <strong>{found.first_name}</strong>, username <span className="font-mono font-extrabold">{found.username}</span>.</p>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-bold">What should they see?</legend>
              <label className="flex items-start gap-2 text-sm"><input type="radio" name="content" value="faith" defaultChecked className="mt-0.5 h-5 w-5" /><span><strong>Bible adventures and games</strong>: Faith Quest, Bible quizzes, Pray for the World and the Arena.</span></label>
              <label className="flex items-start gap-2 text-sm"><input type="radio" name="content" value="play" className="mt-0.5 h-5 w-5" /><span><strong>Games and quests only</strong>: no Bible content.</span></label>
            </fieldset>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5" />
              <span>I am this child&apos;s parent or guardian. I agree to them using Champzz, and to the <Link className="underline" href="/privacy">privacy notice</Link>.</span>
            </label>
            <Submit>Approve account</Submit>
          </ActionForm>
        )}
      </Card>
    </AdultShell>
  );
}
