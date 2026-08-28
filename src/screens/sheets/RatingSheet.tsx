import React from 'react';
import { StyleSheet, View } from 'react-native';

import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import Sheet from '../../components/Sheet';
import Txt from '../../components/Txt';
import { GameApi } from '../../game/useGame';
import { C } from '../../theme';

/**
 * The soft ask.
 *
 * This never mentions stars or ratings, because the question it asks is a real
 * one: do you like this? A "yes" is what buys the native store prompt (see
 * src/game/rating.ts for why that budget is worth protecting). A "no" ends the
 * asking permanently rather than routing someone unhappy to the store.
 */
export default function RatingSheet({ game }: { game: GameApi }) {
  const { answerRatingAsk } = game;

  return (
    <Sheet zIndex={60} showHandle={false} style={styles.sheet}>
      <Txt style={styles.emoji}>👋</Txt>
      <Txt w={700} style={styles.title}>
        Enjoying Trivia Trap?
      </Txt>
      <Txt w={500} style={styles.sub}>
        No wrong answer here - we just want to know.
      </Txt>

      <View style={{ gap: 11, marginTop: 22 }}>
        <PrimaryButton label="Loving it 🎉" accent={C.pink} accentSh={C.pinkSh} onPress={() => answerRatingAsk(true)} />
        <Card
          onPress={() => answerRatingAsk(false)}
          radius={20}
          depth={4}
          shadowColor={C.lineDeep}
          borderColor={C.lineDeep}
          style={styles.secondary}
        >
          <Txt w={600} style={styles.secondaryText}>
            Not really
          </Txt>
        </Card>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingBottom: 28, alignItems: 'stretch' },
  emoji: { fontSize: 44, lineHeight: 50, textAlign: 'center' },
  title: { textAlign: 'center', fontSize: 24, color: C.ink, lineHeight: 28, marginTop: 4 },
  sub: { textAlign: 'center', fontSize: 14.5, color: C.muted, marginTop: 7, lineHeight: 20 },
  secondary: { paddingVertical: 14, alignItems: 'center' },
  secondaryText: { fontSize: 16, color: '#6b6584' },
});
