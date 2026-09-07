const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(rng: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += ALPHABET[Math.floor(rng() * ALPHABET.length) % ALPHABET.length];
  }
  return out;
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s\-_.]/g, "");
}

export function isInviteCodeFormat(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}

export function generateSheetsToken(rng: () => number = Math.random): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 24; i += 1) {
    out += alphabet[Math.floor(rng() * alphabet.length) % alphabet.length];
  }
  return out;
}

export function isSheetsTokenFormat(code: string): boolean {
  return /^[a-z2-9]{24}$/.test(code);
}
