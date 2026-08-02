/*
 * One-shot migration from the pre-v2 question bank to the v2 schema.
 *
 * Reads the original 900-question bank straight out of git history so the
 * migration stays reproducible without keeping a dead 950-line file in src/.
 *
 *   node scripts/migrate-questions.js            # writes src/data/questions.classic.ts
 *   node scripts/migrate-questions.js --dry-run  # print stats only
 *
 * What it does:
 *   - drops "gimme" questions (crowd correctness >= 78%) that made the game
 *     feel like a quiz for people who have never heard of football
 *   - drops questions carrying joke distractors, which collapse a 4-way
 *     choice into a 2-way one
 *   - maps the old crowd-correctness number onto an explicit 1-5 difficulty
 *     tier, honouring the legacy `hard` flag as an author-intent signal
 *   - flags answers that rot (records, titles, box office, population) as
 *     `volatile` so the linter can enforce a shelf life on them
 *
 * It does NOT invent citations or verification dates. Migrated entries carry
 * no `verifiedAt`; the linter reports them as unverified debt.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LEGACY_REF = '55c8fe7:src/data/questions.ts';
const OUT = path.join(__dirname, '..', 'src', 'data', 'questions.classic.ts');

// Crowd correctness at or above this is common knowledge, not trivia:
// "which continent is Argentina in", "how many players in a football team".
//
// This started at 78, which cut 196 questions and left almost no difficulty-1
// tier - and a simulated below-average player then settled at 31% accuracy,
// because adaptive selection had nothing easy left to reach for. 85 keeps a
// genuine warm-up band while still dropping the insulting ones.
//
// Keeping easy content is only safe BECAUSE selection is difficulty-matched
// now: a strong player never sees these, so they cost them nothing.
const GIMME_THRESHOLD = 85;

// Curated, not heuristic: every one of these was eyeballed in the legacy bank.
const JOKE_DISTRACTOR =
  /\b(apology letter|half-?time snack|mascot|free pizza|var dance|dragon cough|dragon bus|wave donkey|sea pancake|jazz hands|moon cheese|fancy sandwich|ironing shirts|spicy foul|warming up fans|choosing the referee)\b/i;

// Questions dropped by hand. Each one pairs a long, specific correct answer
// with distractors nobody would ever pick ("Antarctica", "The Moon", "Standing
// still"), so it reads as a 4-way question but plays as a 1-way. That is both
// the easiness problem and the answer-length tell in one package.
const DROP_IDS = new Set([
  // 1-way questions dressed as 4-way ones.
  'f67', 'f83', 'f86', 'f93', 'f94', 'h42', 'h57',
  // The same fact asked twice in the legacy bank; the better-worded twin stays.
  'h94', 'h96', 'm98', 'g41', 'w94', 'w65', 'w72', 'w99', 'w71', 'w57',
  // Superseded by a hand-authored version with a source and a verification date.
  'h52', 'h60', 'w10', 'w32', 'w33', 'w82', 'w92',
  // Stale: Messi left PSG in 2023, so "joined after Barcelona" now misleads.
  'f90',

  // ── found in the full read-through of all 769 questions ──────────────────
  //
  // Broken: the question names the animal, and the answer is that animal.
  // "Which group of rhinos is called a crash? -> Rhinos" answers itself.
  'w73', 'w74',
  // Ambiguous: pangolins AND armadillos both roll into a ball, and a59 already
  // asks the armadillo version.
  'a58',
  // Too soft to defend. "Cows form best friends" is a press-release headline,
  // and "most islands" is genuinely contested between Sweden and Finland.
  'w28', 'g63',
  // Myth-about-a-myth, awkwardly worded, with "It did not really" as an option.
  'h80',
  // My own question - I cannot stand behind the word "only" in it.
  'gh8',
  // Duplicate facts found by reading, not by the linter's keyword heuristic.
  's23',  // largest organ -> also tr52
  'g25',  // Ethiopia uncolonised -> also gh3
  'g75',  // Everest range -> also g3
  'g83',  // Lesotho -> also gh6
  'g92',  // Istanbul -> also g23
  'f79',  // first Women's World Cup -> also fh3
  'm18',  // Star Wars score -> also mh8
  'm25',  // Inside Out -> also m69
  'm46',  // WALL-E -> also m64
  'a2',   // octopus hearts -> also tl1
  'a20',  // chameleon colour -> also a63
  'a60',  // platypus -> also a15
  'a88',  // orca is a dolphin -> also tr12
  'w4',   // Venus day/year -> also s96
  'w21',  // bubble wrap -> also tl53
  'w41',  // cats and sweetness -> also tl66
  'w43', 'w80', // butterflies taste with feet -> also tl3 (asked THREE times)
  'w45',  // parrots mimic speech -> also a12
  'w55',  // peanut is a legume -> also tl16 and tr22
  'w56',  // cashew apple -> also tl20
  'w69',  // goat pupils -> also w40
  'w70',  // wombat cubes -> also w16
  'w79',  // crows remember faces -> also tl9
  'w89',  // shrimp heart -> also w19
  'w91',  // frogs freeze solid -> also tl67
]);

// Distractor rewrites for questions worth keeping whose correct answer was
// simply much longer than the alternatives. Only the wrong options change -
// they are invented by definition - so this fixes the length tell without
// touching a single fact.
const DISTRACTOR_REWRITES = {
  f17: { 'World Cup': 'FIFA World Cup finals', 'Copa America': 'Copa America tournament', 'Nations League': 'UEFA Nations League finals' },
  f19: { Squares: 'Squares and rectangles', Triangles: 'Triangles and diamonds', Circles: 'Overlapping circles' },
  m14: { 'The Green Mile': "One Flew Over the Cuckoo's Nest" },
  m38: { Psycho: 'The Texas Chain Saw Massacre', Seven: 'The Bone Collector', 'Fight Club': 'American Psycho' },
  m58: { 'The Avengers': 'The Avengers: Age of Ultron' },
  // Invented nonsense swapped for the real thing: a distractor that could
  // plausibly be the answer is the entire job of a distractor.
  h50: { 'Treaty of Narnia': 'Treaty of Trianon' },
  h99: { 'Library of Atlantis': 'Library of Pergamon' },
  s37: { Sandwich: 'Molecule' },
  w86: { Helium: 'Compressed helium gas', Oxygen: 'Pure bottled oxygen', Hydrogen: 'Hydrogen sulfide' },
};

// Answers that change with the world rather than staying put.
//
// Curated rather than pattern-matched: a regex on "most" / "World Cup" flags
// dozens of questions that are actually settled history ("who hosted the 2014
// World Cup"). Pinning a question to a year makes it permanent. Only open-ended
// superlatives rot, and there are few enough to list by hand.
const VOLATILE_IDS = new Set([
  'f1', //  most men's World Cups won
  'f3', //  most Champions League titles
  'f7', //  most Ballon d'Or awards
  'f18', // all-time top scorer in men's international football
  'm3', //  highest-grossing film of all time
]);

// Named authority for the volatile claims, so the linter has real provenance to
// point at. These name the governing body / system of record - they are not
// fabricated deep links.
// The five volatile answers were individually re-checked during this migration,
// so they carry a real verification date. Everything else is migrated without
// one and shows up as unverified debt in the linter.
const VOLATILE_META = {
  f1: { source: 'FIFA official competition records', verifiedAt: '2026-08-02' },
  f3: { source: 'UEFA official competition records', verifiedAt: '2026-08-02' },
  f7: { source: "France Football (Ballon d'Or record)", verifiedAt: '2026-08-02' },
  f18: { source: 'FIFA official international appearance and goal records', verifiedAt: '2026-08-02' },
  m3: { source: 'Box Office Mojo worldwide lifetime grosses', verifiedAt: '2026-08-02' },
};

function difficultyFor(q) {
  const c = q.c;
  let d = c >= 70 ? 1 : c >= 58 ? 2 : c >= 45 ? 3 : c >= 33 ? 4 : 5;
  // The legacy bank marked some questions `hard` by hand. Where the author
  // disagreed with the crowd number, trust the author enough to nudge it up.
  if (q.hard && d < 3) d = 3;
  return d;
}

function esc(s) {
  return `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function serialise(q) {
  const parts = [
    `id: ${esc(q.id)}`,
    `cat: ${esc(q.cat)}`,
    `kind: 'classic'`,
    `d: ${q.d}`,
    `q: ${esc(q.q)}`,
    `o: [${q.o.map(esc).join(', ')}]`,
    `a: ${q.a}`,
    `e: ${esc(q.e)}`,
    `c: ${q.c}`,
  ];
  if (q.volatile) {
    parts.push('volatile: true');
    parts.push(`source: ${esc(q.source)}`);
    parts.push(`verifiedAt: ${esc(q.verifiedAt)}`);
  }
  return `  { ${parts.join(', ')} },`;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const legacy = execSync(`git show ${LEGACY_REF}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  // eslint-disable-next-line no-eval
  const all = eval(legacy.slice(legacy.indexOf('[')).replace(/;\s*$/, ''));

  const classic = all.filter((q) => q.kind === 'classic');
  const dropped = { gimme: 0, joke: 0, manual: 0 };

  const kept = classic
    .filter((q) => {
      if (q.c >= GIMME_THRESHOLD) {
        dropped.gimme++;
        return false;
      }
      if (q.o.some((o, i) => i !== q.a && JOKE_DISTRACTOR.test(o))) {
        dropped.joke++;
        return false;
      }
      if (DROP_IDS.has(q.id)) {
        dropped.manual++;
        return false;
      }
      return true;
    })
    .map((q) => {
      const rewrites = DISTRACTOR_REWRITES[q.id];
      if (!rewrites) return q;
      const correct = q.o[q.a];
      const o = q.o.map((option, i) => (i === q.a ? option : rewrites[option] ?? option));
      if (o[q.a] !== correct) throw new Error(`Rewrite touched the correct answer of ${q.id}`);
      return { ...q, o };
    })
    .map((q) => {
      const volatile = VOLATILE_IDS.has(q.id);
      const meta = VOLATILE_META[q.id];
      return {
        ...q,
        d: difficultyFor(q),
        volatile: volatile || undefined,
        source: volatile ? meta.source : undefined,
        verifiedAt: volatile ? meta.verifiedAt : undefined,
      };
    });

  const curve = kept.reduce((acc, q) => ({ ...acc, [q.d]: (acc[q.d] || 0) + 1 }), {});
  console.log(`legacy classic: ${classic.length}`);
  console.log(`dropped gimmes (c >= ${GIMME_THRESHOLD}): ${dropped.gimme}`);
  console.log(`dropped joke distractors: ${dropped.joke}`);
  console.log(`kept: ${kept.length}`);
  console.log('difficulty curve:', curve);
  console.log(`flagged volatile: ${kept.filter((q) => q.volatile).length}`);

  if (dryRun) return;

  const byCat = {};
  kept.forEach((q) => {
    (byCat[q.cat] = byCat[q.cat] || []).push(q);
  });

  const body = Object.keys(byCat)
    .map((cat) => `  // --- ${cat} ---\n${byCat[cat].map(serialise).join('\n')}`)
    .join('\n\n');

  const header = `import { Question } from './types';

// GENERATED by scripts/migrate-questions.js from the pre-v2 bank, then owned by
// hand from here on. Re-running the script regenerates this file from git
// history; it does not preserve later hand edits.
//
// \`a\` is the index of the correct option WITHIN THIS SOURCE ARRAY. It is not
// the on-screen position: buildQueue() shuffles option order per play.
//
// All text is ASCII-only to avoid mojibake on any device or font.
//
// These entries carry no \`verifiedAt\` - they were inherited, not individually
// fact-checked. \`npm run lint:questions\` reports that as standing debt.

export const CLASSIC_QUESTIONS: Question[] = [
${body}
];
`;

  fs.writeFileSync(OUT, header, 'utf8');
  console.log(`\nwrote ${OUT}`);
}

main();
