import type { Difficulty, Question } from './types';

export type IssueLevel = 'error' | 'warn' | 'info';

export interface QuestionBankIssue {
  level: IssueLevel;
  rule: string;
  id: string;
  message: string;
}

/**
 * Crowd-correctness band each difficulty tier is allowed to sit in. `c` and `d`
 * describe the same thing from two directions, so if they drift apart one of
 * them is lying and adaptive difficulty starts mis-serving questions.
 */
export const DIFFICULTY_BANDS: Record<Difficulty, [number, number]> = {
  1: [70, 92],
  2: [58, 69],
  3: [45, 57],
  4: [33, 44],
  5: [15, 32],
};

/**
 * How often the correct answer may be the strictly longest option. Random is
 * 25%. The pre-v2 bank sat at 32.6% overall and 50% in Truth or Lie, which is
 * a tell strong enough to answer on without reading the question.
 */
export const LENGTH_TELL_RANGE: [number, number] = [0.18, 0.31];

/** A volatile answer older than this has to be re-checked before release. */
export const VOLATILE_MAX_AGE_DAYS = 365;

/** Every classic category needs a real hard tail or Hard Mode skews to one. */
export const MIN_HARD_PER_CATEGORY = 6;

/** Distractors that turn a 4-way choice into a 2-way one. */
const JOKE_DISTRACTOR =
  /\b(apology letter|half-?time snack|mascot|free pizza|var dance|dragon cough|dragon bus|wave donkey|sea pancake|jazz hands|moon cheese)\b/i;

/**
 * Fictional places used as distractors. Warning rather than error, because
 * these are sometimes legitimate - "El Dorado" is a fair distractor for a
 * question about Aztec cities, and a Narnia option belongs in a question about
 * fantasy series. What it catches is the lazy composite: "Treaty of Narnia",
 * "Library of Atlantis", where a real category noun is glued to a fake place
 * and nobody would ever pick it.
 */
const FICTIONAL_PLACE =
  /\b(narnia|hogwarts|mordor|atlantis|gotham|wakanda|neverland|asgard|krypton|shangri-?la|westeros|middle.earth)\b/i;

const STOPWORDS = new Set(
  'the a an of in on is are was were to for and or with which what who how many does do you your it its that this these those from at by as be been more most than then their there they them can cannot never always only about'.split(
    ' ',
  ),
);

function keywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 4 && !STOPWORDS.has(w)),
  );
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isStrictlyLongest(q: Question): boolean {
  const lengths = q.o.map((o) => o.length);
  const max = Math.max(...lengths);
  return lengths[q.a] === max && lengths.filter((l) => l === max).length === 1;
}

function daysBetween(fromISO: string, toISO: string): number {
  const from = Date.parse(fromISO);
  const to = Date.parse(toISO);
  if (Number.isNaN(from) || Number.isNaN(to)) return NaN;
  return Math.round((to - from) / 86400000);
}

export interface ValidateOptions {
  /** ISO date used as "now" for volatile shelf-life checks. */
  today?: string;
  /** Skip the O(n^2) cross-bank duplicate scan (dev runtime uses this). */
  skipBankWide?: boolean;
}

