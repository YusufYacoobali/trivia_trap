import { useCallback, useEffect, useRef, useState } from 'react';

import { MODES } from '../data/game';
import { Badge, ModeId, Question } from '../data/types';
import { resultHaptic, tapHaptic } from '../native/haptics';
import { syncPlayReminders } from '../native/notifications';
import { maybeRequestReview } from '../native/review';
import { playSound } from '../native/sound';
import { buildQueue, crowdBucketOf, pointsForAnswer, shuffle } from './logic';
import { applyRoundProgress } from './progress';
import {
  defaultProfile,
  loadProfile,
  Profile,
  saveProfile,
  Settings,
} from './storage';

export type Screen = 'home' | 'category' | 'question' | 'summary' | 'profile' | 'settings';
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

export interface GameState {
  screen: Screen;
  mode: ModeId | null;
  category: string | null;
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
  hints: { fifty: number; crowd: number; skip: number };
  timeLeft: number;
  lastWrong: boolean;
  crowdRight: boolean;
  newBadges: Badge[];
  lastEarned: number;
  summaryCoins: number;
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
    hints: { fifty: 2, crowd: 2, skip: 1 },
    timeLeft: 60,
    lastWrong: false,
    crowdRight: false,
    newBadges: [],
    lastEarned: 0,
    summaryCoins: 0,
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
  begin: (mode: ModeId, cat: string | null) => void;
  pickAnswer: (i: number) => void;
  pickConfidence: (l: number) => void;
  pickCrowd: (b: number) => void;
  next: () => void;
  quit: () => void;
  goHome: () => void;
  goProfile: () => void;
  goSettings: () => void;
  useHint: (type: 'fifty' | 'crowd' | 'skip') => void;
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
    };
  }, [patch, clearTimer]);

  const persist = useCallback((P: Profile) => {
    saveProfile(P);
  }, []);

  const cur = useCallback(() => {
    const s = stateRef.current;
    return s.queue[s.qIndex];
  }, []);

  const endGame = useCallback(() => {
    clearTimer();
    const s = stateRef.current;
    const { profile, newBadges, earnedCoins } = applyRoundProgress(s);

    persist(profile);
    patch({ screen: 'summary', P: profile, newBadges, summaryCoins: earnedCoins });

    // Ask for a store review at a natural moment, paced to every other day.
    resetTimeoutRef.current = setTimeout(async () => {
      const ts = await maybeRequestReview(stateRef.current.P.lastReviewRequest);
      if (ts) {
        const updated = { ...stateRef.current.P, lastReviewRequest: ts };
        persist(updated);
        patch({ P: updated });
      }
    }, 900);
  }, [clearTimer, patch, persist]);

  const reveal = useCallback(() => {
    const s = stateRef.current;
    const q = s.queue[s.qIndex];
    if (!q) return;
    const mode = s.mode as ModeId;
    const m = MODES[mode];
    const isC = s.selected === q.a;
    let crowdRight = false;
    if (m.crowd) {
      const bucket = crowdBucketOf(q.c);
      crowdRight = s.crowdGuess === bucket;
    }
    const pts = pointsForAnswer(mode, isC, s.confidence, crowdRight);
    const run = isC ? s.run + 1 : 0;
    const flags = { ...s.sessionFlags };
    if (isC && s.confidence === 3) flags.locked = true;
    if (isC && q.kind === 'trap') flags.trapper = true;
    if (crowdRight) flags.crowd = true;
    if (run >= 5) flags.streak5 = true;

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
      crowdRight,
      sessionFlags: flags,
    });
  }, [patch]);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (s.screen !== 'question') return;
    if (s.phase === 'reveal') return;
    if (s.timeLeft <= 1) {
      clearTimer();
      patch({ timeLeft: 0 });
      endGame();
      return;
    }
    patch((st) => ({ timeLeft: st.timeLeft - 1 }));
  }, [clearTimer, endGame, patch]);

  const begin = useCallback(
    (mode: ModeId, cat: string | null) => {
      clearTimer();
      const queue = buildQueue(mode, cat);
      const m = MODES[mode];
      confettiRef.current = [];
      patch({
        screen: 'question',
        mode,
        category: cat,
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
        hints: { fifty: 2, crowd: 2, skip: 1 },
        timeLeft: 60,
        lastWrong: false,
        newBadges: [],
        lastEarned: 0,
        sessionFlags: {},
      });
      if (m.rush) {
        timerRef.current = setInterval(() => tick(), 1000);
      }
    },
    [clearTimer, patch, tick],
  );

  const selectMode = useCallback(
    (mode: ModeId) => {
      const m = MODES[mode];
      if (m.needCat) {
        patch({ screen: 'category', mode });
        return;
      }
      begin(mode, null);
    },
    [begin, patch],
  );

  const pickAnswer = useCallback(
    (i: number) => {
      const s = stateRef.current;
      if (s.phase !== 'answer') return;
      if (s.eliminated.indexOf(i) >= 0) return;
      tapHaptic(s.P.settings.haptics);
      patch({ selected: i, phase: 'confidence' });
    },
    [patch],
  );

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
    if (m.endless && s.lastWrong) {
      endGame();
      return;
    }
    let qi = s.qIndex + 1;
    let queue = s.queue;
    if (qi >= queue.length) {
      if (m.rush) {
        queue = queue.concat(shuffle(buildQueue(s.mode as ModeId, s.category)));
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
    });
  }, [endGame, patch]);

  const quit = useCallback(() => {
    clearTimer();
    patch({ screen: 'home' });
  }, [clearTimer, patch]);

  const goHome = useCallback(() => {
    clearTimer();
    patch({ screen: 'home', resetArmed: false });
  }, [clearTimer, patch]);

  const goProfile = useCallback(() => patch({ screen: 'profile' }), [patch]);
  const goSettings = useCallback(() => patch({ screen: 'settings' }), [patch]);

  const useHint = useCallback(
    (type: 'fifty' | 'crowd' | 'skip') => {
      const s = stateRef.current;
      if (s.phase !== 'answer') return;
      if (type === 'fifty') {
        if (s.hints.fifty <= 0) return;
        const q = s.queue[s.qIndex];
        const wrong = [0, 1, 2, 3].filter((i) => i !== q.a);
        const rm = shuffle(wrong).slice(0, 2);
        patch({ eliminated: rm, hints: { ...s.hints, fifty: s.hints.fifty - 1 } });
      }
      if (type === 'crowd') {
        if (s.hints.crowd <= 0) return;
        patch({ showCrowdHint: true, hints: { ...s.hints, crowd: s.hints.crowd - 1 } });
      }
      if (type === 'skip') {
        if (s.hints.skip <= 0) return;
        patch({ hints: { ...s.hints, skip: s.hints.skip - 1 }, total: s.total + 1 });
        next();
      }
    },
    [next, patch],
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
    };
    persist(fresh);
    patch({ P: fresh, resetArmed: false });
  }, [patch, persist]);

  return {
    state,
    confetti: confettiRef.current,
    cur,
    selectMode,
    begin,
    pickAnswer,
    pickConfidence,
    pickCrowd,
    next,
    quit,
    goHome,
    goProfile,
    goSettings,
    useHint,
    toggleSetting,
    resetProgress,
  };
}
