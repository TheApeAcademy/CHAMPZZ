/** Identify an image by its first bytes, never by its name or the browser's claim. SVG is never accepted. */
export function sniffImage(b: Uint8Array): "png" | "jpg" | "webp" | null {
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}

export function mimeFor(kind: "png" | "jpg" | "webp") {
  return kind === "jpg" ? "image/jpeg" : `image/${kind}`;
}

/** PDFs start with "%PDF-". */
export function isPdf(b: Uint8Array): boolean {
  return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 && b[4] === 0x2d;
}

/** Audio from a browser recorder: WebM, Ogg or MP4, recognised by their first bytes. */
export function sniffAudio(b: Uint8Array): { ext: "webm" | "ogg" | "m4a"; mime: "audio/webm" | "audio/ogg" | "audio/mp4" } | null {
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { ext: "webm", mime: "audio/webm" };
  if (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) return { ext: "ogg", mime: "audio/ogg" };
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return { ext: "m4a", mime: "audio/mp4" };
  return null;
}
