import { QUESTIONS } from './questions';
import { Badge, ConfLevel, isHard, Mode, ModeId, Question, ShopItem } from './types';
import { errorsOnly, validateQuestionBank } from './validation';

declare const __DEV__: boolean;

export const MODES: Record<ModeId, Mode> = {
  classic: {
    id: 'classic',
    name: 'Classic Trivia',
    sub: '7 categories',
    icon: 'classic',
    accent: '#ff4d6d',
    sh: '#d63659',
    chip: '#fff0f3',
    gradient: ['#ff89a3', '#ff4d6d'],
    needCat: true,
    secondsPerQuestion: 30,
  },
  truthlie: {
    id: 'truthlie',
    name: 'Truth or Lie',
    sub: 'Spot the truth',
    icon: 'truthlie',
    accent: '#1ba0cf',
    sh: '#1583a8',
    chip: '#e8f8fe',
    gradient: ['#4fcef5', '#1ba0cf'],
    pickCount: true,
    // Four parallel statements take longer to read than a normal question.
    secondsPerQuestion: 40,
  },
  trap: {
    id: 'trap',
    name: 'Trap Questions',
    sub: "Don't assume",
    icon: 'trap',
    accent: '#e8890b',
    sh: '#c2730a',
    chip: '#fff6e0',
    gradient: ['#ffc15c', '#f59008'],
    pickCount: true,
    // Traps punish rushing, so the clock is generous on purpose.
    secondsPerQuestion: 45,
  },
  beatcrowd: {
    id: 'beatcrowd',
    name: 'Beat the Crowd',
    sub: 'Guess the %',
    icon: 'beatcrowd',
    accent: '#0fa066',
    sh: '#0c8052',
    chip: '#e6f8ef',
    gradient: ['#3ee08f', '#0fa066'],
    crowd: true,
    pickCount: true,
    secondsPerQuestion: 30,
  },
  streak: {
    id: 'streak',
    name: 'Streak Run',
    sub: 'One wrong = out',
    icon: 'streak',
    accent: '#7b5cff',
    sh: '#5f3fe0',
    chip: '#f1ecff',
    gradient: ['#a98bff', '#7b5cff'],
    endless: true,
    secondsPerQuestion: 25,
  },
  rush: {
    id: 'rush',
    name: 'Category Rush',
    sub: 'Beat the clock',
    icon: 'rush',
    accent: '#12b39a',
    sh: '#0d8f7c',
    chip: '#e8f8fe',
    gradient: ['#2fe6c6', '#12b39a'],
    needCat: true,
    rush: true,
    secondsPerQuestion: 15,
    timeoutEndsRun: true,
  },
  daily: {
    id: 'daily',
    name: 'Daily 10',
    sub: '10 mixed questions',
    icon: 'nav-daily',
    accent: '#ff4d6d',
    sh: '#d63659',
    chip: '#fff0f3',
    gradient: ['#ff5d7d', '#9b5cff'],
    questionLimit: 10,
    secondsPerQuestion: 30,
  },
  hard: {
    id: 'hard',
    name: 'Hard Mode',
    sub: 'Only the brutal ones',
    icon: 'hard',
    accent: '#2a2540',
    sh: '#15101f',
    chip: '#ece9f4',
    gradient: ['#2a2540', '#3a2f56'],
    hard: true,
    scoreMultiplier: 2,
    secondsPerQuestion: 35,
  },
};

export const FEATURED_MODE_IDS: ModeId[] = ['classic', 'truthlie', 'trap', 'beatcrowd', 'streak', 'rush'];

export const CATS = ['All', 'History', 'Science', 'Football', 'Movies', 'Geography', 'Animals', 'Weird facts'];

export interface CatMeta {
  gradient: [string, string];
  sh: string;
  icon: string;
}

export const CATMETA: Record<string, CatMeta> = {
  All: { gradient: ['#a98bff', '#7b5cff'], sh: '#5f3fe0', icon: 'star' },
  History: { gradient: ['#e0ad55', '#b9742a'], sh: '#94591c', icon: 'history' },
  Science: { gradient: ['#3ee08f', '#0fa066'], sh: '#0c8052', icon: 'science' },
  Football: { gradient: ['#4fcef5', '#1ba0cf'], sh: '#1583a8', icon: 'football' },
  Movies: { gradient: ['#ff89a3', '#ff4d6d'], sh: '#d63659', icon: 'movies' },
  Geography: { gradient: ['#8b9bff', '#5b6cf0'], sh: '#4250d0', icon: 'geography' },
  Animals: { gradient: ['#ffc15c', '#f59008'], sh: '#c2730a', icon: 'animals' },
  'Weird facts': { gradient: ['#ff8fd6', '#d6336c'], sh: '#a8235a', icon: 'weird' },
};

