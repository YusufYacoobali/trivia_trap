import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
import Icon, { IconName } from '../components/Icon';
import Raised from '../components/Raised';
import Txt from '../components/Txt';
import { CATEGORY_ICONS } from '../data/categoryIcons';
import { CATMETA, MODES } from '../data/game';
import { Mode, Question } from '../data/types';
import { distFor } from '../game/logic';
import { GameApi, GameState } from '../game/useGame';
import { C } from '../theme';
import ConfidenceSheet from './sheets/ConfidenceSheet';
import CrowdSheet from './sheets/CrowdSheet';
import RevealSheet from './sheets/RevealSheet';

// ── visual config ───────────────────────────────────────────────────────────

// Per-option accent palette (A / B / C / D).
const OPTION_PAL = [
  { c: '#ff5e7c', sh: '#d63659' },
  { c: '#36c0ef', sh: '#1583a8' },
  { c: '#ffa928', sh: '#c2730a' },
  { c: '#9b7bff', sh: '#5f3fe0' },
] as const;

// Hint chips, mapped at render time instead of hand-writing each one.
const HINT_CONFIGS = [
  { key: 'fifty', label: '50/50', grad: ['#ffc15c', '#f59008'], sh: '#c2730a', badgeColor: '#f59008' },
  { key: 'crowd', label: 'Crowd', grad: ['#a98bff', '#7b5cff'], sh: '#5f3fe0', badgeColor: '#7b5cff' },
  { key: 'skip', label: 'Skip', grad: ['#2fe6c6', '#12b39a'], sh: '#0d8f7c', badgeColor: '#12b39a' },
] as const satisfies readonly {
  key: keyof GameState['hints'];
  label: string;
  grad: [string, string];
  sh: string;
  badgeColor: string;
}[];

// ── pure presentation helpers (keep the component layout-only) ────────────────

function qIcon(q: Question): IconName {
  if (q.kind === 'trap') return 'trap';
  if (q.kind === 'truthlie') return 'truthlie';
  return (CATMETA[q.cat]?.icon ?? 'star') as IconName;
}

function catLabel(q: Question, mode: string): string {
  if (mode === 'trap') return 'Trap';
  if (mode === 'truthlie') return 'Truth or Lie';
  return q.cat;
}

interface OptionVisualState {
  gradient?: [string, string];
  faceColor?: string;
  shadow: string;
  text: string;
  labelBg: string;
  labelColor: string;
  opacity: number;
  border?: { width: number; color: string };
  mark: string;
  distText: string;
}

// Resolves the full look of one answer option from the current game state.
function getOptionVisualState(s: GameState, q: Question, index: number): OptionVisualState {
  const p = OPTION_PAL[index];
  const sel = s.selected === index;
  const elim = s.eliminated.indexOf(index) >= 0;

  if (s.phase === 'reveal') {
    if (index === q.a) {
      return { gradient: [C.correctA, C.correctB], shadow: C.correctSh, text: '#fff', labelBg: '#fff', labelColor: C.green, opacity: 1, mark: '✓', distText: '' };
    }
    if (sel) {
      return { gradient: [C.wrongA, C.wrongB], shadow: C.wrongSh, text: '#fff', labelBg: '#fff', labelColor: C.pink, opacity: 1, mark: '✕', distText: '' };
    }
    return {
      faceColor: '#fff',
      shadow: C.lineDeep,
      text: C.faint,
      labelBg: C.line,
      labelColor: C.mutedSoft,
      opacity: 0.65,
      border: { width: 2, color: C.line },
      mark: '',
      distText: '',
    };
  }

  // answer / confidence / crowd phases: each option keeps its accent colour
  const dist = s.showCrowdHint ? distFor(q) : null;
  return {
    gradient: [p.c, p.sh],
    shadow: p.sh,
    text: '#fff',
    labelBg: '#fff',
    labelColor: p.c,
    opacity: elim ? 0.3 : 1,
    mark: '',
    distText: dist ? `${dist[index]}%` : '',
  };
}

// Counter shown top-right: timer for rush, Qn for endless, n/total otherwise.
function getCounterText(s: GameState, mode: Mode, total: number): { text: string; color: string } {
  if (mode.rush) {
    return { text: `${s.timeLeft}s`, color: s.timeLeft <= 10 ? C.pink : C.ink };
  }
  if (mode.endless) {
    return { text: `Q${s.qIndex + 1}`, color: C.ink };
  }
  return { text: `${s.qIndex + 1}/${total}`, color: C.ink };
}

