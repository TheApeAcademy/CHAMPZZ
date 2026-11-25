/** Fisher-Yates shuffle with crypto randomness, returning a new array. */
export function shuffle<T>(items: readonly T[]): T[] {
  const a = [...items];
  const r = new Uint32Array(a.length);
  crypto.getRandomValues(r);
  for (let i = a.length - 1; i > 0; i--) {
    const j = r[i]! % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** A crypto-random integer from 0 to n - 1. */
export function randInt(n: number): number {
  const r = new Uint32Array(1);
  crypto.getRandomValues(r);
  return r[0]! % n;
}
