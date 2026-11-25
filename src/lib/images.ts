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
