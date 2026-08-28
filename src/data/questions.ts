import { CLASSIC_QUESTIONS } from './questions.classic';
import { HARD_QUESTIONS } from './questions.hard';
import { TRAP_QUESTIONS } from './questions.trap';
import { TRUTHLIE_QUESTIONS } from './questions.truthlie';
import { Question } from './types';

// The bank is split by provenance rather than kept in one 950-line array:
//
//   questions.classic   migrated from the pre-v2 bank, gimmes and joke
//                       distractors removed (see scripts/migrate-questions.js)
//   questions.hard      hand-authored difficulty 4/5 filling the thin end of
//                       the curve so every category has a real hard tail
//   questions.truthlie  rebuilt - parallel-statement construction
//   questions.trap      rebuilt - five trap mechanisms, no stock riddles
//
// `npm run lint:questions` gates the whole thing on difficulty balance, the
// answer-length tell, duplicate facts and stale volatile claims.

export const QUESTIONS: Question[] = [
  ...CLASSIC_QUESTIONS,
  ...HARD_QUESTIONS,
  ...TRUTHLIE_QUESTIONS,
  ...TRAP_QUESTIONS,
];