export function validateQuestionBank(
  questions: Question[],
  knownCategories: readonly string[],
  options: ValidateOptions = {},
): QuestionBankIssue[] {
  const issues: QuestionBankIssue[] = [];
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const ids = new Set<string>();
  const categories = new Set(knownCategories.filter((cat) => cat !== 'All'));

  const push = (level: IssueLevel, rule: string, id: string, message: string) =>
    issues.push({ level, rule, id, message });

  // ── per-question invariants ────────────────────────────────────────────────
  questions.forEach((question, index) => {
    const label = question.id || `#${index + 1}`;

    if (!question.id.trim()) push('error', 'id-required', label, 'Question id is required.');
    if (!question.q.trim()) push('error', 'text-required', label, 'Question text is required.');
    if (!question.e.trim()) push('error', 'explanation-required', label, 'Explanation text is required.');
    if (ids.has(question.id)) push('error', 'duplicate-id', label, `Duplicate question id "${question.id}".`);
    ids.add(question.id);

    if (!categories.has(question.cat) && question.kind === 'classic') {
      push('error', 'unknown-category', label, `Unknown category "${question.cat}". Add it to CATS and CATMETA first.`);
    }

    if (question.o.length !== 4) push('error', 'option-count', label, 'Each question must have exactly 4 options.');
    question.o.forEach((option, optionIndex) => {
      if (!option.trim()) push('error', 'empty-option', label, `Option ${optionIndex + 1} is empty.`);
    });

    const seenOptions = new Set(question.o.map((o) => normalise(o)));
    if (seenOptions.size !== question.o.length) {
      push('error', 'duplicate-option', label, 'Two options are identical.');
    }

    if (!Number.isInteger(question.a) || question.a < 0 || question.a >= question.o.length) {
      push('error', 'answer-index', label, `Answer index ${question.a} is outside the options array.`);
    }

    if (question.c < 0 || question.c > 100) {
      push('error', 'crowd-range', label, `Crowd correctness ${question.c} must be between 0 and 100.`);
    }

    // difficulty tier
    if (!Number.isInteger(question.d) || question.d < 1 || question.d > 5) {
      push('error', 'difficulty-range', label, `Difficulty ${question.d} must be an integer 1-5.`);
    } else {
      const [lo, hi] = DIFFICULTY_BANDS[question.d];
      if (question.c < lo || question.c > hi) {
        push(
          'error',
          'difficulty-crowd-mismatch',
          label,
          `Difficulty ${question.d} expects crowd ${lo}-${hi}%, got ${question.c}%.`,
        );
      }
    }

    // joke distractors
    question.o.forEach((option, optionIndex) => {
      if (optionIndex === question.a) return;
      if (JOKE_DISTRACTOR.test(option)) {
        push('error', 'joke-distractor', label, `Option "${option}" is a throwaway - it collapses the choice to a 2-way.`);
      } else if (FICTIONAL_PLACE.test(option)) {
        push('warn', 'fictional-distractor', label, `Option "${option}" names a fictional place - check nobody would rule it out on sight.`);
      }
    });

    // per-question length tell
    const lengths = question.o.map((o) => o.length);
    const longestDistractor = Math.max(...lengths.filter((_, i) => i !== question.a));
    if (lengths[question.a] > longestDistractor * 1.6 && lengths[question.a] - longestDistractor > 12) {
      push(
        'warn',
        'long-answer-tell',
        label,
        `Correct option is ${lengths[question.a]} chars vs ${longestDistractor} for the longest distractor - guessable on length alone.`,
      );
    }

    // provenance
    if (question.volatile) {
      if (!question.source || !question.source.trim()) {
        push('error', 'volatile-needs-source', label, 'Volatile answers must name a source.');
      }
      if (!question.verifiedAt) {
        push('error', 'volatile-needs-check', label, 'Volatile answers must record a verifiedAt date.');
      } else {
        const age = daysBetween(question.verifiedAt, today);
        if (Number.isNaN(age)) {
          push('error', 'bad-date', label, `verifiedAt "${question.verifiedAt}" is not a YYYY-MM-DD date.`);
        } else if (age > VOLATILE_MAX_AGE_DAYS) {
          push('error', 'stale-volatile', label, `Volatile answer last checked ${age} days ago - re-verify before shipping.`);
        }
      }
    }

    // non-ASCII sneaks in as mojibake on some devices
    const text = `${question.q}${question.o.join('')}${question.e}${question.hook ?? ''}`;
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(text)) {
      push('warn', 'non-ascii', label, 'Contains non-ASCII characters, which can render as mojibake.');
    }
  });

  if (options.skipBankWide) return issues;

  // ── bank-wide distribution ─────────────────────────────────────────────────

  // The answer-length tell, overall and per kind.
  const tellFor = (pool: Question[]) => pool.filter(isStrictlyLongest).length / Math.max(pool.length, 1);
  const [tellLo, tellHi] = LENGTH_TELL_RANGE;
  const checkTell = (pool: Question[], scope: string) => {
    if (pool.length < 40) return;
    const rate = tellFor(pool);
    if (rate < tellLo || rate > tellHi) {
      push(
        'error',
        'length-tell',
        scope,
        `Correct answer is the longest option ${(rate * 100).toFixed(1)}% of the time (allowed ${tellLo * 100}-${tellHi * 100}%, random is 25%).`,
      );
    }
  };
  checkTell(questions, 'bank');
  (['classic', 'truthlie', 'trap'] as const).forEach((kind) =>
    checkTell(
      questions.filter((q) => q.kind === kind),
      `kind:${kind}`,
    ),
  );

  // Repeated question stems.
  //
  // Classic and Trap questions each ask something specific, so an identical
  // stem means a genuine duplicate. Truth or Lie deliberately reuses a rotating
  // set of templates ("Spot the genuine fact:") - there the failure mode is
  // that ONE stem dominates, which is what the old bank did with two stems
  // across 100 items. So diversity is checked instead of uniqueness.
  const specificStems = new Map<string, string[]>();
  questions
    .filter((q) => q.kind !== 'truthlie')
    .forEach((q) => {
      const key = normalise(q.q);
      specificStems.set(key, [...(specificStems.get(key) ?? []), q.id]);
    });
  specificStems.forEach((matchingIds, stem) => {
    if (matchingIds.length > 1) {
      push('error', 'duplicate-stem', matchingIds.join(','), `Identical question text: "${stem.slice(0, 60)}".`);
    }
  });

  const truthlie = questions.filter((q) => q.kind === 'truthlie');
  if (truthlie.length >= 20) {
    const templateUse = new Map<string, number>();
    truthlie.forEach((q) => {
      const key = normalise(q.q);
      templateUse.set(key, (templateUse.get(key) ?? 0) + 1);
    });
    if (templateUse.size < 6) {
      push('error', 'thin-stem-variety', 'kind:truthlie', `Only ${templateUse.size} distinct stems (need 6+) - the mode reads as one repeated question.`);
    }
    templateUse.forEach((count, stem) => {
      const share = count / truthlie.length;
      if (share > 0.25) {
        push('error', 'dominant-stem', stem.slice(0, 40), `Used by ${(share * 100).toFixed(0)}% of Truth or Lie items (max 25%).`);
      }
    });

    // The claims themselves still have to be unique.
    const claims = new Map<string, string[]>();
    truthlie.forEach((q) => {
      const key = normalise(q.o[q.a]);
      claims.set(key, [...(claims.get(key) ?? []), q.id]);
    });
    claims.forEach((matchingIds, claim) => {
      if (matchingIds.length > 1) {
        push('error', 'duplicate-claim', matchingIds.join(','), `Same true statement used twice: "${claim.slice(0, 50)}".`);
      }
    });
  }

  // The same fact asked twice in different modes.
  //
  // Raw keyword overlap is far too noisy - "united", "states" and "country"
  // co-occur across dozens of unrelated questions. What actually identifies a
  // repeated fact is shared RARE words: two questions both mentioning "hadrian"
  // are about the same wall. So overlap is weighted by document frequency.
  const fingerprints = questions.map((q) => ({ q, k: keywords(`${q.q} ${q.o[q.a]}`) }));
  const documentFrequency = new Map<string, number>();
  fingerprints.forEach(({ k }) => k.forEach((w) => documentFrequency.set(w, (documentFrequency.get(w) ?? 0) + 1)));
  const RARE = 4;

  for (let i = 0; i < fingerprints.length; i++) {
    for (let j = i + 1; j < fingerprints.length; j++) {
      const shared = [...fingerprints[i].k].filter((w) => fingerprints[j].k.has(w));
      if (shared.length < 3) continue;
      const rare = shared.filter((w) => (documentFrequency.get(w) ?? 0) <= RARE);
      if (rare.length < 2) continue;
      push(
        'warn',
        'duplicate-fact',
        `${fingerprints[i].q.id},${fingerprints[j].q.id}`,
        `Likely the same fact twice (shared: ${rare.slice(0, 4).join(', ')}).`,
      );
    }
  }

  // Distractors recycled so often that players learn the list, not the facts.
  //
  // Scoped to Truth or Lie and Trap, where options are full claims. In Classic
  // the options are proper nouns and reusing "Germany" across a history bank is
  // normal, not a defect - flagging it just trains people to ignore the linter.
  const distractorUse = new Map<string, number>();
  questions
    .filter((q) => q.kind === 'truthlie' || q.kind === 'trap')
    .forEach((q) =>
      q.o.forEach((option, i) => {
        if (i === q.a) return;
        const key = normalise(option);
        distractorUse.set(key, (distractorUse.get(key) ?? 0) + 1);
      }),
    );
  distractorUse.forEach((count, option) => {
    if (count > 2) {
      push('warn', 'recycled-distractor', option.slice(0, 40), `Used as a distractor ${count} times - players learn the list, not the facts.`);
    }
  });

  // Hard tail per classic category.
  const classicCats = new Set(questions.filter((q) => q.kind === 'classic').map((q) => q.cat));
  classicCats.forEach((cat) => {
    const hard = questions.filter((q) => q.cat === cat && q.d >= 4).length;
    if (hard < MIN_HARD_PER_CATEGORY) {
      push(
        'error',
        'thin-hard-tail',
        cat,
        `Only ${hard} questions at difficulty 4+ (need ${MIN_HARD_PER_CATEGORY}) - Hard Mode and adaptive difficulty will skew away from this category.`,
      );
    }
  });

  // Standing verification debt, reported rather than enforced.
  const unverified = questions.filter((q) => !q.verifiedAt).length;
  if (unverified > 0) {
    push('info', 'unverified-debt', 'bank', `${unverified} of ${questions.length} questions have never been individually fact-checked.`);
  }

  // Topic spacing during selection only works on tagged questions, so coverage
  // is reported per kind - otherwise the feature silently does nothing for a
  // mode and nobody notices.
  (['classic', 'truthlie', 'trap'] as const).forEach((kind) => {
    const pool = questions.filter((q) => q.kind === kind);
    if (pool.length === 0) return;
    const tagged = pool.filter((q) => q.tags && q.tags.length > 0).length;
    if (tagged < pool.length) {
      push(
        'info',
        'tag-coverage',
        `kind:${kind}`,
        `${tagged}/${pool.length} tagged - round topic-spacing is inactive for the other ${pool.length - tagged}.`,
      );
    }
  });

  return issues;
}

export const errorsOnly = (issues: QuestionBankIssue[]) => issues.filter((i) => i.level === 'error');
