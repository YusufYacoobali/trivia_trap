import React from 'react';
import { StyleSheet, View } from 'react-native';

import Raised from '../../components/Raised';
import Sheet from '../../components/Sheet';
import Txt from '../../components/Txt';
import { CONF } from '../../data/game';
import { GameApi } from '../../game/useGame';
import { C } from '../../theme';

export default function ConfidenceSheet({ game }: { game: GameApi }) {
  const { pickConfidence } = game;
  return (
    <Sheet>
      <Txt w={700} style={styles.title}>
        How sure are you?
      </Txt>
      <Txt w={500} style={styles.sub}>
        Bet big for more points - and more to lose
      </Txt>
      <View style={{ gap: 12 }}>
        {CONF.map((c) => (
          <Raised
            key={c.l}
            onPress={() => pickConfidence(c.l)}
            radius={20}
            depth={6}
            shadowColor={c.sh}
            faceColor={c.color}
            style={styles.row}
          >
            <View style={{ flex: 1 }}>
              <Txt w={700} style={styles.name}>
                {c.name}
              </Txt>
              <Txt w={500} style={styles.desc}>
                {c.desc}
              </Txt>
            </View>
            <View style={styles.stakes}>
              <View style={styles.pts}>
                <Txt w={700} style={styles.ptsText}>
                  {c.pts}
                </Txt>
              </View>
              {/* The downside is the whole point of the bet, so it is never
                  hidden behind a tap. */}
              <Txt w={600} style={styles.risk}>
                {c.risk > 0 ? `-${c.risk} if wrong` : 'no penalty'}
              </Txt>
            </View>
          </Raised>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', fontSize: 24, color: C.ink, lineHeight: 27 },
  sub: { textAlign: 'center', fontSize: 14, color: C.muted, marginTop: 5, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, paddingHorizontal: 18 },
  name: { fontSize: 18, color: '#fff' },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  stakes: { alignItems: 'center', gap: 4 },
  pts: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 14, paddingVertical: 6, paddingHorizontal: 14 },
  ptsText: { fontSize: 26, color: '#fff' },
  risk: { fontSize: 11.5, color: 'rgba(255,255,255,0.82)' },
});
