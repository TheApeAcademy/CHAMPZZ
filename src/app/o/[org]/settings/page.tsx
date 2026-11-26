import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field, Select } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { logoUrl } from "@/lib/branding";
import { updateClubSettings, uploadLogo } from "@/features/admin/server/actions";
import { setBuddyEnabled } from "@/features/delight/server/actions";

export const metadata = { title: "Club settings" };

const ZONES = Intl.supportedValuesOf("timeZone");

export default async function SettingsPage({ params }: PageProps<"/o/[org]/settings">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin"]);
  const supabase = await supabaseServer();
  const [{ data: o }, { data: b }] = await Promise.all([
    supabase.from("organizations").select("name, timezone, faith_mode, ai_enabled").eq("id", org.id).single(),
    supabase.from("org_branding").select("tagline, motto, primary_color, logo_path, city, listed").eq("organization_id", org.id).maybeSingle(),
  ]);
  const logo = logoUrl(b?.logo_path);
  const { data: sub } = await supabase.from("subscriptions").select("plan_id").eq("organization_id", org.id).maybeSingle();
  const { data: feat } = sub ? await supabase.from("plan_features").select("enabled").eq("plan_id", sub.plan_id).eq("feature_key", "ai_companion").maybeSingle() : { data: null };
  const aiPlan = Boolean(feat?.enabled);
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="settings" />
      <h1 className="font-display text-3xl font-extrabold">Club settings</h1>
      <Card>
        <ActionForm action={updateClubSettings.bind(null, slug)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Club name" name="name" required minLength={2} maxLength={80} defaultValue={o?.name} />
          <Select label="Time zone" name="timezone" defaultValue={o?.timezone ?? "Africa/Lagos"}>
            {ZONES.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
          </Select>
          <Field label="Tagline (shown on your Clubhouse page)" name="tagline" maxLength={140} defaultValue={b?.tagline ?? ""} />
          <label className="flex flex-col gap-1.5 text-sm font-bold sm:col-span-2">Club motto or song (shown on your Clubhouse and to kids)
            <textarea name="motto" maxLength={400} rows={3} defaultValue={b?.motto ?? ""} className="rounded-[12px] border border-line bg-surface p-3 text-base font-normal" />
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="useColor" defaultChecked={Boolean(b?.primary_color)} className="h-5 w-5" /> Use a club colour</label>
            <label className="flex flex-col gap-1.5 text-sm font-bold">Colour
              <input type="color" name="color" defaultValue={b?.primary_color ?? "#2F5BFF"} className="h-11 w-20 rounded-[12px] border border-line bg-surface" />
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm font-bold">
            <input type="checkbox" name="faith" defaultChecked={o?.faith_mode} className="mt-0.5 h-5 w-5" />
            <span>Faith mode<span className="block font-normal text-muted">On for churches and ministries: memory verses, Faith Quest and Bible games. Off for clubs and schools.</span></span>
          </label>
          <Field label="City (shown in the club directory)" name="city" maxLength={60} defaultValue={b?.city ?? ""} />
          <label className="flex items-start gap-2 text-sm font-bold">
            <input type="checkbox" name="listed" defaultChecked={b?.listed} className="mt-0.5 h-5 w-5" data-testid="listed" />
            <span>Public club<span className="block font-normal text-muted">On: your club is in the directory, anyone can read your news and follow you, and teachers can ask to join. Off (private): hidden from the directory and your news stays inside the club. Either way, kids&apos; names and pictures are never public, and children join only through a parent with your join code.</span></span>
          </label>
          <div className="sm:col-span-2"><Submit>Save settings</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">Logo</h2>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="Your club logo" data-testid="club-logo" className="mb-3 h-20 w-auto max-w-56 rounded-[12px] border border-line bg-cream object-contain p-2" />
        ) : <p className="mb-3 text-sm text-muted">No logo yet.</p>}
        <ActionForm action={uploadLogo.bind(null, slug)} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-bold">PNG, JPG or WebP, up to 512 KB
            <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" required className="text-base font-normal" />
          </label>
          <div><Submit variant="outline">Upload logo</Submit></div>
        </ActionForm>
      </Card>
      <Card>
        <h2 className="mb-1 text-lg font-extrabold">Champ Buddy (AI helper)</h2>
        <p className="mb-3 max-w-2xl text-sm text-muted">A friendly AI helper for kids&apos; questions and ideas. Off until you switch it on, and then each child also needs a yes from their parent. Children&apos;s names are never sent to the AI; every chat is kept for your team and the child&apos;s parents to read.</p>
        {aiPlan ? (
          <ActionForm action={setBuddyEnabled.bind(null, slug)} className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-bold"><input type="checkbox" name="enabled" defaultChecked={Boolean(o?.ai_enabled)} className="h-5 w-5" /> Switch on Champ Buddy for our club</label>
            <Submit variant="outline">Save</Submit>
          </ActionForm>
        ) : <p className="rounded-[12px] bg-[#FCEBC4] p-3 text-sm font-bold text-[#5A3F00]" data-testid="buddy-plan">Champ Buddy comes with the Pro plan and up.</p>}
      </Card>
    </AdultShell>
  );
}
