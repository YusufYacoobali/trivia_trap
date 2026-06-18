# Trivia Trap

A polished trivia game built with **Expo + TypeScript + React Native**, recreated 1:1 from the design mockup (`Trivia Trap.dc.html`).

## Features

- **8 game modes** - Classic Trivia, Truth or Lie, Trap Questions, Beat the Crowd, Streak Run, Category Rush (timed), Daily 10, and Hard Mode.
- **Confidence betting** - bet Guessing / Confident / Locked In for 1-3 points per question.
- **Hints** - 50/50, Crowd (shows the answer distribution), and Skip.
- **Beat the Crowd** - guess what % of players got the question right for bonus points.
- **Badges, coins, levels, daily streak, and a leaderboard** on the profile screen.
- **Settings** - sound, haptics, every-other-day reminder toggle, and reset progress.
- **Local persistence** via AsyncStorage.
- **Every-other-day notifications** - rolling local reminders at 7 PM, wired to the reminder setting (`expo-notifications`).
- **Native in-app review** - prompts at most once every other day after finishing a round (`expo-store-review`).
- **Haptics** on answers (`expo-haptics`).

## Project structure

```
App.tsx                     # root: fonts, safe area, screen router, bottom nav
src/
  theme.ts                  # color palette ported from the mockup
  data/                     # questions, modes, categories, badges, conf levels
  game/
    logic.ts                # buildQueue, shuffle/seedShuffle, distFor
    storage.ts              # AsyncStorage profile load/save
    useGame.ts              # the full game state machine + native side-effects
  native/
    notifications.ts        # every-other-day reminder scheduling
    review.ts               # every-other-day in-app review pacing
    haptics.ts              # guarded haptic helpers
  components/               # Raised, Icon, Txt, Sheet, Confetti, BottomNav
  screens/                  # Home, Category, Question, Summary, Profile, Settings
    sheets/                 # Confidence, Crowd, Reveal bottom sheets
```

## Run it

```bash
npm install
npx expo start
```

Then press `a` (Android), `i` (iOS), or scan the QR code with Expo Go.

> **Notifications & in-app review** require a development build or a real device.
> In Expo Go local notifications work on a physical device; `expo-store-review`
> only shows the system prompt in a real build (it safely no-ops elsewhere).

To build a standalone app:

```bash
npx expo install expo-dev-client
eas build --profile development --platform android
```
