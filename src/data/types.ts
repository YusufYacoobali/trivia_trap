export type QuestionKind = 'classic' | 'truthlie' | 'trap';

/**
 * Authored difficulty tier. This replaced the old `hard: boolean` flag, which
 * could not express a curve and left Hard Mode dominated by whichever category
 * happened to have the most flags.
 *
 *   1  warm-up      most players get it
 *   2  easy         a beat of thought
 *   3  medium       the target band for a well-matched player
 *   4  hard         you either know it or you don't
 *   5  brutal       Hard Mode territory
 */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Question {
  id: string;
  cat: string;
  kind: QuestionKind;
  /** Authored difficulty tier; drives adaptive selection and Hard Mode. */
  d: Difficulty;
  q: string;
  o: [string, string, string, string];
  a: number; // index of correct answer
  e: string; // explanation shown on reveal
  /** Optional extra beat on the reveal: the "huh, neat" line. */
  hook?: string;
  c: number; // % of crowd that got it right
  tags?: string[];
  /**
   * Where the claim comes from. Free text or a URL. The linter requires this on
   * anything marked `volatile`, because those are the answers that rot.
   */
  source?: string;
  /**
   * ISO date (YYYY-MM-DD) a human actually checked this answer. Deliberately
   * optional: questions inherited from the pre-v2 bank were never individually
   * verified, and stamping them with a date would bake a false claim into the
   * data. The linter counts unverified entries as standing debt and hard-fails
   * on any `volatile` question that lacks a check.
   */
  verifiedAt?: string;
  /**
   * True when the correct answer can change over time: records, superlatives,
   * "most X ever", reigning champions. These get a shelf life the linter
   * enforces so they cannot silently go wrong.
   */
  volatile?: boolean;
}

/** Hard Mode and the old `hard` flag now derive from the difficulty tier. */
export const HARD_THRESHOLD: Difficulty = 4;
export const isHard = (q: Question): boolean => q.d >= HARD_THRESHOLD;

export type ModeId =
  | 'classic'
  | 'truthlie'
  | 'trap'
  | 'beatcrowd'
  | 'streak'
  | 'rush'
  | 'daily'
  | 'hard';

export interface Mode {
  id: ModeId;
  name: string;
  sub: string;
  icon: string;
  accent: string;
  sh: string;
  chip: string;
  gradient: [string, string];
  needCat?: boolean;
  crowd?: boolean;
  endless?: boolean;
  rush?: boolean;
  hard?: boolean;
  questionLimit?: number;
  scoreMultiplier?: number;
  // Ask the player how many questions they want before starting (no category).
  pickCount?: boolean;
  // Seconds allowed per question. Every mode has a clock now; `rush` is the
  // one where running it down ends the run instead of just costing the bonus.
  secondsPerQuestion?: number;
  // Rush survival: timing out ends the run.
  timeoutEndsRun?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface ConfLevel {
  l: 1 | 2 | 3;
  name: string;
  desc: string;
  pts: string;
  /** What a wrong answer costs at this level. Stored positive, applied negative. */
  risk: number;
  color: string;
  sh: string;
  chip: string;
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  cost: number;
  kind: 'hint' | 'freeze' | 'theme';
  /** For consumables: how many the purchase grants. */
  grants?: number;
  icon: string;
}
