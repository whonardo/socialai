/** Tiny deterministic PRNG so mock data is stable across renders and SSR. */
export function createRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 0xffffffff;
  };
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length) % items.length]!;
}

export function intBetween(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}
