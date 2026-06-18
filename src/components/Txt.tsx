import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

type Weight = 400 | 500 | 600 | 700;

const FAMILY: Record<Weight, string> = {
  400: 'Fredoka_400Regular',
  500: 'Fredoka_500Medium',
  600: 'Fredoka_600SemiBold',
  700: 'Fredoka_700Bold',
};

interface TxtProps extends TextProps {
  w?: Weight;
  style?: StyleProp<TextStyle>;
}

// Single typography primitive so every label uses Fredoka at the right weight,
// matching the mockup's font-weight usage.
export default function Txt({ w = 500, style, children, ...rest }: TxtProps) {
  return (
    <Text {...rest} style={[{ fontFamily: FAMILY[w], color: '#2a2540' }, style]}>
      {children}
    </Text>
  );
}
