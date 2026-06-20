import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Raised from '../components/Raised';
import Txt from '../components/Txt';
import { BADGES } from '../data/game';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

export default function ProfileScreen({ game }: { game: GameApi }) {
  const P = game.state.P;
  const insets = useSafeAreaInsets();
  const level = Math.max(1, Math.floor(P.totalScore / 200) + 1);
  const lifetimeAcc = `${P.answered ? Math.round((P.right / P.answered) * 100) : 0}%`;

  const lb = [
    { n: 'QuizWhiz', s: 9820 },
    { n: 'BrainBolt', s: 7430 },
    { n: 'TrapKing', s: 6210 },
    { n: 'You', s: P.totalScore, me: true },
    { n: 'Lucky7', s: 1980 },
    { n: 'Owlbert', s: 1240 },
  ].sort((a, b) => b.s - a.s);

  const rankColors = ['#ffb703', '#c2bcd3', '#d6975a'];

  const stats: {
    value: string;
    label: string;
    bg: [string, string];
    sh: string;
    vc: string;
    lc: string;
  }[] = [
    { value: `${P.totalScore}`, label: 'Total points', bg: ['#eafaf1', '#d6f4e4'], sh: '#c0ecd2', vc: '#0c9c63', lc: '#3a9b73' },
    { value: `${P.games}`, label: 'Games played', bg: ['#e8f7fe', '#d1edfb'], sh: '#bce5f6', vc: '#1389b6', lc: '#3f93b3' },
    { value: `${P.bestStreak}`, label: 'Best streak', bg: ['#f3eeff', '#e4d8ff'], sh: '#d3c4ff', vc: '#6a45e6', lc: '#7a64ad' },
    { value: lifetimeAcc, label: 'Accuracy', bg: ['#fff6e0', '#ffecbd'], sh: '#ffdd9a', vc: '#e8890b', lc: '#b58026' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#fff0f6', '#f3eeff', '#e6f6ff']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 30 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.headWrap}>
        <Raised radius={26} depth={7} shadowColor="#d63659" gradient={['#ff7a93', '#ff4d6d']} style={styles.avatar}>
          <Txt w={700} style={styles.avatarText}>
            Y
          </Txt>
        </Raised>
        <Txt w={700} style={styles.name}>
          You
        </Txt>
        <View style={styles.chipRow}>
          <View style={[styles.miniChip, { backgroundColor: '#fff6e0' }]}>
            <Txt w={600} style={{ fontSize: 13, color: '#e8890b' }}>
              🔥 {P.dayStreak} day streak
            </Txt>
          </View>
          <View style={[styles.miniChip, { backgroundColor: '#f1ecff' }]}>
            <Txt w={600} style={{ fontSize: 13, color: '#7b5cff' }}>
              Level {level}
            </Txt>
          </View>
        </View>
      </View>

      <View style={styles.statGrid}>
        {stats.map((st) => (
          <View key={st.label} style={{ width: '48%' }}>
            <Raised radius={20} depth={4} shadowColor={st.sh} gradient={st.bg} style={[styles.statCard, { borderWidth: 2, borderColor: st.sh }]}>
              <Txt w={700} style={[styles.statValue, { color: st.vc }]}>
                {st.value}
              </Txt>
              <Txt w={600} style={[styles.statLabel, { color: st.lc }]}>
                {st.label}
              </Txt>
            </Raised>
          </View>
        ))}
      </View>

      <Txt w={700} style={styles.section}>
        Badges
      </Txt>
      <View style={styles.badgeGrid}>
        {BADGES.map((b) => {
          const earned = P.badges.indexOf(b.id) >= 0;
          return (
            <View key={b.id} style={{ width: '31%' }}>
              <Raised
                radius={18}
                depth={4}
                shadowColor={earned ? '#ffe0a0' : C.lineDeep}
                faceColor="#fff"
                style={[styles.badgeCard, { borderWidth: 2, borderColor: earned ? '#ffe6b0' : C.line, opacity: earned ? 1 : 0.55 }]}
              >
                {earned ? (
                  <LinearGradient colors={['#ffd166', '#ffb703']} style={styles.badgeIcon}>
                    <Txt w={700} style={{ color: '#fff', fontSize: 22 }}>
                      {b.icon}
                    </Txt>
                  </LinearGradient>
                ) : (
                  <View style={[styles.badgeIcon, { backgroundColor: C.lineDeep }]}>
                    <Txt w={700} style={{ color: C.faint, fontSize: 22 }}>
                      {b.icon}
                    </Txt>
                  </View>
                )}
                <Txt w={600} style={styles.badgeName}>
                  {b.name}
                </Txt>
              </Raised>
            </View>
          );
        })}
      </View>

      <Txt w={700} style={styles.section}>
        Daily Leaderboard
      </Txt>
      <Raised radius={22} depth={5} shadowColor={C.lineDeep} faceColor="#fff" style={[styles.lbCard, { borderWidth: 2, borderColor: C.line }]}>
        {lb.map((row, i) => (
          <View
            key={row.n}
            style={[
              styles.lbRow,
              i < lb.length - 1 && !row.me ? { borderBottomWidth: 1.5, borderBottomColor: C.line } : null,
              row.me ? { backgroundColor: '#fff0f3', borderRadius: 14 } : null,
            ]}
          >
            <View
              style={[
                styles.rank,
                { backgroundColor: i < 3 ? rankColors[i] : C.line },
              ]}
            >
              <Txt w={700} style={{ fontSize: 14, color: i < 3 ? '#fff' : C.muted }}>
                {i + 1}
              </Txt>
            </View>
            <Txt w={600} style={styles.lbName}>
              {row.n}
            </Txt>
            <Txt w={700} style={{ fontSize: 15, color: row.me ? C.pink : C.ink }}>
              {row.s.toLocaleString()}
            </Txt>
          </View>
        ))}
      </Raised>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 30 },
  headWrap: { alignItems: 'center', marginBottom: 22 },
  avatar: { width: 78, height: 78, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 34 },
  name: { fontSize: 23, color: C.ink },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 5 },
  miniChip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 14 },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginBottom: 22 },
  statCard: { padding: 16 },
  statValue: { fontSize: 26, color: C.ink },
  statLabel: { fontSize: 13, color: C.muted },

  section: { fontSize: 18, color: C.ink, marginBottom: 12, marginLeft: 2 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 11, marginBottom: 24 },
  badgeCard: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 },
  badgeIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  badgeName: { fontSize: 12.5, color: C.ink, textAlign: 'center', marginTop: 7 },

  lbCard: { padding: 8 },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, paddingHorizontal: 12 },
  rank: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  lbName: { flex: 1, fontSize: 15, color: C.ink },
});
