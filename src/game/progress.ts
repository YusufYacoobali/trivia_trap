import { BADGES } from '../data/game';
import { Badge } from '../data/types';
import { updateSkill } from './logic';
import { daysBetweenKeys, isYesterday, pruneSeen, todayKey } from './storage';
import type { Profile } from './storage';
import type { GameState } from './useGame';

export interface RoundProfileUpdate {
  profile: Profile;
  newBadges: Badge[];
  earnedCoins: number;
  /** True when a streak freeze was spent to save the day streak. */
  freezeUsed: boolean;
}

/** A round's score can go negative now; coins never do. */
function coinsFor(score: number): number {
  return Math.max(0, Math.round(score * 1.5));
}

/**
 * Advances the day streak, spending a streak freeze to cover a single missed
 * day if the player owns one. Returns the new streak and whether a freeze went.
 */
export function advanceDayStreak(
  profile: Pick<Profile, 'dayStreak' | 'lastPlayedDate' | 'inventory'>,
  today: string,
): { dayStreak: number; freezeUsed: boolean } {
  const last = profile.lastPlayedDate;
  if (!last) return { dayStreak: 1, freezeUsed: false };
  if (last === today) return { dayStreak: profile.dayStreak, freezeUsed: false };
  if (isYesterday(last)) return { dayStreak: profile.dayStreak + 1, freezeUsed: false };

  // Exactly one day missed, and a freeze in the bag: the streak survives.
  const gap = daysBetweenKeys(last, today);
  if (gap === 2 && profile.inventory.freeze > 0 && profile.dayStreak > 0) {
    return { dayStreak: profile.dayStreak + 1, freezeUsed: true };
  }
  return { dayStreak: 1, freezeUsed: false };
}

export function applyRoundProgress(state: GameState): RoundProfileUpdate {
  const profile: Profile = {
    ...state.P,
    badges: [...state.P.badges],
    settings: { ...state.P.settings },
    seen: { ...state.P.seen },
    skill: { ...state.P.skill },
    inventory: { ...state.P.inventory },
    owned: [...state.P.owned],
    dailyResults: { ...state.P.dailyResults },
    rating: { ...state.P.rating },
  };
  const flags = { ...state.sessionFlags };

  if (state.total > 0) flags.first = true;
  if (state.correct === state.total && state.total > 0) flags.perfect = true;

  const earnedCoins = coinsFor(state.score);
  const newBadges: Badge[] = [];

  // Round bookkeeping. `round` is the recency clock for the seen map, so a
  // question served this round will not come back for a while.
  profile.round += 1;
  state.queue.slice(0, state.qIndex + 1).forEach((q) => {
    profile.seen[q.id] = profile.round;
  });
  profile.seen = pruneSeen(profile.seen);

  // Difficulty tracking, per category so being good at Football does not make
  // Science harder. The Daily is the same for everyone, so it does not count.
  if (state.mode !== 'daily' && state.total >= 3) {
    const key = state.category && state.category !== 'All' ? state.category : 'All';
    profile.skill[key] = updateSkill(profile.skill[key] ?? profile.skill.All ?? 2.4, state.correct, state.total);
  }

  profile.coins += earnedCoins;
  profile.totalScore += Math.max(0, state.score);
  profile.games += 1;
  profile.bestStreak = Math.max(profile.bestStreak, state.bestRun);
  profile.answered += state.total;
  profile.right += state.correct;

  const today = todayKey();
  let freezeUsed = false;
  if (profile.lastPlayedDate !== today) {
    const advanced = advanceDayStreak(profile, today);
    profile.dayStreak = advanced.dayStreak;
    freezeUsed = advanced.freezeUsed;
    if (freezeUsed) profile.inventory.freeze -= 1;
    profile.lastPlayedDate = today;
  }

  if (profile.dayStreak >= 7) flags.week = true;

  // Record the Daily result so it can be shared without spoiling answers.
  if (state.mode === 'daily') {
    profile.dailyDate = today;
    profile.dailyResults[today] = state.dailyPattern;
  }

  BADGES.forEach((badge) => {
    if (flags[badge.id] && profile.badges.indexOf(badge.id) < 0) {
      profile.badges.push(badge.id);
      newBadges.push(badge);
    }
  });

  return { profile, newBadges, earnedCoins, freezeUsed };
}