export const BADGES: Badge[] = [
  { id: 'first', name: 'First Win', desc: 'Finish your first round', icon: '*' },
  { id: 'streak5', name: 'On Fire', desc: '5 right in a row', icon: '∞' },
  { id: 'locked', name: 'Locked In', desc: 'Nail a Locked In answer', icon: '◆' },
  { id: 'perfect', name: 'Flawless', desc: 'Perfect round', icon: '✓' },
  { id: 'trapper', name: 'Trap Dodger', desc: 'Beat a trap question', icon: '!' },
  { id: 'crowd', name: 'Mind Reader', desc: 'Beat the Crowd', icon: '%' },
  { id: 'nerve', name: 'Nerves of Steel', desc: 'Win a Locked In on a brutal question', icon: '♠' },
  { id: 'quick', name: 'Quick Draw', desc: 'Answer 5 in a row before the clock halves', icon: '»' },
  { id: 'week', name: 'Regular', desc: 'Keep a 7 day streak', icon: '7' },
];

/**
 * Confidence levels. `risk` is what a wrong answer costs.
 *
 * Before this, a wrong answer scored 0 no matter what you bet, which made
 * "Locked In" strictly dominant - there was never a reason to pick anything
 * else, so the whole mechanic was a mandatory extra tap.
 */
export const CONF: ConfLevel[] = [
  { l: 1, name: 'Guessing', desc: 'No risk, no reward', pts: '+1', risk: 0, color: '#1ba0cf', sh: '#1583a8', chip: '#e8f8fe' },
  { l: 2, name: 'Confident', desc: 'Pretty sure', pts: '+2', risk: 1, color: '#e8890b', sh: '#c2730a', chip: '#fff6e0' },
  { l: 3, name: 'Locked In', desc: '100% certain', pts: '+3', risk: 3, color: '#ff4d6d', sh: '#d63659', chip: '#fff0f3' },
];

export const CROWD = ['0-25%', '26-50%', '51-75%', '76-100%'];

/** Coins had no sink before this - they only ever went up. */
export const SHOP: ShopItem[] = [
  { id: 'pack-fifty', name: '50/50 Pack', desc: 'Three extra 50/50 hints', cost: 120, kind: 'hint', grants: 3, icon: '½' },
  { id: 'pack-crowd', name: 'Crowd Pack', desc: 'Three extra Crowd reads', cost: 140, kind: 'hint', grants: 3, icon: '%' },
  { id: 'pack-skip', name: 'Skip Pack', desc: 'Three extra skips', cost: 100, kind: 'hint', grants: 3, icon: '»' },
  { id: 'freeze', name: 'Streak Freeze', desc: 'Miss a day without losing your streak', cost: 350, kind: 'freeze', grants: 1, icon: '❄' },
  // Themes are NOT listed. The purchase flow works and sets Profile.theme, but
  // nothing reads that field yet, so selling one would take 600 coins for a
  // change the player cannot see. Re-add these once the palette actually
  // switches - `kind: 'theme'` is still handled end to end in buyItem/ShopScreen.
];

export function getClassicQuestions(category: string | null, questions: Question[] = QUESTIONS): Question[] {
  return questions.filter((q) => q.kind === 'classic' && (category === 'All' || !category || q.cat === category));
}

export function getQuestionsForMode(mode: ModeId, category: string | null, questions: Question[] = QUESTIONS): Question[] {
  if (mode === 'classic' || mode === 'rush') return getClassicQuestions(category, questions);
  if (mode === 'truthlie') return questions.filter((q) => q.kind === 'truthlie');
  if (mode === 'trap') return questions.filter((q) => q.kind === 'trap');
  if (mode === 'beatcrowd') return questions.filter((q) => q.kind === 'classic');
  if (mode === 'hard') return questions.filter(isHard);
  return questions;
}

export function limitQuestionsForMode(mode: ModeId, questions: Question[]): Question[] {
  const limit = MODES[mode].questionLimit;
  return typeof limit === 'number' ? questions.slice(0, limit) : questions;
}

export function getCategoryQuestionCount(category: string): number {
  return getClassicQuestions(category).length;
}

// Dev-time sanity check. The bank-wide statistical rules (length tell, dupe
// facts, difficulty balance) are skipped here because they are O(n^2) and
// belong in CI - `npm run lint:questions` runs the full set.
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  const issues = errorsOnly(validateQuestionBank(QUESTIONS, CATS, { skipBankWide: true }));
  if (issues.length > 0) console.warn('Trivia Trap question-bank errors:', issues);
}
