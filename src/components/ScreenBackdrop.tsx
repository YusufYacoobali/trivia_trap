import React from 'react';
import { StyleSheet, View } from 'react-native';

export const SCREEN_BACKDROP_IMAGE = require('../../assets/backgrounds/candy-bg.jpg');

export default function ScreenBackdrop({ children }: { children: React.ReactNode }) {
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
