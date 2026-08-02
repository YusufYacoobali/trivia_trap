import { useCallback, useEffect, useRef, useState } from 'react';

import { MODES } from '../data/game';
import { Badge, ModeId, Question, ShopItem } from '../data/types';
import { resultHaptic, tapHaptic } from '../native/haptics';
import { syncPlayReminders } from '../native/notifications';
import { requestNativeReview } from '../native/review';
import { playSound } from '../native/sound';
import { buildQueue, crowdBucketOf, isSpeedBonus, pointsForAnswer, shuffle } from './logic';
import { applyRoundProgress } from './progress';
import {
  canRequestNative,
  recordNativeShown,
  recordSoftAskAnswer,
  recordSoftAskShown,
  RoundOutcome,
  shouldSoftAsk,
} from './rating';
import { shareDaily } from './share';
import {
  defaultProfile,
  Inventory,
  loadProfile,
  Profile,
  saveProfile,
  Settings,
  todayKey,
} from './storage';

export type Screen = 'home' | 'category' | 'questionCount' | 'question' | 'summary' | 'profile' | 'settings' | 'shop';
export type Phase = 'answer' | 'confidence' | 'crowd' | 'reveal';

export interface Confetti {
  left: number;
  delay: number;
  dur: number;
  size: number;
  round: boolean;
  col: string;
  rot: number;
}

/** Free hints topped up to this floor once a day. */
const HINT_FLOOR: Inventory = { fifty: 2, crowd: 2, skip: 1, freeze: 0 };

export interface GameState {
  screen: Screen;
  mode: ModeId | null;
  category: string | null;
  questionLimit: number | null;
  queue: Question[];
  qIndex: number;
  phase: Phase;
  selected: number | null;
  confidence: number | null;
  crowdGuess: number | null;
  score: number;
  correct: number;
  total: number;
  run: number;
  bestRun: number;
  eliminated: number[];
  showCrowdHint: boolean;
  timeLeft: number;
  /** Set when the clock ran out rather than the player answering. */
  timedOut: boolean;
  /** Whether the last answer landed inside the speed-bonus window. */
  lastSpeedBonus: boolean;
  /** Consecutive speed-bonus answers, for the Quick Draw badge. */
  speedRun: number;
  lastWrong: boolean;
  crowdRight: boolean;
  newBadges: Badge[];
  lastEarned: number;
  summaryCoins: number;
  /** '1'/'0' per question, for the spoiler-free Daily share card. */
  dailyPattern: string;
  freezeUsed: boolean;
  /** Soft review ask, shown over the Summary screen. */
  showRatingAsk: boolean;
  sessionFlags: Record<string, boolean>;
  resetArmed: boolean;
  loaded: boolean;
  P: Profile;
}

const CONFETTI_COLS = ['#ff4d6d', '#ffb703', '#4cc9f0', '#19c37d', '#7b5cff', '#ff9eb3'];

function genConfetti(): Confetti[] {
  return Array.from({ length: 18 }).map((_, i) => ({
    left: +(4 + Math.random() * 92).toFixed(1),
    delay: +(Math.random() * 0.28).toFixed(2),
    dur: +(0.85 + Math.random() * 0.7).toFixed(2),
    size: +(7 + Math.random() * 7).toFixed(0),
    round: Math.random() > 0.5,
    col: CONFETTI_COLS[i % CONFETTI_COLS.length],
    rot: Math.floor(Math.random() * 90),
  }));
}

function initialState(): GameState {
  return {
    screen: 'home',
    mode: null,
    category: null,
    questionLimit: null,
    queue: [],
    qIndex: 0,
    phase: 'answer',
    selected: null,
    confidence: null,
    crowdGuess: null,
    score: 0,
    correct: 0,
    total: 0,
    run: 0,
    bestRun: 0,
    eliminated: [],
    showCrowdHint: false,
    timeLeft: 30,
    timedOut: false,
    lastSpeedBonus: false,
    speedRun: 0,
    lastWrong: false,
    crowdRight: false,
    newBadges: [],
    lastEarned: 0,
    summaryCoins: 0,
    dailyPattern: '',
    freezeUsed: false,
    showRatingAsk: false,
    sessionFlags: {},
    resetArmed: false,
    loaded: false,
    P: defaultProfile(),
  };
}

