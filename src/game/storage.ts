import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  sound: boolean;
  haptics: boolean;
  notif: boolean;
}

export interface Profile {
  coins: number;
  totalScore: number;
  games: number;
  bestStreak: number;
  dayStreak: number;
  answered: number;
  right: number;
  badges: string[];
  settings: Settings;
  // Bookkeeping for streak + native review pacing (not shown in mockup UI).
  lastPlayedDate?: string; // YYYY-MM-DD
  lastReviewRequest?: number; // epoch ms
}

const KEY = 'triviatrap_v1';

export function defaultProfile(): Profile {
  return {
    coins: 0,
    totalScore: 0,
    games: 0,
    bestStreak: 0,
    dayStreak: 0,
    answered: 0,
    right: 0,
    badges: [],
    settings: { sound: true, haptics: true, notif: true },
  };
}

export async function loadProfile(): Promise<Profile> {
  const def = defaultProfile();
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const r = JSON.parse(raw) as Partial<Profile>;
      return {
        ...def,
        ...r,
        settings: { ...def.settings, ...(r.settings || {}) },
        badges: r.badges || [],
      };
    }
  } catch {
    // ignore corrupt storage; fall back to defaults
  }
  return def;
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
