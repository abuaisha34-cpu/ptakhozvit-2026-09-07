export async function compressPhoto(file: File, maxEdge = 960, quality = 0.58): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Немає canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const data = canvas.toDataURL("image/jpeg", quality);
  if (data.length > 180_000) {
    return canvas.toDataURL("image/jpeg", 0.42);
  }
  return data;
}
