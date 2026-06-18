import { BADGES } from '../data/game';
import { Badge } from '../data/types';
import { isYesterday, todayKey } from './storage';
import type { Profile } from './storage';
import type { GameState } from './useGame';

export interface RoundProfileUpdate {
  profile: Profile;
  newBadges: Badge[];
  earnedCoins: number;
}

export function applyRoundProgress(state: GameState): RoundProfileUpdate {
  const profile: Profile = {
    ...state.P,
    badges: [...state.P.badges],
    settings: { ...state.P.settings },
  };
  const flags = { ...state.sessionFlags };

  if (state.total > 0) flags.first = true;
  if (state.correct === state.total && state.total > 0) flags.perfect = true;

  const earnedCoins = Math.round(state.score * 1.5);
  const newBadges: Badge[] = [];

  BADGES.forEach((badge) => {
    if (flags[badge.id] && profile.badges.indexOf(badge.id) < 0) {
      profile.badges.push(badge.id);
      newBadges.push(badge);
    }
  });

  profile.coins += earnedCoins;
  profile.totalScore += state.score;
  profile.games += 1;
  profile.bestStreak = Math.max(profile.bestStreak, state.bestRun);
  profile.answered += state.total;
  profile.right += state.correct;

  const today = todayKey();
  if (profile.lastPlayedDate !== today) {
    profile.dayStreak = profile.lastPlayedDate && isYesterday(profile.lastPlayedDate) ? profile.dayStreak + 1 : 1;
    profile.lastPlayedDate = today;
  }

  return { profile, newBadges, earnedCoins };
}