// ── small presentational components ───────────────────────────────────────────

function Option({ index, text, q, game }: { index: number; text: string; q: Question; game: GameApi }) {
  const { state, pickAnswer } = game;
  const v = getOptionVisualState(state, q, index);
  const elim = state.eliminated.indexOf(index) >= 0;

  return (
    <Raised
      onPress={() => pickAnswer(index)}
      disabled={state.phase !== 'answer' || elim}
      radius={20}
      depth={6}
      shadowColor={v.shadow}
      gradient={v.gradient}
      faceColor={v.faceColor}
      style={[styles.option, { opacity: v.opacity }, v.border ? { borderWidth: v.border.width, borderColor: v.border.color } : null]}
    >
      <View style={[styles.optLabel, { backgroundColor: v.labelBg }]}>
        <Txt w={700} style={[styles.optLetter, { color: v.labelColor }]}>
          {'ABCD'[index]}
        </Txt>
      </View>
      <Txt w={600} style={[styles.optText, { color: v.text }]}>
        {text}
      </Txt>
      {v.distText ? (
        <View style={styles.distPill}>
          <Txt w={700} style={styles.distText}>
            {v.distText}
          </Txt>
        </View>
      ) : null}
      {v.mark ? <Txt w={700} style={styles.optMark}>{v.mark}</Txt> : null}
    </Raised>
  );
}

interface HintProps {
  label: string;
  count: number;
  active: boolean;
  grad: [string, string];
  sh: string;
  badgeColor: string;
  onPress: () => void;
}

function Hint({ label, count, active, grad, sh, badgeColor, onPress }: HintProps) {
  return (
    <View style={styles.hintWrap}>
      <Raised
        onPress={active ? onPress : undefined}
        disabled={!active}
        radius={16}
        depth={4}
        shadowColor={active ? sh : C.lineDeep}
        gradient={active ? grad : undefined}
        faceColor={active ? undefined : '#fff'}
        style={[styles.hint, active ? null : styles.hintInactive]}
      >
        <Txt w={700} style={[styles.hintLabel, { color: active ? '#fff' : C.mutedSoft }]}>
          {label}
        </Txt>
        <View style={[styles.hintBadge, { backgroundColor: active ? '#fff' : '#d8d2e6' }]}>
          <Txt w={700} style={[styles.hintBadgeText, { color: active ? badgeColor : '#fff' }]}>
            {count}
          </Txt>
        </View>
      </Raised>
    </View>
  );
}

// ── screen (layout only) ──────────────────────────────────────────────────────

