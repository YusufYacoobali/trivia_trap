import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Raised from '../components/Raised';
import Txt from '../components/Txt';
import { Settings } from '../game/storage';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.track, { backgroundColor: on ? '#19c37d' : '#dcd6e8' }]}>
      <View style={[styles.knob, { left: on ? 23 : 3 }]} />
    </Pressable>
  );
}

interface ToggleDef {
  key: keyof Settings;
  name: string;
  desc: string;
  color: string;
}

const TOGGLES: ToggleDef[] = [
  { key: 'sound', name: 'Sound effects', desc: 'Pops, dings and celebrations', color: '#ff4d6d' },
  { key: 'haptics', name: 'Haptics', desc: 'Vibrate on answers', color: '#7b5cff' },
  { key: 'notif', name: 'Reminder', desc: 'Every other day at 7 PM', color: '#1ba0cf' },
];

export default function SettingsScreen({ game }: { game: GameApi }) {
  const { state, toggleSetting, resetProgress } = game;
  const insets = useSafeAreaInsets();
  const st = state.P.settings;

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
      >
        <Txt w={700} style={styles.h1}>
          Settings
        </Txt>

        <Txt w={700} style={[styles.sectionLabel, { color: C.pink }]}>
          PREFERENCES
        </Txt>
        <Raised radius={22} depth={5} shadowColor="#e7def5" gradient={['#ffffff', '#fbf7ff']} style={[styles.card, { borderWidth: 2, borderColor: C.line }]}>
          {TOGGLES.map((t, i) => (
            <View
              key={t.key}
              style={[styles.row, i < TOGGLES.length - 1 ? { borderBottomWidth: 1.5, borderBottomColor: C.line } : null]}
            >
              <View style={[styles.dot, { backgroundColor: t.color }]} />
              <View style={{ flex: 1 }}>
                <Txt w={600} style={styles.rowName}>
                  {t.name}
                </Txt>
                <Txt w={500} style={styles.rowDesc}>
                  {t.desc}
                </Txt>
              </View>
              <Toggle on={st[t.key] as boolean} onPress={() => toggleSetting(t.key)} />
            </View>
          ))}
        </Raised>

        <Pressable onPress={resetProgress} style={styles.reset}>
          <Txt w={600} style={styles.resetText}>
            {state.resetArmed ? 'Tap again to confirm reset' : 'Reset all progress'}
          </Txt>
        </Pressable>
        <Txt w={500} style={styles.version}>
          Trivia Trap - v1.0.0
        </Txt>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 30 },
  h1: { fontSize: 26, color: C.ink, marginBottom: 20 },
  sectionLabel: { fontSize: 13, color: C.muted, letterSpacing: 0.5, marginBottom: 9, marginLeft: 4 },
  card: { paddingHorizontal: 16, paddingVertical: 4, marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  rowName: { fontSize: 16, color: C.ink },
  rowDesc: { fontSize: 12.5, color: C.muted },

  track: { width: 50, height: 30, borderRadius: 16, position: 'relative' },
  knob: {
    position: 'absolute',
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },

  reset: {
    borderWidth: 2,
    borderColor: '#ffd9e0',
    backgroundColor: '#fff5f7',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  resetText: { fontSize: 16, color: C.pink },
  version: { textAlign: 'center', fontSize: 12, color: '#b8b2c8', marginTop: 16 },
});
