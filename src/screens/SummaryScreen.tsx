import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import Raised from '../components/Raised';
import Txt from '../components/Txt';
import { MODES } from '../data/game';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

const DOTS = [
  { top: 26, left: 30, size: 15, r: 50, color: '#ff4d6d' },
  { top: 66, right: 36, size: 12, r: 4, color: '#ffb703' },
  { top: 150, left: 22, size: 11, r: 50, color: '#4cc9f0' },
  { top: 120, right: 26, size: 13, r: 4, color: '#7b5cff' },
  { top: 300, left: 30, size: 12, r: 50, color: '#19c37d' },
  { bottom: 96, left: 40, size: 13, r: 4, color: '#ff7a93' },
  { bottom: 60, right: 34, size: 14, r: 50, color: '#ffb703' },
  { bottom: 150, right: 48, size: 10, r: 50, color: '#7b5cff' },
];

interface StatCardProps {
  emoji: string;
  value: string;
  label: string;
  bg: [string, string];
  sh: string;
  valueColor: string;
  labelColor: string;
}

function StatCard({ emoji, value, label, bg, sh, valueColor, labelColor }: StatCardProps) {
  return (
    <View style={{ width: '48%' }}>
      <Raised radius={20} depth={5} shadowColor={sh} gradient={bg} style={[styles.stat, { borderWidth: 2, borderColor: sh }]}>
        <Txt style={styles.statEmoji}>{emoji}</Txt>
        <Txt w={700} style={[styles.statValue, { color: valueColor }]}>
          {value}
        </Txt>
        <Txt w={600} style={[styles.statLabel, { color: labelColor }]}>
          {label}
        </Txt>
      </Raised>
    </View>
  );
}

