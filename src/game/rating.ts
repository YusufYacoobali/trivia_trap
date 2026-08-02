import type { Profile, RatingState } from './storage';

/**
 * When to ask for a review.
 *
 * Two prompts, deliberately chained:
 *
 *   1. A soft ask inside the app ("Enjoying Trivia Trap?"). Costs nothing, can
 *      be shown more than once, and its answer tells us what happens next.
 *   2. The native store prompt, which is spent ONLY on someone who just said
 *      they like the app.
 *
 * Chaining them this way matters because both stores cap how often the native
 * prompt can appear (iOS silently swallows extra calls, roughly three per
 * year). Firing it blind spends that budget on people about to leave a 2-star
 * review. Gating it behind the soft ask means the budget goes to people who
 * have already self-identified as happy.
 *
 * Placement rules, in priority order:
 *   - never mid-round, only on the Summary screen once the score has landed
 *   - never straight after a failure (a busted Streak Run, a bad round)
 *   - only after a genuinely good moment: strong accuracy, a perfect round,
 *     or a badge unlock
 *   - the earliest ask is gated on ~2 minutes of actual play, so the player
 *     has seen enough of the app to have an opinion
 */

/** Real play time before the first ask is allowed. */
export const MIN_PLAY_MS = 2 * 60 * 1000;

/** Never nag: three soft asks, ever. */
export const MAX_SOFT_ASKS = 3;

/** Gap between soft asks. */
export const ASK_COOLDOWN_MS = 4 * 24 * 60 * 60 * 1000;

/** Both stores throttle harder than this, but be a good citizen anyway. */
export const NATIVE_COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000;

/** Accuracy below which the round does not count as a good moment. */
export const GOOD_ROUND_ACCURACY = 0.6;

export interface RoundOutcome {
  accuracy: number;
  perfect: boolean;
  newBadgeCount: number;
  /** A Streak Run or Rush that ended because the player got one wrong. */
  endedInFailure: boolean;
}

export function isGoodMoment(outcome: RoundOutcome): boolean {
  if (outcome.endedInFailure) return false;
  return outcome.perfect || outcome.newBadgeCount > 0 || outcome.accuracy >= GOOD_ROUND_ACCURACY;
}

/**
 * Whether to show the in-app soft ask at the end of this round.
 * Pure so the placement rules are testable without mounting a screen.
 */
export function shouldSoftAsk(profile: Profile, outcome: RoundOutcome, now = Date.now()): boolean {
  const rating = profile.rating;

  // Already told us how they feel - never ask again either way.
  if (rating.outcome) return false;
  if (rating.asked >= MAX_SOFT_ASKS) return false;
  if (rating.lastAskedAt && now - rating.lastAskedAt < ASK_COOLDOWN_MS) return false;

  // Enough play to have a real opinion.
  if (profile.playMs < MIN_PLAY_MS) return false;
  if (profile.games < 1) return false;

  return isGoodMoment(outcome);
}

/** Whether a positive soft-ask answer may spend a native prompt. */
export function canRequestNative(rating: RatingState, now = Date.now()): boolean {
  if (!rating.nativeAt) return true;
  return now - rating.nativeAt >= NATIVE_COOLDOWN_MS;
}

export function recordSoftAskShown(rating: RatingState, now = Date.now()): RatingState {
  return { ...rating, asked: rating.asked + 1, lastAskedAt: now };
}

export function recordSoftAskAnswer(rating: RatingState, positive: boolean, now = Date.now()): RatingState {
  return { ...rating, outcome: positive ? 'positive' : 'negative', lastAskedAt: now };
}

export function recordNativeShown(rating: RatingState, now = Date.now()): RatingState {
  return { ...rating, nativeAt: now };
}
