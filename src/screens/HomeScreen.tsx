import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import Icon, { IconName } from '../components/Icon';
import Raised from '../components/Raised';
import ScreenBackdrop from '../components/ScreenBackdrop';
import Txt from '../components/Txt';
import { FEATURED_MODE_IDS, MODES } from '../data/game';
import { Mode } from '../data/types';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

function Blob({ size, top, right, bottom, opacity = 0.16 }: { size: number; top?: number; right?: number; bottom?: number; opacity?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        right,
        bottom,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `rgba(255,255,255,${opacity})`,
      }}
    />
  );
}

function ModeCard({ mode, onPress }: { mode: Mode; onPress: () => void }) {
  return (
    <View style={{ width: '48%' }}>
      <Raised onPress={onPress} radius={24} depth={6} shadowColor={mode.sh} gradient={mode.gradient} style={styles.modeFace}>
        <Blob size={78} top={-20} right={-20} />
        <Blob size={30} bottom={10} right={14} opacity={0.12} />
        <View style={[styles.iconBox, { width: mode.id === 'truthlie' ? 60 : 48 }]}>
          <Icon name={mode.icon as IconName} size={27} />
        </View>
        <Txt w={600} style={styles.modeTitle}>
          {mode.name}
        </Txt>
        <Txt w={500} style={styles.modeSub}>
          {mode.sub}
        </Txt>
      </Raised>
    </View>
  );
}

export default function HomeScreen({ game }: { game: GameApi }) {
  const { state, selectMode, goProfile } = game;
  const coins = state.P.coins;
  const dailyMode = MODES.daily;
  const hardMode = MODES.hard;

  return (
    <ScreenBackdrop>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
      <View style={styles.header}>
        <Txt w={700} style={styles.logo}>
          <Txt w={700} style={{ color: C.ink, fontSize: 26 }}>
            Trivia
          </Txt>
          <Txt w={700} style={{ color: C.pink, fontSize: 26 }}>
            {' '}
            Trap
          </Txt>
        </Txt>
        <View style={styles.headerRight}>
          <View style={styles.coinPill}>
            <View style={styles.coin} />
            <Txt w={600} style={styles.coinText}>
              {coins}
            </Txt>
          </View>
          <Raised onPress={goProfile} radius={14} depth={4} shadowColor="#d63659" gradient={['#ff7a93', '#ff4d6d']} style={styles.avatar}>
            <Txt w={700} style={styles.avatarText}>
              Y
            </Txt>
          </Raised>
        </View>
      </View>

      <Raised
        onPress={() => selectMode('daily')}
        radius={28}
        depth={10}
        shadowColor={dailyMode.sh}
        gradient={dailyMode.gradient}
        gradientStart={{ x: 0, y: 0 }}
        gradientEnd={{ x: 1, y: 1.1 }}
        style={styles.heroFace}
      >
        <Blob size={140} top={-30} right={-30} opacity={0.13} />
        <Blob size={90} bottom={-34} right={24} opacity={0.1} />
        <View style={styles.heroChip}>
          <Txt w={600} style={styles.heroChipText}>
            DAILY CHALLENGE
          </Txt>
        </View>
        <Txt w={700} style={styles.heroTitle}>
          Daily 10
        </Txt>
        <Txt w={500} style={styles.heroSub}>
          10 mixed questions - keep your streak alive
        </Txt>
        <View style={styles.heroRow}>
          <View style={styles.playBtn}>
            <Txt w={700} style={styles.playBtnText}>
              Play &gt;
            </Txt>
          </View>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: '#fff' }]} />
            <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.45)' }]} />
            <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.45)' }]} />
            <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.25)' }]} />
          </View>
        </View>
      </Raised>

      <View style={styles.sectionHead}>
        <Txt w={700} style={styles.sectionTitle}>
          Game Modes
        </Txt>
        <Txt w={500} style={styles.sectionCount}>
          {FEATURED_MODE_IDS.length + 1} modes
        </Txt>
      </View>

      <View style={styles.grid}>
        {FEATURED_MODE_IDS.map((id) => (
          <ModeCard key={id} mode={MODES[id]} onPress={() => selectMode(id)} />
        ))}
      </View>

      <View style={{ marginTop: 13 }}>
        <Raised
          onPress={() => selectMode('hard')}
          radius={24}
          depth={6}
          shadowColor={hardMode.sh}
          gradient={hardMode.gradient}
          style={styles.hardFace}
        >
          <View style={styles.hardIcon}>
            <Icon name="hard" size={26} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt w={600} style={styles.hardTitle}>
              {hardMode.name}
            </Txt>
            <Txt w={500} style={styles.hardSub}>
              {hardMode.sub} - double rewards
            </Txt>
          </View>
          <Txt style={styles.chevron}>&gt;</Txt>
        </Raised>
      </View>
      </ScrollView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  logo: { lineHeight: 28 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ffe2c2',
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 11,
    borderRadius: 14,
  },
  coin: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#ffc23d' },
  coinText: { color: C.coinText, fontSize: 14 },
  avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 17 },

  heroFace: { padding: 22, paddingBottom: 20 },
  heroChip: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)', paddingVertical: 4, paddingHorizontal: 11, borderRadius: 20 },
  heroChipText: { color: '#fff', fontSize: 12, letterSpacing: 0.3 },
  heroTitle: { color: '#fff', fontSize: 34, marginTop: 11, marginBottom: 3 },
  heroSub: { color: 'rgba(255,255,255,0.88)', fontSize: 14, marginBottom: 16 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: { backgroundColor: '#fff', paddingVertical: 11, paddingHorizontal: 26, borderRadius: 18 },
  playBtnText: { color: C.pink, fontSize: 16 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 5 },

  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 22, marginBottom: 13, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 20, color: C.ink },
  sectionCount: { fontSize: 13, color: C.muted },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 13 },
  modeFace: { padding: 16, minHeight: 132 },
  iconBox: {
    height: 48,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeTitle: { fontSize: 16, color: '#fff', lineHeight: 18 },
  modeSub: { fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 3 },

  hardFace: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 18, paddingHorizontal: 20 },
  hardIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  hardTitle: { fontSize: 17, color: '#fff' },
  hardSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  chevron: { color: 'rgba(255,255,255,0.45)', fontSize: 22 },
});
