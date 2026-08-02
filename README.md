# Trivia Trap

A trivia game built with **Expo + TypeScript + React Native**.

## Features

- **8 game modes** - Classic Trivia, Truth or Lie, Trap Questions, Beat the Crowd, Streak Run, Category Rush, Daily 10, and Hard Mode.
- **Confidence betting with real stakes** - bet Guessing / Confident / Locked In for 1-3 points, and lose 0 / 1 / 3 when you are wrong.
- **A clock on every mode**, with a speed bonus for answering in the first 55% of it.
- **Adaptive difficulty** - questions are matched to a per-category skill rating that tracks a 68% target accuracy.
- **Seen-question memory** so rounds stop repeating what you just played.
- **Hints as consumables** - 50/50, Crowd, and Skip, spent from an inventory that refills to a free floor daily or from the shop.
- **Shareable Daily** - spoiler-free result card, same ten questions for everyone.
- **Coin shop, streak freezes, badges, and a daily streak.**
- **Local persistence** via AsyncStorage, with a v1 -> v2 profile migration.

## The question bank

736 questions across 7 categories plus Truth or Lie and Trap.

**Every question has been through content review** — the answer checked, the
distractors checked for plausibility, the wording checked for ambiguity. That
review is what `verifiedAt` records, and the linter now hard-fails on any
question missing it, so new content cannot skip the step.

Claims that were surprising rather than settled — records, superlatives,
counterintuitive science, "first ever" firsts — were additionally **checked
against sources on the web** rather than from memory. Anything a search could
not settle was cut rather than shipped. Answers that can drift over time are
marked `volatile`, which forces a named `source` and an annual re-check.

```
src/data/
  questions.classic.ts    GENERATED - migrated from the pre-v2 bank
  questions.hard.ts       hand-authored difficulty 4/5, one hard tail per category
  questions.truthlie.ts   rebuilt - parallel-statement construction
  questions.trap.ts       rebuilt - five trap mechanisms, no stock riddles
  questions.ts            barrel that concatenates the four
  validation.ts           the lint rules, shared by the app and CI
```

Every question carries an explicit `d` difficulty tier (1-5), and `c`, the share
of players expected to get it right. The two must agree - the linter enforces
the band - because adaptive selection reads `d` and the Crowd hint reads `c`.

Answers that can rot (records, box office, titles won) are marked `volatile` and
must name a `source` and a `verifiedAt` date, which expires after a year.

### Linting

```bash
npm run lint:questions
```

Errors fail the build. It gates on:

| Rule | Why |
| --- | --- |
| `length-tell` | Correct answer must not be the longest option more than 31% of the time (random is 25%). The pre-v2 bank sat at 32.6% overall, 50% in Truth or Lie. |
| `difficulty-crowd-mismatch` | `d` and `c` describe the same thing; if they drift, selection mis-serves. |
| `joke-distractor` | Options like "Apology letter" collapse a 4-way choice to a 2-way. |
| `duplicate-stem` / `duplicate-claim` | The same question or the same true statement twice. |
| `dominant-stem` | No Truth or Lie template may cover more than 25% of the mode. |
| `thin-hard-tail` | Every category needs 6+ questions at difficulty 4+, or Hard Mode skews to whichever category has the most. |
| `stale-volatile` | A record last checked over a year ago. |
| `unverified` | A question with no `verifiedAt` skipped content review. |

Warnings do not fail: duplicate facts, recycled distractors, fictional-place
distractors, and per-question length gaps all need a human to judge.

### Regenerating the classic bank

```bash
npm run migrate:questions
```

Reads the pre-v2 bank out of git history and re-applies the cull. Hand edits to
`questions.classic.ts` do not survive - change the script's `DROP_IDS` or
`DISTRACTOR_REWRITES` instead.

## Project structure

```
App.tsx                     # root: fonts, safe area, screen router, bottom nav
src/
  theme.ts                  # color palette
  data/                     # questions, modes, categories, badges, shop
  game/
    logic.ts                # selection, scoring, crowd distribution, skill
    progress.ts             # end-of-round profile updates, streaks, freezes
    rating.ts               # review-prompt placement rules (pure, testable)
    share.ts                # Daily share card
    storage.ts              # AsyncStorage profile + v1->v2 migration
    useGame.ts              # the game state machine
  native/                   # notifications, review, haptics, sound
  components/               # Raised, Icon, Txt, Sheet, Confetti, BottomNav
  screens/                  # Home, Category, Question, Summary, Profile, Settings, Shop
    sheets/                 # Confidence, Crowd, Reveal, Rating
scripts/
  migrate-questions.js      # one-shot pre-v2 -> v2 bank migration
  lint-questions.js         # CI wrapper around src/data/validation.ts
```

## Review prompts

Two prompts, chained. A soft ask ("Enjoying Trivia Trap?") appears on the
Summary screen; only a positive answer spends one of the very limited native
store prompts. Both stores cap how often the native prompt can appear, so
firing it blind wastes that budget on people about to leave a bad review.

The earliest ask needs ~2 minutes of real play and a good round. It never fires
mid-round, never after a failed Streak Run, and never more than three times.
Rules live in `src/game/rating.ts`.

## Run it

```bash
npm install
npx expo start
```

Then press `a` (Android), `i` (iOS), or scan the QR code with Expo Go.

> **Notifications & in-app review** require a development build or a real device.
> `expo-store-review` only shows the system prompt in a real build.

To build a standalone app:

```bash
eas build --profile development --platform android
```
