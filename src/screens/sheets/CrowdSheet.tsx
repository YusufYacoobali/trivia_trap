import React from 'react';
import { StyleSheet, View } from 'react-native';

import Raised from '../../components/Raised';
import Sheet from '../../components/Sheet';
import Txt from '../../components/Txt';
import { CROWD } from '../../data/game';
import { GameApi } from '../../game/useGame';
import { C } from '../../theme';

export default function CrowdSheet({ game }: { game: GameApi }) {
  const { pickCrowd } = game;
  return (
    <Sheet>
      <Txt w={700} style={styles.title}>
        Beat the Crowd
      </Txt>
      <Txt w={500} style={styles.sub}>
        How many players got this right?
      </Txt>
      <View style={styles.grid}>
        {CROWD.map((label, i) => (
          <View key={label} style={{ width: '48%' }}>
            <Raised
              onPress={() => pickCrowd(i)}
              radius={18}
              depth={5}
              shadowColor="#c4eed7"
              faceColor="#e6f8ef"
              style={styles.bucket}
            >
              <Txt w={700} style={styles.bucketText}>
                {label}
              </Txt>
            </Raised>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', fontSize: 24, color: C.ink, lineHeight: 27 },
  sub: { textAlign: 'center', fontSize: 14, color: C.muted, marginTop: 5, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  bucket: { padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#b6ecce' },
  bucketText: { fontSize: 18, color: C.green },
});
