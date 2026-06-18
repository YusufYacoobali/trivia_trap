import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import Confetti from '../../components/Confetti';
import PrimaryButton from '../../components/PrimaryButton';
import Sheet from '../../components/Sheet';
import Txt from '../../components/Txt';
import { CONF, MODES } from '../../data/game';
import { GameApi } from '../../game/useGame';
import { C } from '../../theme';

export default function RevealSheet({ game }: { game: GameApi }) {
  const { state, next, confetti } = game;
  const s = state;
  const q = s.queue[s.qIndex];
  if (!q) return null;
  const mode = MODES[s.mode!];
  const isC = s.selected === q.a;

  const pts = `${s.lastEarned > 0 ? '+' : ''}${s.lastEarned}`;
  const title = isC ? 'CORRECT!' : s.confidence ? 'NOT QUITE' : 'WRONG';
  const cn = CONF.find((c) => c.l === s.confidence);
  const confName = isC ? (cn ? `${cn.name} bet paid off` : '') : cn ? `${cn.name} bet — no points` : '';

  const lastQuestion = s.qIndex + 1 >= s.queue.length && !mode.rush && !mode.endless;
  const nextLabel = lastQuestion ? 'See Results' : mode.endless && s.lastWrong ? 'See Results' : 'Next Question';

  const headColors: [string, string] = isC ? ['#22d07f', '#0fa066'] : ['#ff6b85', '#e8425f'];

  return (
    <Sheet zIndex={45} showHandle={false} style={styles.sheet}>
      <Confetti pieces={confetti} />

      {/* header band */}
      <LinearGradient colors={headColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.head}>
        <Txt w={700} style={styles.pts}>
          {pts}
        </Txt>
        <Txt w={600} style={styles.headTitle}>
          {title}
        </Txt>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.chipRow}>
          {confName ? (
            <View style={[styles.confChip, { backgroundColor: mode.chip }]}>
              <Txt w={600} style={{ fontSize: 13, color: mode.accent }}>
                {confName}
              </Txt>
            </View>
          ) : null}
          {mode.crowd ? (
            <View
              style={[
                styles.crowdChip,
                { backgroundColor: s.crowdRight ? C.greenChip : C.line },
              ]}
            >
              <Txt w={600} style={{ fontSize: 13, color: s.crowdRight ? C.green : C.muted }}>
                {s.crowdRight ? 'Crowd guess +2 ✓' : 'Crowd guess missed'}
              </Txt>
            </View>
          ) : null}
        </View>

        <View style={styles.explainBox}>
          <View style={[styles.iBadge, { backgroundColor: mode.accent }]}>
            <Txt w={700} style={{ color: '#fff', fontSize: 15 }}>
              i
            </Txt>
          </View>
          <Txt w={500} style={styles.explainText}>
            {q.e}
          </Txt>
        </View>

        {/* crowd stats */}
        <View style={styles.statsRow}>
          <View style={styles.statTrack}>
            <LinearGradient
              colors={['#7b5cff', '#4cc9f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.statFill, { width: `${q.c}%` }]}
            />
          </View>
          <Txt w={600} style={styles.statText}>
            Only {q.c}% got this right
          </Txt>
        </View>

        <View style={{ marginTop: 18 }}>
          <PrimaryButton accent={mode.accent} accentSh={mode.sh} label={nextLabel} onPress={next} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 26, overflow: 'hidden' },
  head: { paddingTop: 30, paddingBottom: 26, paddingHorizontal: 20, alignItems: 'center' },
  pts: { fontSize: 54, color: '#fff', lineHeight: 56 },
  headTitle: { fontSize: 19, color: '#fff', letterSpacing: 0.5, opacity: 0.95 },

  body: { paddingHorizontal: 22, paddingTop: 18 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  confChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14 },
  crowdChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14 },

  explainBox: { backgroundColor: '#f7f4fc', borderRadius: 18, padding: 15, paddingHorizontal: 16, flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  iBadge: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  explainText: { flex: 1, fontSize: 14.5, color: C.inkSoft, lineHeight: 20 },

  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 13, paddingHorizontal: 2 },
  statTrack: { flex: 1, height: 9, backgroundColor: C.lineDeep, borderRadius: 6, overflow: 'hidden' },
  statFill: { height: '100%', borderRadius: 6 },
  statText: { fontSize: 13, color: C.muted },
});
