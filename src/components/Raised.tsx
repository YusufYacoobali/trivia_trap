import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
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
  const makeFace = (isPressed = false) => {
    const curDepth = isPressed && onPress && !disabled ? Math.max(1, depth - 4) : depth;
    const drop = depth - curDepth;
    const faceStyle: StyleProp<ViewStyle> = [
      {
        borderRadius: radius,
        overflow: 'hidden',
        transform: [{ translateY: drop }],
      },
      style,
    ];

    return gradient ? (
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
  };

  const outerStyle: StyleProp<ViewStyle> = {
    borderRadius: radius,
    backgroundColor: shadowColor,
    paddingBottom: depth,
  };

  if (!onPress) {
    return <View style={outerStyle}>{makeFace()}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      unstable_pressDelay={0}
      delayLongPress={250}
      hitSlop={4}
      pressRetentionOffset={12}
      style={outerStyle}
    >
      {({ pressed }) => makeFace(pressed)}
    </Pressable>
  );
}
