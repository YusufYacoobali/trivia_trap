import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  sound: boolean;
  haptics: boolean;
  notif: boolean;
}

/** Consumables the shop sells. Hints start each round from these. */
export interface Inventory {
  fifty: number;
  crowd: number;
  skip: number;
  freeze: number;
}

/**
 * Review-prompt bookkeeping. The native iOS/Android prompt can only be shown a
 * handful of times per year and the OS silently swallows extra calls, so it is
 * gated behind a soft ask - we only spend a native prompt on someone who has
 * already said they like the app.
 */
export interface RatingState {
  /** How many times the soft ask has been shown. */
  asked: number;
  lastAskedAt?: number;
  /** Set once the player answers the soft ask; stops all further asking. */
  outcome?: 'positive' | 'negative';
  /** When the native store prompt was last requested. */
  nativeAt?: number;
}

export interface Profile {
  /** Schema version. Absent means the pre-v2 shape. */
  v?: number;
  coins: number;
  totalScore: number;
  games: number;
  bestStreak: number;
  dayStreak: number;
  answered: number;
  right: number;
  badges: string[];
  settings: Settings;
  lastPlayedDate?: string; // YYYY-MM-DD
  lastReviewRequest?: number; // epoch ms, legacy field kept for migration

  // ── v2 ──────────────────────────────────────────────────────────────────
  /** question id -> the round number it was last served in. */
  seen: Record<string, number>;
  /** Monotonic round counter, used as the recency clock for `seen`. */
  round: number;
  /** category -> skill rating on the same 1-5 scale as question difficulty. */
  skill: Record<string, number>;
  inventory: Inventory;
  /** Shop item ids owned (themes). */
  owned: string[];
  theme: string;
  /** YYYY-MM-DD of the last completed Daily. */
  dailyDate?: string;
  /** YYYY-MM-DD of the last free hint top-up, so free play stays viable. */
  hintRefillDate?: string;
  /** date -> per-question correct/wrong pattern, for the share card. */
  dailyResults: Record<string, string>;
  /** Total ms spent on the question screen; drives the early review trigger. */
  playMs: number;
  firstOpenAt?: number;
  rating: RatingState;
}

const KEY = 'triviatrap_v1';
export const PROFILE_VERSION = 2;

/** Keep the recency map from growing without bound. */
const MAX_SEEN_ENTRIES = 1200;

export function defaultProfile(): Profile {
  return {
    v: PROFILE_VERSION,
    coins: 0,
    totalScore: 0,
    games: 0,
    bestStreak: 0,
    dayStreak: 0,
    answered: 0,
    right: 0,
    badges: [],
    settings: { sound: true, haptics: true, notif: true },
    seen: {},
    round: 0,
    skill: {},
    inventory: { fifty: 2, crowd: 2, skip: 1, freeze: 0 },
    owned: [],
    theme: 'default',
    dailyResults: {},
    playMs: 0,
    rating: { asked: 0 },
  };
}

/** Fills in anything a pre-v2 profile is missing, without losing progress. */
export function migrateProfile(raw: Partial<Profile>): Profile {
  const def = defaultProfile();
  return {
    ...def,
    ...raw,
    v: PROFILE_VERSION,
    settings: { ...def.settings, ...(raw.settings || {}) },
    badges: raw.badges || [],
    seen: raw.seen || {},
    round: raw.round ?? 0,
    skill: raw.skill || {},
    inventory: { ...def.inventory, ...(raw.inventory || {}) },
    owned: raw.owned || [],
    theme: raw.theme || 'default',
    dailyResults: raw.dailyResults || {},
    playMs: raw.playMs ?? 0,
    // A v1 player who was already shown the old review prompt must not be
    // treated as brand new, or the v2 soft ask nags someone who has already
    // been asked. Their old timestamp becomes the native-prompt cooldown.
    rating: {
      ...def.rating,
      ...(raw.lastReviewRequest && !raw.rating
        ? { nativeAt: raw.lastReviewRequest, lastAskedAt: raw.lastReviewRequest, asked: 1 }
        : {}),
      ...(raw.rating || {}),
    },
  };
}

/** Drops the least recently seen entries once the recency map gets large. */
export function pruneSeen(seen: Record<string, number>): Record<string, number> {
  const entries = Object.entries(seen);
  if (entries.length <= MAX_SEEN_ENTRIES) return seen;
  const keep = entries.sort((a, b) => b[1] - a[1]).slice(0, MAX_SEEN_ENTRIES);
  return Object.fromEntries(keep);
}

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Profile>;
      const profile = migrateProfile(parsed);
      if (!profile.firstOpenAt) profile.firstOpenAt = Date.now();
      return profile;
    }
  } catch {
    // ignore corrupt storage; fall back to defaults
  }
  return { ...defaultProfile(), firstOpenAt: Date.now() };
}

export async function saveProfile(p: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // ignore write failures
  }
}

export function todayKey(d = new Date()): string {
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export function isYesterday(prev: string): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return prev === todayKey(y);
}

/** Whole days between two YYYY-MM-DD keys. */
export function daysBetweenKeys(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.round((b - a) / 86400000);
}
