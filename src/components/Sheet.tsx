import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SheetProps {
  children: React.ReactNode;
  zIndex?: number;
  style?: StyleProp<ViewStyle>;
  showHandle?: boolean;
}

// Bottom sheet that slides up on mount (mirrors the mockup's tt-slideup).
export default function Sheet({ children, zIndex = 40, style, showHandle = true }: SheetProps) {
  const { height } = useWindowDimensions();
  const ty = useRef(new Animated.Value(height)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.spring(ty, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 160,
      mass: 0.9,
    }).start();
  }, [ty]);

  return (
    <Animated.View style={[styles.sheet, { zIndex, transform: [{ translateY: ty }] }, style]}>
      {showHandle ? (
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
      ) : null}
      {children}
      {/* clear the Android/iOS system bar at the bottom of the screen */}
      {insets.bottom > 0 ? <View style={{ height: insets.bottom }} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 34,
    boxShadow: '0 -16px 30px rgba(40, 20, 80, 0.3)',
  },
  handleWrap: { alignItems: 'center', marginBottom: 16 },
  handle: { width: 44, height: 5, borderRadius: 5, backgroundColor: '#e6def0' },
});
