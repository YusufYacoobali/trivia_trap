import { CONF, getQuestionsForMode, limitQuestionsForMode, MODES } from '../data/game';
import { QUESTIONS } from '../data/questions';
import { Difficulty, ModeId, Question } from '../data/types';
import type { Profile } from './storage';

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Small deterministic PRNG so per-question randomness is stable across renders. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic daily shuffle so everyone gets the same Daily 10 each day.
export function seedShuffle<T>(arr: T[], date = new Date()): T[] {
  const a = arr.slice();
  const rnd = mulberry32(date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate());
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Randomise the position of a question's answers so the correct one isn't
// always in the same slot. Shuffles index positions (not the strings) so it
// stays correct even if two options share the same text, and remaps `a` to the
// correct option's new position. Returns a new Question; never mutates input.
export function shuffleOptions(q: Question): Question {
  const order = shuffle([0, 1, 2, 3]);
  const correctOption = q.o[q.a];
  const o = order.map((i) => q.o[i]) as Question['o'];
  const a = order.indexOf(q.a);
  if (o[a] !== correctOption) {
    throw new Error(`Failed to preserve correct answer while shuffling question "${q.id}".`);
  }
  return { ...q, o, a };
}

// ── question selection ───────────────────────────────────────────────────────

export const DEFAULT_SKILL = 2.4;
/** The accuracy the difficulty matcher aims for. Well above coin-flip, short of boring. */
export const TARGET_ACCURACY = 0.68;

/** Player skill for a category, on the same 1-5 scale as question difficulty. */
export function skillFor(profile: Profile | undefined, category: string | null): number {
  if (!profile) return DEFAULT_SKILL;
  const key = category && category !== 'All' ? category : 'All';
  return profile.skill[key] ?? profile.skill.All ?? DEFAULT_SKILL;
}

/**
 * Nudges a category's skill rating after a round. Overshooting the target
 * accuracy pushes harder questions; undershooting eases off.
 */
export function updateSkill(current: number, correct: number, total: number): number {
  if (total < 3) return current;
  const accuracy = correct / total;
  const delta = (accuracy - TARGET_ACCURACY) * 2.2;
  // Cap movement so one unlucky round cannot swing the whole curve.
  const capped = Math.max(-0.6, Math.min(0.6, delta));
  return Math.max(1, Math.min(5, current + capped));
}

/** Rounds before a question counts as fully rested and repeatable. */
export const REST_ROUNDS = 8;

/**
 * How much a just-served question is penalised, in units of difficulty tiers.
 * At 2.5 a freshly-seen perfect match loses to anything within two tiers that
 * has rested, which keeps rounds varied without abandoning the curve.
 */
export const RECENCY_WEIGHT = 2.5;

/**
 * Picks a round's questions, balancing two things that pull against each other:
 * not repeating what the player just saw, and matching their level.
 *
 * Before this the queue was a plain shuffle of the whole pool, so with 100
 * questions per category and 10 per round a player hit repeats by their third
 * game while never being served anything matched to their level.
 */
export function selectQuestions(pool: Question[], count: number, profile: Profile | undefined, target: number): Question[] {
  if (pool.length <= count) return shuffle(pool);

  const seen = profile?.seen ?? {};
  const currentRound = profile?.round ?? 0;

  const scored = pool.map((q) => {
    const lastSeen = seen[q.id];
    // How rested a question is, 0 (just served) to 1 (never seen, or long ago).
    const rest =
      lastSeen === undefined ? 1 : Math.min(1, (currentRound - lastSeen) / REST_ROUNDS);
    const fit = Math.abs(q.d - target);
    // Lower is better. Recency is a weighted penalty rather than a hard tier:
    // sorting by freshness FIRST looks reasonable but silently disables
    // difficulty matching the moment the pool is exhausted, which for a
    // 10-question round over an 85-question category happens by round nine.
    // From then on selection would be pure recency and adaptation would stop.
    const score = fit + (1 - rest) * RECENCY_WEIGHT + Math.random() * 0.35;
    return { q, score };
  });

  scored.sort((a, b) => a.score - b.score);

  // Take a slightly wider band than needed, then shuffle, so consecutive rounds
  // at the same skill level don't serve an identical set in a different order.
  // The band is deliberately tight: widen it and difficulty matching washes out,
  // because the extra slots come from tiers the player was not aimed at.
  const band = shuffle(scored.slice(0, Math.min(scored.length, Math.round(count * 1.8) + 4)).map((s) => s.q));
  return spaceByTopic(band, count);
}

/** How many questions sharing a tag may appear in one round. */
export const MAX_PER_TOPIC = 2;

/**
 * Fills a round from an already-ranked list while avoiding topic clumping.
 *
 * Difficulty matching pulls questions from the same tiers, and questions in a
 * tier tend to share a subject, so a well-matched round can arrive as four
 * collective-noun questions in a row. This takes the best candidate that would
 * not over-fill a topic, and only falls back to ignoring topics if it cannot
 * fill the round otherwise.
 */
export function spaceByTopic(ranked: Question[], count: number): Question[] {
  const picked: Question[] = [];
  const topicCount = new Map<string, number>();
  const skipped: Question[] = [];

  const wouldClump = (q: Question) =>
    (q.tags ?? []).some((tag) => (topicCount.get(tag) ?? 0) >= MAX_PER_TOPIC);

  for (const q of ranked) {
    if (picked.length >= count) break;
    if (wouldClump(q)) {
      skipped.push(q);
      continue;
    }
    picked.push(q);
    (q.tags ?? []).forEach((tag) => topicCount.set(tag, (topicCount.get(tag) ?? 0) + 1));
  }

  // Not enough untagged-or-varied questions to fill the round: take the ones we
  // passed over rather than serving a short round.
  for (const q of skipped) {
    if (picked.length >= count) break;
    picked.push(q);
  }

  return picked;
}

export function buildQueue(
  mode: ModeId,
  cat: string | null,
  questionLimit?: number | null,
  profile?: Profile,
): Question[] {
  const pool = getQuestionsForMode(mode, cat, QUESTIONS);

  // The Daily is the same for everybody, so it gets no personalisation.
  if (mode === 'daily') {
    const limit = questionLimit ?? MODES.daily.questionLimit ?? 10;
    return seedShuffle(pool).slice(0, limit).map(shuffleOptions);
  }

  const target = skillFor(profile, cat);
  const explicitLimit = typeof questionLimit === 'number' ? questionLimit : MODES[mode].questionLimit;
  // Endless modes still need a working set; they refill as the player survives.
  const count = explicitLimit ?? Math.min(pool.length, 25);

  const picked = selectQuestions(pool, count, profile, target);
  const limited = typeof explicitLimit === 'number' ? picked.slice(0, explicitLimit) : limitQuestionsForMode(mode, picked);
  return limited.map(shuffleOptions);
}

// ── crowd hint ───────────────────────────────────────────────────────────────

/**
 * Plausible answer distribution for the "Crowd" hint, summing to 100%.
 *
 * The old version was a pure function of the correct index: `d[q.a] = q.c` and
 * the rest split by fixed weights [0.5, 0.32, 0.18], which put the correct
 * answer on the tallest bar 91.7% of the time. Buying the hint was equivalent
 * to buying the answer.
 *
 * Two changes fix that, and both make the model MORE realistic rather than
 * artificially noisier:
 *
 *   1. Wrong answers concentrate on one plausible trap rather than spreading
 *      evenly. That is how real players miss a question - they converge on the
 *      same wrong option, they do not scatter.
 *   2. The headline share is jittered, so the tallest bar is not `q.c` read
 *      straight back off the question.
 *
 * The reliability that falls out is then driven by the difficulty data itself:
 * on a warm-up question the crowd is right and the hint confirms it; on a
 * brutal one the crowd is genuinely wrong and the hint shows you the trap.
 * Seeded off the question id so the bars are stable within a round.
 */
export function distFor(q: Question): number[] {
  const rnd = mulberry32(hashString(q.id));

  const correctShare = Math.max(8, Math.min(82, Math.round(q.c + (rnd() - 0.5) * 14)));
  let remaining = 100 - correctShare;

  const others = [0, 1, 2, 3].filter((i) => i !== q.a);
  // One distractor is "the trap" and soaks up most of the wrong answers.
  const trapIndex = Math.floor(rnd() * others.length);
  const trapShare = Math.round(remaining * (0.42 + rnd() * 0.24));

  const dist = [0, 0, 0, 0];
  dist[q.a] = correctShare;
  dist[others[trapIndex]] = trapShare;
  remaining -= trapShare;

  const rest = others.filter((_, i) => i !== trapIndex);
  const split = Math.round(remaining * (0.4 + rnd() * 0.2));
  dist[rest[0]] = split;
  dist[rest[1]] = Math.max(0, remaining - split);

  return dist;
}

export function crowdBucketOf(c: number): number {
  return c < 26 ? 0 : c < 51 ? 1 : c < 76 ? 2 : 3;
}

// ── scoring ──────────────────────────────────────────────────────────────────

/** Answering inside this fraction of the clock earns the speed bonus. */
export const SPEED_BONUS_WINDOW = 0.55;
export const SPEED_BONUS_POINTS = 1;

export function isSpeedBonus(timeLeft: number, secondsPerQuestion: number | undefined): boolean {
  if (!secondsPerQuestion) return false;
  return timeLeft / secondsPerQuestion >= SPEED_BONUS_WINDOW;
}

export interface ScoreInput {
  mode: ModeId;
  correct: boolean;
  confidence: number | null;
  crowdBonus: boolean;
  speedBonus: boolean;
}

/**
 * Points for one answer.
 *
 * The old version returned 0 for any wrong answer regardless of the confidence
 * bet, which made "Locked In" strictly dominant - there was never a reason to
 * pick anything else, so the headline mechanic was a mandatory extra tap.
 * Wrong answers now cost what the bet was worth, and Hard Mode doubles the
 * downside along with the upside.
 */
export function pointsForAnswer({ mode, correct, confidence, crowdBonus, speedBonus }: ScoreInput): number {
  const multiplier = MODES[mode].scoreMultiplier ?? 1;
  const crowd = crowdBonus ? 2 : 0;

  if (!correct) {
    const level = CONF.find((c) => c.l === confidence);
    const risk = level ? level.risk * multiplier : 0;
    return crowd - risk;
  }

  const base = (confidence ?? 0) * multiplier;
  return base + crowd + (speedBonus ? SPEED_BONUS_POINTS : 0);
}

export const isMode = (id: ModeId) => MODES[id];

/** Difficulty tier a rating maps to, for display. */
export function tierLabel(skill: number): string {
  const rounded = Math.round(skill) as Difficulty;
  return ['', 'Warm-up', 'Easy', 'Medium', 'Hard', 'Brutal'][rounded] ?? 'Medium';
}
