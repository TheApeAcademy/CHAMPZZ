"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { sendVerse } from "@/features/delight/server/parity-actions";
import { Banner } from "@/components/ui/primitives";

const MAX_SECONDS = 45;

/** Record with the microphone (or pick a recording) and send it to the teacher. */
export function VerseRecorder({ slug, lessonId }: { slug: string; lessonId: string | null }) {
  const [state, action, pending] = useActionState(sendVerse.bind(null, slug), null);
  const [recording, setRecording] = useState(false);
  const [left, setLeft] = useState(MAX_SECONDS);
  const [preview, setPreview] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recording) return;
    if (left <= 0) { rec.current?.stop(); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [recording, left]);

  const start = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: r.mimeType || "audio/webm" });
        const file = new File([blob], `verse.${blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm"}`, { type: blob.type });
        const dt = new DataTransfer();
        dt.items.add(file);
        if (fileInput.current) fileInput.current.files = dt.files;
        setPreview(URL.createObjectURL(blob));
      };
      rec.current = r;
      r.start();
      setLeft(MAX_SECONDS);
      setRecording(true);
    } catch {
      setMicError("We could not use the microphone. Ask a grown-up to allow it, or choose a recording below.");
    }
  };

  return (
    <form action={action} className="flex flex-col gap-3 rounded-[20px] bg-surface p-4">
      {state?.error ? <Banner tone="error">{state.error}</Banner> : null}
      {state?.ok ? <Banner tone="ok">{state.ok}</Banner> : null}
      {micError ? <Banner tone="warn">{micError}</Banner> : null}
      <input type="hidden" name="lesson" value={lessonId ?? ""} />
      {recording ? (
        <button type="button" onClick={() => rec.current?.stop()} className="min-h-14 rounded-full bg-coral px-6 text-lg font-extrabold text-ink">Stop ({left}s)</button>
      ) : (
        <button type="button" onClick={start} className="min-h-14 rounded-full bg-brand px-6 text-lg font-extrabold text-white">{preview ? "Record again" : "Start recording"}</button>
      )}
      {preview ? <audio controls src={preview} className="w-full" /> : null}
      <label className="flex flex-col gap-1 text-sm font-bold">Or choose a recording
        <input ref={fileInput} type="file" name="audio" accept="audio/webm,audio/ogg,audio/mp4,audio/x-m4a" className="text-base font-normal" />
      </label>
      <button type="submit" disabled={pending || recording} className="min-h-12 self-start rounded-full bg-gold px-6 font-extrabold text-ink disabled:opacity-50">Send to my teacher</button>
    </form>
  );
}
