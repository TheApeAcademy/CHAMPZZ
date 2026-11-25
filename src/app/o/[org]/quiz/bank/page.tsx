import Link from "next/link";
import { AdultShell } from "@/components/shell";
import { StaffNav } from "@/components/staff-nav";
import { ActionForm } from "@/components/ui/action-form";
import { Card, Field } from "@/components/ui/primitives";
import { Submit } from "@/components/ui/submit";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";
import { usablePacks } from "@/features/games/server/data";
import { createPack } from "@/features/games/server/actions";

export const metadata = { title: "Question bank" };

export default async function BankPage({ params }: PageProps<"/o/[org]/quiz/bank">) {
  const { org: slug } = await params;
  const { viewer, org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: o } = await supabase.from("organizations").select("faith_mode").eq("id", org.id).single();
  const packs = await usablePacks(org.id, Boolean(o?.faith_mode));
  return (
    <AdultShell who={viewer.fullName || viewer.email || undefined}>
      <StaffNav slug={slug} active="quiz" />
      <h1 className="font-display text-3xl font-extrabold">Question bank</h1>
      <Card>
        <h2 className="mb-3 text-lg font-extrabold">New pack for your club</h2>
        <ActionForm action={createPack.bind(null, slug)} className="flex flex-wrap items-end gap-3">
          <Field label="Pack name" name="name" required maxLength={60} placeholder="Our term 1 questions" />
          <Submit>Create pack</Submit>
        </ActionForm>
      </Card>
      <Card>
        <ul className="flex flex-col divide-y divide-line" data-testid="pack-bank">
          {packs.map((p) => (
            <li key={p.id} className="flex items-center gap-2 py-3">
              <Link href={`/o/${slug}/quiz/bank/${p.id}`} className="font-extrabold underline">{p.name}</Link>
              <span className="text-sm text-muted">{p.organization_id ? "Your club" : "Champzz pack"}</span>
            </li>
          ))}
        </ul>
      </Card>
    </AdultShell>
  );
}
