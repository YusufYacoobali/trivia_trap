import { getQuestionsForMode, limitQuestionsForMode, MODES } from '../data/game';
import { QUESTIONS } from '../data/questions';
import { ModeId, Question } from '../data/types';

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deterministic daily shuffle so everyone gets the same Daily 10 each day.
export function seedShuffle<T>(arr: T[], date = new Date()): T[] {
  const a = arr.slice();
  let s = date.getFullYear() * 1000 + date.getMonth() * 40 + date.getDate();
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
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

export function buildQueue(mode: ModeId, cat: string | null, questionLimit?: number | null): Question[] {
  const pool = getQuestionsForMode(mode, cat, QUESTIONS);
  const queue = mode === 'daily' ? seedShuffle(pool) : shuffle(pool);
  const limited = typeof questionLimit === 'number' ? queue.slice(0, questionLimit) : limitQuestionsForMode(mode, queue);
  return limited.map(shuffleOptions);
}

// Plausible answer-distribution for the "Crowd" hint, summing to ~100%.
export function distFor(q: Question): number[] {
  const c = q.c;
  const rem = 100 - c;
  const others = [0, 1, 2, 3].filter((i) => i !== q.a);
  const w = [0.5, 0.32, 0.18];
  const d = [0, 0, 0, 0];
  d[q.a] = c;
  others.forEach((idx, k) => {
    d[idx] = Math.round(rem * w[k]);
  });
  return d;
}

export function crowdBucketOf(c: number): number {
  return c < 26 ? 0 : c < 51 ? 1 : c < 76 ? 2 : 3;
}

export function pointsForAnswer(mode: ModeId, correct: boolean, confidence: number | null, crowdBonus: boolean): number {
  if (!correct) return crowdBonus ? 2 : 0;
  const base = confidence ?? 0;
  const multiplier = MODES[mode].scoreMultiplier ?? 1;
  return base * multiplier + (crowdBonus ? 2 : 0);
}

export const isMode = (id: ModeId) => MODES[id];
