/*
 * Question-bank linter. Run it before shipping content:
 *
 *   npm run lint:questions
 *
 * Errors fail the process (exit 1); warnings and info are printed and pass.
 *
 * The rules themselves live in src/data/validation.ts so the app and this
 * script cannot drift apart - the file is transpiled on the fly with the
 * TypeScript compiler that is already a devDependency.
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const SRC = path.join(__dirname, '..', 'src');

// Minimal TS require hook: transpile-only, no type checking (tsc --noEmit
// already covers that via `npm run typecheck`).
require.extensions['.ts'] = function loadTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  });
  return module._compile(outputText, filename);
};
void Module;

const { QUESTIONS } = require(path.join(SRC, 'data', 'questions.ts'));
const { CATS } = require(path.join(SRC, 'data', 'game.ts'));
const { validateQuestionBank } = require(path.join(SRC, 'data', 'validation.ts'));

const COLOURS = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[36m', reset: '\x1b[0m' };

function summarise(questions) {
  const byKind = {};
  const byCat = {};
  const curve = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  questions.forEach((q) => {
    byKind[q.kind] = (byKind[q.kind] || 0) + 1;
    byCat[q.cat] = (byCat[q.cat] || 0) + 1;
    curve[q.d] = (curve[q.d] || 0) + 1;
  });

  const lengths = questions.map((q) => {
    const l = q.o.map((o) => o.length);
    const max = Math.max(...l);
    return l[q.a] === max && l.filter((x) => x === max).length === 1;
  });
  const tell = (100 * lengths.filter(Boolean).length) / questions.length;

  console.log(`\nbank: ${questions.length} questions`);
  console.log('  by kind:  ', Object.entries(byKind).map(([k, v]) => `${k} ${v}`).join('  '));
  console.log('  by cat:   ', Object.entries(byCat).map(([k, v]) => `${k} ${v}`).join('  '));
  console.log('  curve:    ', Object.entries(curve).map(([k, v]) => `d${k} ${v}`).join('  '));
  console.log(`  length tell: ${tell.toFixed(1)}% (random 25%)`);
  console.log(`  volatile:  ${questions.filter((q) => q.volatile).length}`);
  console.log(`  verified:  ${questions.filter((q) => q.verifiedAt).length}`);
}

function main() {
  const issues = validateQuestionBank(QUESTIONS, CATS);
  summarise(QUESTIONS);

  const grouped = { error: [], warn: [], info: [] };
  issues.forEach((i) => grouped[i.level].push(i));

  ['error', 'warn', 'info'].forEach((level) => {
    const list = grouped[level];
    if (!list.length) return;
    console.log(`\n${COLOURS[level]}${level.toUpperCase()} (${list.length})${COLOURS.reset}`);
    // Group by rule so a systemic problem reads as one finding, not 200.
    const byRule = {};
    list.forEach((i) => (byRule[i.rule] = [...(byRule[i.rule] || []), i]));
    Object.entries(byRule).forEach(([rule, items]) => {
      console.log(`  ${rule} (${items.length})`);
      items.slice(0, 8).forEach((i) => console.log(`    ${i.id}: ${i.message}`));
      if (items.length > 8) console.log(`    ... and ${items.length - 8} more`);
    });
  });

  console.log('');
  if (grouped.error.length) {
    console.log(`${COLOURS.error}FAILED${COLOURS.reset} - ${grouped.error.length} error(s)\n`);
    process.exit(1);
  }
  console.log(`${COLOURS.info}PASSED${COLOURS.reset} - ${grouped.warn.length} warning(s)\n`);
}

main();
