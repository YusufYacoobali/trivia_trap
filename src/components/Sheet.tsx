import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SheetProps {
  children: React.ReactNode;
  zIndex?: number;
  style?: StyleProp<ViewStyle>;
  showHandle?: boolean;
}

// Bottom sheet. Keep it at its final layout position so child hitboxes line up
// immediately; animating translateY can make first taps miss on Android.
export default function Sheet({ children, zIndex = 40, style, showHandle = true }: SheetProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.sheet, { zIndex, elevation: zIndex, opacity }, style]}>
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
