import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

interface RaisedProps {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  depth?: number;
  radius?: number;
  shadowColor: string;
  faceColor?: string;
  gradient?: string[];
  style?: StyleProp<ViewStyle>; // applied to the face
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
}

// Re-creates the mockup's chunky "0 Npx 0 color" solid bottom shadow used on
// every card and button. The shadow color shows as a rounded strip beneath the
// face; pressing shrinks it and drops the face, like a physical key.
export default function Raised({
  children,
  onPress,
  disabled,
  depth = 6,
  radius = 20,
  shadowColor,
  faceColor = '#ffffff',
  gradient,
  style,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
}: RaisedProps) {
  const [pressed, setPressed] = useState(false);
  const curDepth = pressed && onPress && !disabled ? Math.max(1, depth - 4) : depth;
  const drop = depth - curDepth;

  const faceStyle: StyleProp<ViewStyle> = [
    { borderRadius: radius, marginBottom: curDepth, overflow: 'hidden' },
    style,
  ];

  const face = gradient ? (
    <LinearGradient
      colors={gradient as [string, string, ...string[]]}
      start={gradientStart}
      end={gradientEnd}
      style={faceStyle}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[{ backgroundColor: faceColor }, faceStyle]}>{children}</View>
  );

  const outerStyle: StyleProp<ViewStyle> = {
    borderRadius: radius,
    backgroundColor: shadowColor,
    transform: [{ translateY: drop }],
  };

  if (!onPress) {
    return <View style={outerStyle}>{face}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={outerStyle}
    >
      {face}
    </Pressable>
  );
}