export default function QuestionScreen({ game }: { game: GameApi }) {
  const { state, quit, useHint, cancelAnswerSelection } = game;
  const insets = useSafeAreaInsets();
  const s = state;
  const mode = MODES[s.mode!];
  const q = s.queue[s.qIndex];
  if (!q) return null;

  const { accent, sh: accentSh } = mode;
  const total = s.queue.length;
  const counter = getCounterText(s, mode, total);
  const progressPct = mode.rush
    ? Math.round((s.timeLeft / (mode.secondsPerQuestion ?? 60)) * 100)
    : Math.round(((s.qIndex + (s.phase === 'reveal' ? 1 : 0)) / Math.max(total, 1)) * 100);

  const canHint = s.phase === 'answer';
  return (
    <View style={styles.root}>
      <LinearGradient colors={[mode.chip, C.appBg]} locations={[0, 0.5]} style={StyleSheet.absoluteFill} />
      {/* soft colored glow blobs tied to the mode accent */}
      <View pointerEvents="none" style={[styles.blob, styles.blobLeft, { backgroundColor: accent + '22' }]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobRight, { backgroundColor: accentSh + '1f' }]} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 28 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* top bar */}
        <View style={styles.topBar}>
          <Card onPress={quit} radius={13} depth={4} style={styles.quit}>
            <Txt style={styles.quitX}>X</Txt>
          </Card>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[accent, accentSh]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progressPct}%` }]}
            />
          </View>
          <Txt w={700} style={[styles.counter, { color: counter.color }]}>
            {counter.text}
          </Txt>
        </View>

        {/* score */}
        <View style={styles.scoreRow}>
          <Raised radius={20} depth={4} shadowColor={accentSh} gradient={[accent, accentSh]} style={styles.scorePill}>
            <Txt w={600} style={styles.scoreLabel}>
              SCORE
            </Txt>
            <Txt w={700} style={styles.scoreVal}>
              {s.score}
            </Txt>
          </Raised>
        </View>

        {/* question card */}
        <Raised
          radius={26}
          depth={1}
          shadowColor={accentSh}
          gradient={[mode.chip, '#ffffff']}
          style={[styles.qCard, { borderColor: accent + '33' }]}
        >
          <View style={styles.qHead}>
            <View style={styles.qChip}>
              {CATEGORY_ICONS[q.cat] ? (
                <Image source={CATEGORY_ICONS[q.cat]} style={styles.qChipImg} resizeMode="contain" />
              ) : (
                <Icon name={qIcon(q)} size={26} />
              )}
            </View>
            <Txt w={700} style={[styles.qCat, { color: accent }]}>
              {catLabel(q, s.mode!).toUpperCase()}
            </Txt>
          </View>
          <Txt w={600} style={styles.qText}>
            {q.q}
          </Txt>
        </Raised>

        {/* hints */}
        <View style={styles.hintRow}>
          {HINT_CONFIGS.map((h) => (
            <Hint
              key={h.key}
              label={h.label}
              count={s.hints[h.key]}
              active={canHint && s.hints[h.key] > 0}
              grad={h.grad}
              sh={h.sh}
              badgeColor={h.badgeColor}
              onPress={() => useHint(h.key)}
            />
          ))}
        </View>

        {/* options */}
        <View style={styles.options}>
          {q.o.map((text, i) => (
            <Option key={i} index={i} text={text} q={q} game={game} />
          ))}
        </View>
      </ScrollView>

      {/* overlays */}
      {s.phase === 'confidence' ? <Pressable onPress={cancelAnswerSelection} style={styles.dim} /> : null}
      {s.phase === 'crowd' ? <View style={styles.dim} /> : null}
      {s.phase === 'confidence' ? <ConfidenceSheet game={game} /> : null}
      {s.phase === 'crowd' ? <CrowdSheet game={game} /> : null}
      {s.phase === 'reveal' ? <RevealSheet game={game} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 28 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 18 },
  quit: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  quitX: { fontSize: 17, color: C.muted },
  progressTrack: { flex: 1, height: 13, backgroundColor: C.lineDeep, borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  counter: { minWidth: 46, textAlign: 'center', fontSize: 15 },

  scoreRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 13 },
  scorePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingLeft: 13, paddingRight: 15 },
  scoreLabel: { fontSize: 11, opacity: 0.85, letterSpacing: 0.5, color: '#fff' },
  scoreVal: { fontSize: 15, color: '#fff' },

  qCard: { padding: 18, paddingBottom: 22, marginBottom: 4, borderWidth: 2 },
  qHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  qChip: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  qChipImg: { width: 40, height: 40 },
  qCat: { fontSize: 12, letterSpacing: 0.7 },
  qText: { fontSize: 23, color: C.ink, lineHeight: 29 },

  hintRow: { flexDirection: 'row', gap: 9, marginTop:14, marginBottom: 16 },
  hintWrap: { flex: 1 },
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, paddingHorizontal: 6 },
  hintInactive: { borderWidth: 2, borderColor: C.line, opacity: 0.6 },
  hintLabel: { fontSize: 15 },
  hintBadge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  hintBadgeText: { fontSize: 13 },

  options: { gap: 11 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, paddingHorizontal: 17 },
  optLabel: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optLetter: { fontSize: 18 },
  optText: { flex: 1, fontSize: 19, lineHeight: 23 },
  optMark: { fontSize: 24, color: '#fff' },
  distPill: { backgroundColor: 'rgba(255,255,255,0.28)', paddingVertical: 3, paddingHorizontal: 9, borderRadius: 9 },
  distText: { fontSize: 13, color: '#fff' },

  blob: { position: 'absolute', width: 160, height: 160, borderRadius: 80 },
  blobLeft: { left: -54, top: 30 },
  blobRight: { right: -48, top: 240 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,20,48,0.42)', zIndex: 30 },
});
