/**
 * Spoiler-free Daily share card.
 *
 * The Daily already used a date-seeded shuffle, so everyone gets the same ten
 * questions - which is exactly the precondition for a Wordle-style share. The
 * pattern shows how someone did without revealing a single answer, which is
 * what makes it safe to post.
 */

/** Day 1 of the Daily. Shifting this renumbers every share card, so leave it. */
const DAILY_EPOCH = '2026-01-01';

const CORRECT = '\u{1F7E9}'; // green square
const WRONG = '\u{1F7E5}'; // red square

export function dailyNumber(dateKey: string): number {
  const from = Date.parse(`${DAILY_EPOCH}T00:00:00Z`);
  const to = Date.parse(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 1;
  return Math.max(1, Math.round((to - from) / 86400000) + 1);
}

/** '1' for right, '0' for wrong, one character per question. */
export function patternToSquares(pattern: string): string {
  const squares = [...pattern].map((ch) => (ch === '1' ? CORRECT : WRONG));
  // Split into two rows of five so it reads as a block, not a long line.
  if (squares.length <= 5) return squares.join('');
  const mid = Math.ceil(squares.length / 2);
  return `${squares.slice(0, mid).join('')}\n${squares.slice(mid).join('')}`;
}

export interface DailyShareInput {
  dateKey: string;
  pattern: string;
  score: number;
  dayStreak: number;
}

export function buildDailyShare({ dateKey, pattern, score, dayStreak }: DailyShareInput): string {
  const correct = [...pattern].filter((ch) => ch === '1').length;
  const lines = [
    `Trivia Trap Daily #${dailyNumber(dateKey)}`,
    patternToSquares(pattern),
    `${correct}/${pattern.length} correct - ${score} points`,
  ];
  if (dayStreak > 1) lines.push(`\u{1F525} ${dayStreak} day streak`);
  return lines.join('\n');
}

/**
 * Opens the OS share sheet. Resolves to true when the player actually shared,
 * so the caller can reward it. Never throws - a cancelled share is not an error.
 */
export async function shareDaily(input: DailyShareInput): Promise<boolean> {
  try {
    // Imported here rather than at module scope so the card builders above stay
    // pure and importable outside React Native - the same split as rating.ts
    // and native/review.ts.
    const { Share } = await import('react-native');
    const result = await Share.share({ message: buildDailyShare(input) });
    return result.action === Share.sharedAction;
  } catch {
    return false;
  }
}