export default function SummaryScreen({ game }: { game: GameApi }) {
  const { state, begin, selectMode, goHome } = game;
  const insets = useSafeAreaInsets();
  const s = state;
  const mode = MODES[s.mode!];
  const accent = mode.accent;
  const accentSh = mode.sh;
  const bottomClearance = Math.max(insets.bottom, 64);

  const perfect = s.correct === s.total && s.total > 0;
  const acc = s.total ? s.correct / s.total : 0;
  const title = perfect ? 'Flawless!' : s.correct >= s.total * 0.6 ? 'Nice run!' : 'Round complete';
  const emoji = perfect ? '🏆' : acc >= 0.6 ? '🎉' : acc >= 0.3 ? '👏' : '🌱';
  const accPct = `${s.total ? Math.round((s.correct / s.total) * 100) : 0}%`;

  const playAgain = () => {
    if (mode.needCat && s.category) {
      begin(s.mode!, s.category, s.questionLimit);
    } else {
      selectMode(s.mode!);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#ffe1ec', '#ffeede', '#ece4ff', '#dcf0ff', '#e2fbef']}
        locations={[0, 0.22, 0.52, 0.78, 1]}
        style={StyleSheet.absoluteFill}
      />
      {DOTS.map((d, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            right: d.right,
            bottom: d.bottom,
            width: d.size,
            height: d.size,
            borderRadius: d.r,
            backgroundColor: d.color,
          }}
        />
      ))}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <Txt style={styles.emoji}>{emoji}</Txt>
        <Txt w={700} style={[styles.kicker, { color: accent }]}>
          {mode.name.toUpperCase()}
        </Txt>
        <Txt w={700} style={styles.title}>
          {title}
        </Txt>

        {/* points medal */}
        <View style={styles.medalWrap}>
          <LinearGradient colors={[accent, accentSh]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.medal}>
            <Txt w={600} style={styles.medalLabel}>
              POINTS
            </Txt>
            <Txt w={700} style={styles.medalScore}>
              {s.score}
            </Txt>
          </LinearGradient>
        </View>

        <View style={styles.statGrid}>
          <StatCard emoji="🎯" value={`${s.correct}/${s.total}`} label="Correct" bg={['#eafaf1', '#d6f4e4']} sh="#c0ecd2" valueColor="#0c9c63" labelColor="#3a9b73" />
          <StatCard emoji="📊" value={accPct} label="Accuracy" bg={['#e8f7fe', '#d1edfb']} sh="#bce5f6" valueColor="#1389b6" labelColor="#3f93b3" />
          <StatCard emoji="🔥" value={`${s.bestRun}`} label="Best streak" bg={['#f3eeff', '#e4d8ff']} sh="#d3c4ff" valueColor="#6a45e6" labelColor="#7a64ad" />
          <StatCard emoji="🪙" value={`+${s.summaryCoins}`} label="Coins earned" bg={['#fff6e0', '#ffecbd']} sh="#ffdd9a" valueColor="#e8890b" labelColor="#b58026" />
        </View>

        {s.newBadges.length > 0 ? (
          <Raised radius={20} depth={5} shadowColor="#ffdd9a" gradient={['#fff7e2', '#ffeec0']} style={styles.badgeBox}>
            <Txt w={700} style={styles.badgeHead}>
              🆕 NEW BADGE UNLOCKED
            </Txt>
            <View style={{ gap: 12 }}>
              {s.newBadges.map((b) => (
                <View key={b.id} style={styles.badgeRow}>
                  <LinearGradient colors={['#ffd166', '#ffb703']} style={styles.badgeIcon}>
                    <Txt w={700} style={{ color: '#fff', fontSize: 20 }}>
                      {b.icon}
                    </Txt>
                  </LinearGradient>
                  <View>
                    <Txt w={600} style={{ fontSize: 14, color: C.ink }}>
                      {b.name}
                    </Txt>
                    <Txt w={500} style={{ fontSize: 12, color: '#b08a3a' }}>
                      {b.desc}
                    </Txt>
                  </View>
                </View>
              ))}
            </View>
          </Raised>
        ) : null}

      </ScrollView>

      <View style={[styles.actionDock, { paddingBottom: bottomClearance }]}>
        <PrimaryButton label="Play Again ▶" accent={accent} accentSh={accentSh} onPress={playAgain} />
        <Card onPress={goHome} radius={20} depth={4} shadowColor={C.lineDeep} borderColor={C.lineDeep} style={styles.secondary}>
          <Txt w={600} style={styles.secondaryText}>
            Back to Home
          </Txt>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scroll: { padding: 22, paddingTop: 24, paddingBottom: 40, alignItems: 'center' },
  emoji: { fontSize: 48, marginBottom: 6, lineHeight: 52 },
  kicker: { fontSize: 14, letterSpacing: 1, marginBottom: 4 },
  title: { fontSize: 30, color: C.ink, marginBottom: 20 },

  medalWrap: { marginBottom: 24 },
  medal: {
    width: 152,
    height: 152,
    borderRadius: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: '#fff',
  },
  medalLabel: { fontSize: 13, color: '#fff', opacity: 0.9, letterSpacing: 0.5 },
  medalScore: { fontSize: 54, color: '#fff', lineHeight: 58 },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, width: '100%', marginBottom: 4 },
  stat: { padding: 16, minHeight: 78 },
  statEmoji: { position: 'absolute', right: 11, top: 13, fontSize: 21 },
  statValue: { fontSize: 26 },
  statLabel: { fontSize: 13 },

  badgeBox: { padding: 15, width: '100%', marginTop: 20, borderWidth: 2, borderColor: '#ffe09a' },
  badgeHead: { fontSize: 13, color: '#e8890b', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  badgeIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },

  actionDock: {
    paddingTop: 12,
    paddingHorizontal: 22,
    gap: 11,
    backgroundColor: 'rgba(255, 245, 250, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.72)',
  },
  secondary: { paddingVertical: 14, alignItems: 'center' },
  secondaryText: { fontSize: 16, color: '#6b6584' },
});
