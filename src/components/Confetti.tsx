import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Confetti as Piece } from '../game/useGame';

// Burst of falling confetti pieces (mockup's tt-confetti) used on a correct answer.
export default function Confetti({ pieces }: { pieces: Piece[] }) {
  if (!pieces.length) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} piece={p} />
      ))}
    </View>
  );
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: piece.dur * 1000,
      delay: piece.delay * 1000,
      useNativeDriver: true,
    }).start();
  }, [t, piece]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-12, 560] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: [`${piece.rot}deg`, `${piece.rot + 560}deg`] });
  const opacity = t.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${piece.left}%`,
        top: 0,
        width: piece.size,
        height: piece.size,
        backgroundColor: piece.col,
        borderRadius: piece.round ? piece.size / 2 : 2,
        opacity,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
}
