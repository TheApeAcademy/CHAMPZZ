import { KidShell } from "@/features/kids/components/kid-shell";
import { ActionForm } from "@/components/ui/action-form";
import { Submit } from "@/components/ui/submit";
import { getKidSnapshot } from "@/features/kids/server/data";
import { supabaseServer } from "@/lib/supabase/server";
import { signedUploadUrls } from "@/lib/uploads";
import { uploadStuff } from "@/features/delight/server/actions";

export const metadata = { title: "My Stuff" };

export default async function StuffPage({ params }: PageProps<"/k/[org]/stuff">) {
  const { org } = await params;
  const k = await getKidSnapshot(org, { clubOnly: true });
  const supabase = await supabaseServer();
  const { data: items } = await supabase.from("kid_uploads").select("id, path, caption, status, created_at").eq("kid_id", k.kidId).neq("status", "rejected").order("created_at", { ascending: false });
  const urls = await signedUploadUrls((items ?? []).filter((i) => i.status === "approved").map((i) => i.path));
  return (
    <KidShell slug={org} clubName={k.org.name} active="other" little={k.little}>
      <h1 className="font-display text-3xl font-black italic uppercase">My Stuff</h1>
      <p className="-mt-2 text-sm text-muted">Your drawings and pictures. A grown-up checks each one first. Please do not send photos of people or anything with your name, school or address on it.</p>
      <ActionForm action={uploadStuff.bind(null, org)} className="flex flex-col gap-3 rounded-[20px] bg-surface p-4">
        <label className="flex flex-col gap-1 font-bold">Picture (PNG, JPG or WebP, under 1 MB)
          <input type="file" name="picture" accept="image/png,image/jpeg,image/webp" required className="text-base font-normal" />
        </label>
        <label className="flex flex-col gap-1 font-bold">Title (optional)
          <input name="caption" maxLength={100} className="min-h-11 rounded-[12px] border border-line bg-cream px-3 font-normal" />
        </label>
        <Submit>Send to My Stuff</Submit>
      </ActionForm>
      <ul className="grid grid-cols-2 gap-3" data-testid="stuff-list">
        {(items ?? []).map((i) => (
          <li key={i.id} className="flex flex-col gap-1 rounded-[16px] bg-surface p-2" data-status={i.status}>
            {urls.get(i.path) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={urls.get(i.path)} alt={i.caption ?? "My picture"} className="aspect-square w-full rounded-[12px] object-cover" />
            ) : <div className="flex aspect-square items-center justify-center rounded-[12px] bg-cream p-2 text-center text-sm font-bold">Waiting for a grown-up to check</div>}
            {i.caption ? <p className="text-sm font-bold">{i.caption}</p> : null}
          </li>
        ))}
      </ul>
    </KidShell>
  );
}
