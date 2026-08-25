/* ==========================================================================
   Advanced Stale-While-Revalidate Cache with sessionStorage
   ========================================================================== */

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;   // fresh until here (5 min)
  staleUntil: number;  // usable-but-refresh-in-background until here (30 min)
  lastGoodAt: number;  // timestamp of the last successful Drive response for this key
}

const store = new Map<string, CacheEntry<any>>();
const SESSION_KEY = "psoc_archive_cache";

// Initialize from sessionStorage on load
try {
  const saved = sessionStorage.getItem(SESSION_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    for (const [k, v] of Object.entries(parsed)) {
      store.set(k, v as CacheEntry<any>);
    }
  }
} catch {
  // Ignore parse errors or disabled storage
}

function persist() {
  try {
    const obj = Object.fromEntries(store.entries());
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(obj));
  } catch {
    // sessionStorage quota exceeded, ignore
  }
}

export type CacheStatus = "fresh" | "stale" | "expired";

export interface CacheResult<T> {
  data: T | null;
  status: CacheStatus;
  lastGoodData: T | null;
}

export function getCached<T>(key: string): CacheResult<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return { data: null, status: "expired", lastGoodData: null };

  const now = Date.now();
  if (now < entry.expiresAt) {
    return { data: entry.data, status: "fresh", lastGoodData: entry.data };
  }
  if (now < entry.staleUntil) {
    return { data: entry.data, status: "stale", lastGoodData: entry.data };
  }
  
  return { data: null, status: "expired", lastGoodData: entry.data };
}

export function setCached<T>(
  key: string, 
  data: T, 
  freshMs: number = 5 * 60 * 1000, 
  staleMs: number = 30 * 60 * 1000
): void {
  const now = Date.now();
  store.set(key, {
    data,
    createdAt: now,
    expiresAt: now + freshMs,
    staleUntil: now + staleMs,
    lastGoodAt: now,
  });
  persist();
}

export function clearCache(): void {
  store.clear();
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}
