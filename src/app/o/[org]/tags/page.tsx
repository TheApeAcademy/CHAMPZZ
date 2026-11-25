import Link from "next/link";
import { ChampAvatar } from "@/features/kids/components/champ-avatar";
import { parseAvatar } from "@/features/kids/avatar";
import { Logo } from "@/components/ui/logo";
import { PrintButton } from "@/components/ui/print-button";
import { requireOrgRole } from "@/lib/auth/viewer";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata = { title: "Name tags" };

export default async function NameTagsPage({ params }: PageProps<"/o/[org]/tags">) {
  const { org: slug } = await params;
  const { org } = await requireOrgRole(slug, ["org_admin", "teacher"]);
  const supabase = await supabaseServer();
  const { data: kids } = await supabase
    .from("kids")
    .select("id, first_name, last_initial, username, avatar, classes(name)")
    .eq("organization_id", org.id)
    .eq("status", "active")
    .order("first_name");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/o/${slug}`} className="text-sm font-extrabold underline">Back to {org.name}</Link>
        <PrintButton>Print name tags</PrintButton>
      </div>
      <h1 className="font-display text-2xl font-extrabold print:hidden">Name tags</h1>
      <p className="text-sm text-muted print:hidden">Each tag shows the kid&apos;s username, so they never need to remember it. Picture PINs are never printed.</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2" data-testid="name-tags">
        {(kids ?? []).map((k) => (
          <li key={k.id} className="flex items-center gap-3 rounded-[18px] border-2 border-ink bg-surface p-3 break-inside-avoid">
            <ChampAvatar a={parseAvatar(k.avatar)} size={64} />
            <div className="flex flex-1 flex-col">
              <span className="font-display text-2xl font-black italic uppercase">{k.first_name}{k.last_initial ? ` ${k.last_initial}.` : ""}</span>
              <span className="text-sm font-bold">{k.username}</span>
              <span className="text-xs text-muted">{k.classes?.name ?? org.name}</span>
            </div>
            <Logo size={14} />
          </li>
        ))}
      </ul>
    </main>
  );
}
