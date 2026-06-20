import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C } from '../theme';
import { Screen } from '../game/useGame';
import Icon, { IconName } from './Icon';
import Txt from './Txt';

interface NavItemProps {
  icon: IconName;
  label: string;
  color: string;
  onPress: () => void;
}

function NavItem({ icon, label, color, onPress }: NavItemProps) {
  return (
    <Pressable
      style={styles.item}
      onPress={onPress}
      unstable_pressDelay={0}
      delayLongPress={250}
      hitSlop={6}
      pressRetentionOffset={12}
    >
      <Icon name={icon} size={25} color={color} />
      <Txt w={600} style={[styles.label, { color }]}>
        {label}
      </Txt>
    </Pressable>
  );
}

interface BottomNavProps {
  screen: Screen;
  onHome: () => void;
  onDaily: () => void;
  onStats: () => void;
  onSettings: () => void;
}

export default function BottomNav({ screen, onHome, onDaily, onStats, onSettings }: BottomNavProps) {
  const active = C.pink;
  const idle = C.mutedSoft;
  const insets = useSafeAreaInsets();
  // Keep the nav clear of the Android 3-button / iOS gesture system bar.
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <NavItem icon="nav-home" label="Home" color={screen === 'home' ? active : idle} onPress={onHome} />
      <NavItem icon="nav-daily" label="Daily" color={idle} onPress={onDaily} />
      <NavItem icon="nav-stats" label="Stats" color={screen === 'profile' ? active : idle} onPress={onStats} />
      <NavItem
        icon="nav-settings"
        label="Settings"
        color={screen === 'settings' ? active : idle}
        onPress={onSettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 70,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopWidth: 1.5,
    borderTopColor: '#f0ebf7',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 11,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
});
