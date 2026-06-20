export type QuestionKind = 'classic' | 'truthlie' | 'trap';

export interface Question {
  id: string;
  cat: string;
  kind: QuestionKind;
  hard?: boolean;
  q: string;
  o: [string, string, string, string];
  a: number; // index of correct answer
  e: string; // explanation
  c: number; // % of crowd that got it right
}

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
  // Rush survival: seconds allowed per question before the run ends.
  secondsPerQuestion?: number;
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
  color: string;
  sh: string;
  chip: string;
}
