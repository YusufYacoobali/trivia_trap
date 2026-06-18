import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { PRIMARY_BTN } from '../visual';
import Raised from './Raised';
import Txt from './Txt';

interface PrimaryButtonProps {
  label: string;
  accent: string;
  accentSh: string;
  onPress: () => void;
  depth?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

// The single accent call-to-action button (Play Again, Next Question, …).
export default function PrimaryButton({
  label,
  accent,
  accentSh,
  onPress,
  depth = PRIMARY_BTN.depth,
  radius = PRIMARY_BTN.radius,
  style,
}: PrimaryButtonProps) {
  return (
    <Raised onPress={onPress} radius={radius} depth={depth} shadowColor={accentSh} gradient={[accent, accentSh]} style={[styles.btn, style]}>
      <Txt w={700} style={styles.txt}>
        {label}
      </Txt>
    </Raised>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 16, alignItems: 'center' },
  txt: { fontSize: 18, color: '#fff' },
});
