import type { Question } from './types';

export interface QuestionBankIssue {
  id: string;
  message: string;
}

export function validateQuestionBank(questions: Question[], knownCategories: readonly string[]): QuestionBankIssue[] {
  const issues: QuestionBankIssue[] = [];
  const ids = new Set<string>();
  const categories = new Set(knownCategories.filter((cat) => cat !== 'All'));

  questions.forEach((question, index) => {
    const label = question.id || `#${index + 1}`;

    if (!question.id.trim()) issues.push({ id: label, message: 'Question id is required.' });
    if (!question.q.trim()) issues.push({ id: label, message: 'Question text is required.' });
    if (!question.e.trim()) issues.push({ id: label, message: 'Explanation text is required.' });
    if (ids.has(question.id)) issues.push({ id: label, message: `Duplicate question id "${question.id}".` });
    ids.add(question.id);

    if (!categories.has(question.cat) && question.kind === 'classic') {
      issues.push({ id: label, message: `Unknown category "${question.cat}". Add it to CATS and CATMETA first.` });
    }

    if (question.o.length !== 4) issues.push({ id: label, message: 'Each question must have exactly 4 options.' });
    question.o.forEach((option, optionIndex) => {
      if (!option.trim()) {
        issues.push({ id: label, message: `Option ${optionIndex + 1} is empty.` });
      }
    });
    if (!Number.isInteger(question.a) || question.a < 0 || question.a >= question.o.length) {
      issues.push({ id: label, message: `Answer index ${question.a} is outside the options array.` });
    }

    if (question.c < 0 || question.c > 100) {
      issues.push({ id: label, message: `Crowd correctness ${question.c} must be between 0 and 100.` });
    }
  });

  return issues;
}
