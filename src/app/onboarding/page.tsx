import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AdultShell } from "@/components/shell";
import { requireAdult } from "@/lib/auth/viewer";
import { createOrganization } from "@/features/org/server/actions";

export const metadata = { title: "Set up your club" };

export default async function OnboardingPage() {
  const viewer = await requireAdult("/onboarding");
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <Card className="mx-auto w-full max-w-xl">
        <h1 className="mb-1 font-display text-3xl font-extrabold">Set up your club</h1>
        <p className="mb-5 text-sm text-muted">You can finish setting up before you pay. Teachers, parents and kids get in once your plan is active.</p>
        <ActionForm action={createOrganization}>
          <Field label="Club or ministry name" name="name" required maxLength={80} />
          <Field label="Web address" name="slug" required pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]" hint="Lowercase letters, numbers and hyphens, e.g. sunrise-kids. Your Clubhouse will live at /c/your-address." />
          <Select label="What kind of organization?" name="kind" defaultValue="church">
            <option value="church">Church or children&apos;s ministry</option>
            <option value="club">Kids&apos; club</option>
            <option value="school">School</option>
            <option value="other">Other</option>
          </Select>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Country" name="country" defaultValue="NG">
              <option value="NG">Nigeria</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="IE">Ireland</option>
              <option value="ES">Spain</option>
            </Select>
            <Select label="Time zone" name="timezone" defaultValue="Africa/Lagos">
              <option value="Africa/Lagos">Lagos</option>
              <option value="Europe/London">London</option>
              <option value="America/New_York">New York</option>
              <option value="America/Toronto">Toronto</option>
              <option value="Europe/Madrid">Madrid</option>
            </Select>
            <Select label="Billing currency" name="currency" defaultValue="NGN">
              <option value="NGN">NGN</option>
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CAD">CAD</option>
            </Select>
          </div>
          <Submit>Create my club</Submit>
        </ActionForm>
      </Card>
    </AdultShell>
  );
}
