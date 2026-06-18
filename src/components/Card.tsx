import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { CARD } from '../visual';
import Raised from './Raised';

interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  radius?: number;
  depth?: number;
  shadowColor?: string;
  borderColor?: string;
  faceColor?: string;
  style?: StyleProp<ViewStyle>;
}

// Neutral white surface used everywhere a plain card/button is needed.
// Defaults come from the visual system; callers only override when a specific
// size is required (small icon buttons, etc.).
export default function Card({
  children,
  onPress,
  disabled,
  radius = CARD.radius,
  depth = CARD.depth,
  shadowColor = CARD.shadow,
  borderColor = CARD.border,
  faceColor = CARD.face,
  style,
}: CardProps) {
  return (
    <Raised
      onPress={onPress}
      disabled={disabled}
      radius={radius}
      depth={depth}
      shadowColor={shadowColor}
      faceColor={faceColor}
      style={[{ borderWidth: 2, borderColor }, style]}
    >
      {children}
    </Raised>
  );
}
