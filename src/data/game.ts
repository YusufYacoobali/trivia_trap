import { QUESTIONS } from './questions';
import { Badge, ConfLevel, Mode, ModeId, Question } from './types';
import { validateQuestionBank } from './validation';

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
    secondsPerQuestion: 20,
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
];

export const CONF: ConfLevel[] = [
  { l: 1, name: 'Guessing', desc: 'Worth a shot', pts: '+1', color: '#1ba0cf', sh: '#1583a8', chip: '#e8f8fe' },
  { l: 2, name: 'Confident', desc: 'Pretty sure', pts: '+2', color: '#e8890b', sh: '#c2730a', chip: '#fff6e0' },
  { l: 3, name: 'Locked In', desc: '100% certain', pts: '+3', color: '#ff4d6d', sh: '#d63659', chip: '#fff0f3' },
];

export const CROWD = ['0-25%', '26-50%', '51-75%', '76-100%'];

export function getClassicQuestions(category: string | null, questions: Question[] = QUESTIONS): Question[] {
  return questions.filter((q) => q.kind === 'classic' && (category === 'All' || !category || q.cat === category));
}

export function getQuestionsForMode(mode: ModeId, category: string | null, questions: Question[] = QUESTIONS): Question[] {
  if (mode === 'classic' || mode === 'rush') return getClassicQuestions(category, questions);
  if (mode === 'truthlie') return questions.filter((q) => q.kind === 'truthlie');
  if (mode === 'trap') return questions.filter((q) => q.kind === 'trap');
  if (mode === 'beatcrowd') return questions.filter((q) => q.kind === 'classic');
  if (mode === 'hard') return questions.filter((q) => q.hard);
  return questions;
}

export function limitQuestionsForMode(mode: ModeId, questions: Question[]): Question[] {
  const limit = MODES[mode].questionLimit;
  return typeof limit === 'number' ? questions.slice(0, limit) : questions;
}

export function getCategoryQuestionCount(category: string): number {
  return getClassicQuestions(category).length;
}

const questionBankIssues = validateQuestionBank(QUESTIONS, CATS);

if (typeof __DEV__ !== 'undefined' && __DEV__ && questionBankIssues.length > 0) {
  console.warn('Trivia Trap question-bank issues:', questionBankIssues);
}
