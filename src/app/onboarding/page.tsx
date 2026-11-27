import { ActionForm } from "@/components/ui/action-form";
import { Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { AuthFrame, AuthTitle } from "@/components/auth-frame";
import { requireAdult } from "@/lib/auth/viewer";
import { createOrganization } from "@/features/org/server/actions";
import { ClubSetupFields } from "@/features/org/components/club-setup-fields";

export const metadata = { title: "Set up your club" };

export default async function OnboardingPage() {
  await requireAdult("/onboarding");
  return (
    <AuthFrame art="onboarding">
      <AuthTitle eyebrow="14 days free · up to 15 kids" title="Set up your club" lead="Your club works straight away with a free trial. Choose a plan any time from your club page." />
      <ActionForm action={createOrganization} className="flex flex-col gap-[18px]">
        <ClubSetupFields />
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Select big label="Country" name="country" defaultValue="NG">
            <option value="NG">Nigeria</option>
            <option value="GB">United Kingdom</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="IE">Ireland</option>
            <option value="ES">Spain</option>
          </Select>
          <Select big label="Time zone" name="timezone" defaultValue="Africa/Lagos">
            <option value="Africa/Lagos">Lagos</option>
            <option value="Europe/London">London</option>
            <option value="America/New_York">New York</option>
            <option value="America/Toronto">Toronto</option>
            <option value="Europe/Madrid">Madrid</option>
          </Select>
          <Select big label="Billing currency" name="currency" defaultValue="NGN">
            <option value="NGN">NGN</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CAD">CAD</option>
          </Select>
        </div>
        <Submit variant="gold" size="lg">Create my club</Submit>
      </ActionForm>
    </AuthFrame>
  );
}