export interface GameApi {
  state: GameState;
  confetti: Confetti[];
  cur: () => Question | undefined;
  selectMode: (mode: ModeId) => void;
  selectCategory: (cat: string) => void;
  begin: (mode: ModeId, cat: string | null, questionLimit?: number | null) => void;
  cancelAnswerSelection: () => void;
  pickAnswer: (i: number) => void;
  pickConfidence: (l: number) => void;
  pickCrowd: (b: number) => void;
  next: () => void;
  quit: () => void;
  goHome: () => void;
  goProfile: () => void;
  goSettings: () => void;
  goShop: () => void;
  useHint: (type: 'fifty' | 'crowd' | 'skip') => void;
  buyItem: (item: ShopItem) => void;
  shareDailyResult: () => void;
  answerRatingAsk: (positive: boolean) => void;
  toggleSetting: (k: keyof Settings) => void;
  resetProgress: () => void;
}

export function useGame(): GameApi {
  const [state, setRawState] = useState<GameState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const confettiRef = useRef<Confetti[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ratingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** When the current round started, for play-time accounting. */
  const playStartRef = useRef<number | null>(null);

  // Helper mirroring the mockup's setState(partial) ergonomics. We update the
  // ref synchronously (before scheduling the render) so that actions which
  // chain into one another within the same tick — e.g. pickConfidence ->
  // reveal, or useHint('skip') -> next — always read the freshest state.
  const patch = useCallback((p: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => {
    const prev = stateRef.current;
    const delta = typeof p === 'function' ? p(prev) : p;
    const nextState = { ...prev, ...delta };
    stateRef.current = nextState;
    setRawState(nextState);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Load persisted profile on mount, and apply the notification preference.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const P = await loadProfile();
      if (!mounted) return;
      patch({ P, loaded: true });
      syncPlayReminders(P.settings.notif);
    })();
    return () => {
      mounted = false;
      clearTimer();
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (ratingTimeoutRef.current) clearTimeout(ratingTimeoutRef.current);
    };
  }, [patch, clearTimer]);

  const persist = useCallback((P: Profile) => {
    saveProfile(P);
  }, []);

  const cur = useCallback(() => {
    const s = stateRef.current;
    return s.queue[s.qIndex];
  }, []);

  /** Milliseconds spent in the round that is ending, for the review gate. */
  const drainPlayTime = useCallback((): number => {
    if (playStartRef.current === null) return 0;
    const elapsed = Date.now() - playStartRef.current;
    playStartRef.current = null;
    return Math.max(0, elapsed);
  }, []);

  const endGame = useCallback(() => {
    clearTimer();
    const s = stateRef.current;
    const elapsed = drainPlayTime();

    const withPlayTime: GameState = { ...s, P: { ...s.P, playMs: s.P.playMs + elapsed } };
    const { profile, newBadges, earnedCoins, freezeUsed } = applyRoundProgress(withPlayTime);

    persist(profile);
    patch({
      screen: 'summary',
      P: profile,
      newBadges,
      summaryCoins: earnedCoins,
      freezeUsed,
      showRatingAsk: false,
    });

    // Review ask, placed after the score has landed rather than on top of it.
    const outcome: RoundOutcome = {
      accuracy: s.total ? s.correct / s.total : 0,
      perfect: s.total > 0 && s.correct === s.total,
      newBadgeCount: newBadges.length,
      endedInFailure: Boolean((MODES[s.mode as ModeId]?.endless || MODES[s.mode as ModeId]?.rush) && s.lastWrong),
    };
    if (shouldSoftAsk(profile, outcome)) {
      ratingTimeoutRef.current = setTimeout(() => {
        const updated = { ...stateRef.current.P, rating: recordSoftAskShown(stateRef.current.P.rating) };
        persist(updated);
        patch({ P: updated, showRatingAsk: true });
      }, 1100);
    }
  }, [clearTimer, drainPlayTime, patch, persist]);

  const reveal = useCallback(
    (options: { timedOut?: boolean } = {}) => {
      const s = stateRef.current;
      const q = s.queue[s.qIndex];
      if (!q) return;
      const mode = s.mode as ModeId;
      const m = MODES[mode];
      const isC = !options.timedOut && s.selected === q.a;

      let crowdRight = false;
      if (m.crowd) crowdRight = s.crowdGuess === crowdBucketOf(q.c);

      const speedBonus = isC && !options.timedOut && isSpeedBonus(s.timeLeft, m.secondsPerQuestion);
      const pts = pointsForAnswer({
        mode,
        correct: isC,
        confidence: options.timedOut ? null : s.confidence,
        crowdBonus: crowdRight,
        speedBonus,
      });

      const run = isC ? s.run + 1 : 0;
      const speedRun = speedBonus ? s.speedRun + 1 : 0;
      const flags = { ...s.sessionFlags };
      if (isC && s.confidence === 3) flags.locked = true;
      if (isC && s.confidence === 3 && q.d >= 5) flags.nerve = true;
      if (isC && q.kind === 'trap') flags.trapper = true;
      if (crowdRight) flags.crowd = true;
      if (run >= 5) flags.streak5 = true;
      if (speedRun >= 5) flags.quick = true;

      confettiRef.current = isC ? genConfetti() : [];
      resultHaptic(s.P.settings.haptics, isC);
      playSound(s.P.settings.sound, isC ? 'correct' : 'wrong');

      patch({
        phase: 'reveal',
        lastEarned: pts,
        score: s.score + pts,
        correct: s.correct + (isC ? 1 : 0),
        total: s.total + 1,
        run,
        bestRun: Math.max(s.bestRun, run),
        lastWrong: !isC,
        timedOut: Boolean(options.timedOut),
        lastSpeedBonus: speedBonus,
        speedRun,
        crowdRight,
        sessionFlags: flags,
        dailyPattern: s.mode === 'daily' ? s.dailyPattern + (isC ? '1' : '0') : s.dailyPattern,
      });
    },
    [patch],
  );

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.screen !== 'question') return;
    // Only count down while the player is actively choosing an answer; pause
    // during the confidence/crowd sheets and the reveal.
    if (s.phase !== 'answer') return;
    if (s.timeLeft <= 1) {
      clearTimer();
      patch({ timeLeft: 0 });
      // Running out is a wrong answer, not an instant game over - except in
      // the survival modes, where `next` will end the run on lastWrong.
      reveal({ timedOut: true });
      return;
    }
    patch((st) => ({ timeLeft: st.timeLeft - 1 }));
  }, [clearTimer, patch, reveal]);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => tick(), 1000);
  }, [clearTimer, tick]);

  /** Free daily hint top-up so a player without coins is never stuck. */
  const refillHints = useCallback((P: Profile): Profile => {
    const today = todayKey();
    if (P.hintRefillDate === today) return P;
    return {
      ...P,
      hintRefillDate: today,
      inventory: {
        ...P.inventory,
        fifty: Math.max(P.inventory.fifty, HINT_FLOOR.fifty),
        crowd: Math.max(P.inventory.crowd, HINT_FLOOR.crowd),
        skip: Math.max(P.inventory.skip, HINT_FLOOR.skip),
      },
    };
  }, []);

  const begin = useCallback(
    (mode: ModeId, cat: string | null, questionLimit?: number | null) => {
      clearTimer();
      const s = stateRef.current;
      const P = refillHints(s.P);
      if (P !== s.P) persist(P);

      const queue = buildQueue(mode, cat, questionLimit, P);
      const m = MODES[mode];
      confettiRef.current = [];
      playStartRef.current = Date.now();

      patch({
        screen: 'question',
        mode,
        category: cat,
        questionLimit: questionLimit ?? null,
        queue,
        qIndex: 0,
        phase: 'answer',
        selected: null,
        confidence: null,
        crowdGuess: null,
        score: 0,
        correct: 0,
        total: 0,
        run: 0,
        bestRun: 0,
        eliminated: [],
        showCrowdHint: false,
        timeLeft: m.secondsPerQuestion ?? 30,
        timedOut: false,
        lastSpeedBonus: false,
        speedRun: 0,
        lastWrong: false,
        newBadges: [],
        lastEarned: 0,
        dailyPattern: '',
        freezeUsed: false,
        showRatingAsk: false,
        sessionFlags: {},
        P,
      });
      // Every mode has a clock now, not just Rush.
      startTimer();
    },
    [clearTimer, patch, persist, refillHints, startTimer],
  );

  const selectMode = useCallback(
    (mode: ModeId) => {
      const m = MODES[mode];
      if (m.needCat) {
        patch({ screen: 'category', mode, category: null, questionLimit: null });
        return;
      }
      // Category-less modes that still let the player choose a round length.
      if (m.pickCount) {
        patch({ screen: 'questionCount', mode, category: null, questionLimit: null });
        return;
      }
      begin(mode, null);
    },
    [begin, patch],
  );

  const selectCategory = useCallback(
    (cat: string) => {
      const m = MODES[stateRef.current.mode as ModeId];
      // Rush is an endless survival run, so it starts right after category.
      if (m.rush) {
        begin(m.id, cat);
        return;
      }
      patch({ screen: 'questionCount', category: cat });
    },
    [begin, patch],
  );

  const pickAnswer = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (s.phase !== 'answer') return;
      if (s.eliminated.indexOf(i) >= 0) return;
      tapHaptic(s.P.settings.haptics);
      // The clock freezes here: `tick` only counts down during 'answer', so the
      // confidence bet is not a speed round.
      patch({ selected: i, phase: 'confidence' });
    },
    [patch],
  );

  const cancelAnswerSelection = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== 'confidence') return;
    patch({ selected: null, confidence: null, phase: 'answer' });
  }, [patch]);

  const pickConfidence = useCallback(
    (l: number) => {
      const s = stateRef.current;
      if (MODES[s.mode as ModeId].crowd) {
        patch({ confidence: l, phase: 'crowd' });
      } else {
        patch({ confidence: l });
        reveal();
      }
    },
    [patch, reveal],
  );

  const pickCrowd = useCallback(
    (b: number) => {
      patch({ crowdGuess: b });
      reveal();
    },
    [patch, reveal],
  );

  const next = useCallback(() => {
    const s = stateRef.current;
    const m = MODES[s.mode as ModeId];
    // Survival modes end the moment you miss one - including on a timeout.
    if ((m.endless || m.rush) && s.lastWrong) {
      endGame();
      return;
    }
    const qi = s.qIndex + 1;
    let queue = s.queue;
    if (qi >= queue.length) {
      if (m.rush || m.endless) {
        // Survival modes never end by running out; keep refilling the queue.
        queue = queue.concat(shuffle(buildQueue(s.mode as ModeId, s.category, null, s.P)));
      } else {
        endGame();
        return;
      }
    }
    patch({
      qIndex: qi,
      queue,
      phase: 'answer',
      selected: null,
      confidence: null,
      crowdGuess: null,
      eliminated: [],
      showCrowdHint: false,
      timedOut: false,
      timeLeft: m.secondsPerQuestion ?? 30,
    });
    startTimer();
  }, [endGame, patch, startTimer]);

  const quit = useCallback(() => {
    clearTimer();
    const elapsed = drainPlayTime();
    if (elapsed > 0) {
      const P = { ...stateRef.current.P, playMs: stateRef.current.P.playMs + elapsed };
      persist(P);
      patch({ screen: 'home', P });
      return;
    }
    patch({ screen: 'home' });
  }, [clearTimer, drainPlayTime, patch, persist]);

  const goHome = useCallback(() => {
    clearTimer();
    patch({ screen: 'home', resetArmed: false });
  }, [clearTimer, patch]);

  const goProfile = useCallback(() => patch({ screen: 'profile' }), [patch]);
  const goSettings = useCallback(() => patch({ screen: 'settings' }), [patch]);
  const goShop = useCallback(() => patch({ screen: 'shop' }), [patch]);

  const useHint = useCallback(
    (type: 'fifty' | 'crowd' | 'skip') => {
      const s = stateRef.current;
      if (s.phase !== 'answer') return;
      if (s.P.inventory[type] <= 0) return;
      // Beat the Crowd scores you on guessing the crowd's hit rate, so a hint
      // that shows you the crowd's answers is selling you the answer. Worse,
      // the displayed share is jittered while scoring uses the raw number, so
      // on ~14% of questions the hint would actively push you into the wrong
      // bucket. The hint is hidden in this mode; this is the belt-and-braces.
      if (type === 'crowd' && MODES[s.mode as ModeId].crowd) return;

      // Hints are consumables now, so spending one persists immediately.
      const P: Profile = { ...s.P, inventory: { ...s.P.inventory, [type]: s.P.inventory[type] - 1 } };
      persist(P);

      if (type === 'fifty') {
        const q = s.queue[s.qIndex];
        const wrong = [0, 1, 2, 3].filter((i) => i !== q.a);
        patch({ eliminated: shuffle(wrong).slice(0, 2), P });
        return;
      }
      if (type === 'crowd') {
        patch({ showCrowdHint: true, P });
        return;
      }
      // Skip counts as an answered question but costs nothing.
      patch({ P, total: s.total + 1, dailyPattern: s.mode === 'daily' ? `${s.dailyPattern}0` : s.dailyPattern });
      next();
    },
    [next, patch, persist],
  );

  const buyItem = useCallback(
    (item: ShopItem) => {
      const s = stateRef.current;
      if (s.P.coins < item.cost) return;
      if (item.kind === 'theme' && s.P.owned.indexOf(item.id) >= 0) return;

      const P: Profile = {
        ...s.P,
        coins: s.P.coins - item.cost,
        inventory: { ...s.P.inventory },
        owned: [...s.P.owned],
      };

      if (item.kind === 'hint') {
        const key = item.id.replace('pack-', '') as keyof Inventory;
        P.inventory[key] += item.grants ?? 1;
      } else if (item.kind === 'freeze') {
        P.inventory.freeze += item.grants ?? 1;
      } else {
        P.owned.push(item.id);
        P.theme = item.id;
      }

      tapHaptic(s.P.settings.haptics);
      persist(P);
      patch({ P });
    },
    [patch, persist],
  );

  const shareDailyResult = useCallback(() => {
    const s = stateRef.current;
    if (!s.dailyPattern) return;
    void shareDaily({
      dateKey: todayKey(),
      pattern: s.dailyPattern,
      score: Math.max(0, s.score),
      dayStreak: s.P.dayStreak,
    });
  }, []);

  const answerRatingAsk = useCallback(
    (positive: boolean) => {
      const s = stateRef.current;
      const rating = recordSoftAskAnswer(s.P.rating, positive);
      const P: Profile = { ...s.P, rating };
      persist(P);
      patch({ P, showRatingAsk: false });

      // Only a happy player gets to spend one of the very limited native prompts.
      if (positive && canRequestNative(rating)) {
        void (async () => {
          const shown = await requestNativeReview();
          if (!shown) return;
          const updated = { ...stateRef.current.P, rating: recordNativeShown(stateRef.current.P.rating) };
          persist(updated);
          patch({ P: updated });
        })();
      }
    },
    [patch, persist],
  );

  const toggleSetting = useCallback(
    (k: keyof Settings) => {
      const s = stateRef.current;
      const nextVal = !s.P.settings[k];
      const P: Profile = { ...s.P, settings: { ...s.P.settings, [k]: nextVal } };
      persist(P);
      patch({ P });
      if (k === 'notif') {
        syncPlayReminders(nextVal as boolean).then(() => {
          // If permission was denied, the schedule silently no-ops; we keep the
          // toggle as the user set it so they can retry from system settings.
        });
      }
    },
    [patch, persist],
  );

  const resetProgress = useCallback(() => {
    const s = stateRef.current;
    if (!s.resetArmed) {
      patch({ resetArmed: true });
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
        if (stateRef.current.resetArmed) patch({ resetArmed: false });
      }, 3500);
      return;
    }
    const fresh: Profile = {
      ...defaultProfile(),
      settings: s.P.settings,
      // Asking again after a reset would be nagging, so the answer sticks.
      rating: s.P.rating,
      firstOpenAt: s.P.firstOpenAt,
    };
    persist(fresh);
    patch({ P: fresh, resetArmed: false });
  }, [patch, persist]);

  return {
    state,
    confetti: confettiRef.current,
    cur,
    selectMode,
    selectCategory,
    begin,
    cancelAnswerSelection,
    pickAnswer,
    pickConfidence,
    pickCrowd,
    next,
    quit,
    goHome,
    goProfile,
    goSettings,
    goShop,
    useHint,
    buyItem,
    shareDailyResult,
    answerRatingAsk,
    toggleSetting,
    resetProgress,
  };
}
