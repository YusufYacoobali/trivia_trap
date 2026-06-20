import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Raised from '../components/Raised';
import ScreenBackdrop from '../components/ScreenBackdrop';
import Txt from '../components/Txt';
import { getCategoryQuestionCount, MODES } from '../data/game';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

const QUESTION_COUNTS = [5, 10, 25, 50, 100] as const;

export default function QuestionCountScreen({ game }: { game: GameApi }) {
  const { state, begin, selectMode } = game;
  const insets = useSafeAreaInsets();
  const mode = state.mode ? MODES[state.mode] : null;
  const category = state.category;

  if (!mode || !category || !state.mode) return null;

  const available = getCategoryQuestionCount(category);

  return (
    <ScreenBackdrop>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 30 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <Raised
            onPress={() => selectMode(state.mode!)}
            radius={14}
            depth={4}
            shadowColor={C.lineDeep}
            faceColor="#fff"
            style={styles.back}
          >
            <Txt style={styles.backArrow}>&lt;</Txt>
          </Raised>
          <View>
            <Txt w={700} style={styles.title}>
              How many questions?
            </Txt>
            <Txt w={500} style={styles.subtitle}>
              {category} - {mode.name}
            </Txt>
          </View>
        </View>

        <View style={styles.grid}>
          {QUESTION_COUNTS.map((count) => {
            const disabled = count > available;
            return (
              <View key={count} style={{ width: '48%' }}>
                <Raised
                  onPress={() => begin(state.mode!, category, count)}
                  disabled={disabled}
                  radius={22}
                  depth={6}
                  shadowColor={disabled ? C.lineDeep : mode.sh}
                  gradient={disabled ? undefined : mode.gradient}
                  faceColor={disabled ? '#fff' : undefined}
                  style={[styles.countFace, disabled ? styles.disabledFace : null]}
                >
                  <Txt w={700} style={[styles.countValue, { color: disabled ? C.mutedSoft : '#fff' }]}>
                    {count}
                  </Txt>
                  <Txt w={500} style={[styles.countLabel, { color: disabled ? C.mutedSoft : 'rgba(255,255,255,0.85)' }]}>
                    questions
                  </Txt>
                </Raised>
              </View>
            );
          })}
        </View>

        <Txt w={500} style={styles.available}>
          {available} available in this category
        </Txt>
      </ScrollView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 30 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 24 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.line },
  backArrow: { fontSize: 22, color: C.ink, lineHeight: 24 },
  title: { fontSize: 22, color: C.ink, lineHeight: 24 },
  subtitle: { fontSize: 13, color: C.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 13 },
  countFace: { minHeight: 104, alignItems: 'center', justifyContent: 'center', padding: 16 },
  disabledFace: { borderWidth: 2, borderColor: C.line },
  countValue: { fontSize: 34, lineHeight: 38 },
  countLabel: { fontSize: 14, marginTop: 2 },
  available: { textAlign: 'center', color: C.muted, fontSize: 13, marginTop: 22 },
});
