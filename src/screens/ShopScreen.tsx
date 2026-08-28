import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import Card from '../components/Card';
import Raised from '../components/Raised';
import ScreenBackdrop from '../components/ScreenBackdrop';
import Txt from '../components/Txt';
import { SHOP } from '../data/game';
import { ShopItem } from '../data/types';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

const KIND_STYLE: Record<ShopItem['kind'], { gradient: [string, string]; sh: string }> = {
  hint: { gradient: ['#a98bff', '#7b5cff'], sh: '#5f3fe0' },
  freeze: { gradient: ['#4fcef5', '#1ba0cf'], sh: '#1583a8' },
  theme: { gradient: ['#ffc15c', '#f59008'], sh: '#c2730a' },
};

function Row({ item, game }: { item: ShopItem; game: GameApi }) {
  const { state, buyItem } = game;
  const owned = item.kind === 'theme' && state.P.owned.indexOf(item.id) >= 0;
  const affordable = state.P.coins >= item.cost;
  const disabled = owned || !affordable;
  const look = KIND_STYLE[item.kind];

  const held =
    item.kind === 'freeze'
      ? state.P.inventory.freeze
      : item.kind === 'hint'
        ? state.P.inventory[item.id.replace('pack-', '') as 'fifty' | 'crowd' | 'skip']
        : 0;

  return (
    <Raised
      radius={22}
      depth={5}
      shadowColor={C.lineDeep}
      faceColor="#fff"
      style={[styles.row, { borderWidth: 2, borderColor: C.line, opacity: disabled && !owned ? 0.62 : 1 }]}
    >
      <Raised radius={16} depth={0} shadowColor={look.sh} gradient={look.gradient} style={styles.icon}>
        <Txt w={700} style={styles.iconText}>
          {item.icon}
        </Txt>
      </Raised>

      <View style={{ flex: 1 }}>
        <Txt w={600} style={styles.name}>
          {item.name}
        </Txt>
        <Txt w={500} style={styles.desc}>
          {item.desc}
        </Txt>
        {item.kind !== 'theme' ? (
          <Txt w={500} style={styles.held}>
            You have {held}
          </Txt>
        ) : null}
      </View>

      <Card
        onPress={disabled ? undefined : () => buyItem(item)}
        disabled={disabled}
        radius={15}
        depth={4}
        shadowColor={owned ? C.lineDeep : affordable ? C.pinkSh : C.lineDeep}
        borderColor={owned ? C.lineDeep : affordable ? C.pinkSh : C.lineDeep}
        faceColor={owned ? C.line : affordable ? C.pink : '#fff'}
        style={styles.buy}
      >
        <Txt w={700} style={{ fontSize: 14, color: owned ? C.muted : affordable ? '#fff' : C.mutedSoft }}>
          {owned ? 'Owned' : `${item.cost}`}
        </Txt>
      </Card>
    </Raised>
  );
}

export default function ShopScreen({ game }: { game: GameApi }) {
  const { state, goHome } = game;

  return (
    <ScreenBackdrop>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
        <View style={styles.header}>
          <Card onPress={goHome} radius={13} depth={4} style={styles.back}>
            <Txt style={styles.backText}>{'<'}</Txt>
          </Card>
          <Txt w={700} style={styles.title}>
            Shop
          </Txt>
          <View style={styles.coinPill}>
            <View style={styles.coin} />
            <Txt w={600} style={styles.coinText}>
              {state.P.coins}
            </Txt>
          </View>
        </View>

        <Txt w={500} style={styles.blurb}>
          Coins come from every round you finish. Hints top back up to a free floor once a day.
        </Txt>

        <View style={{ gap: 12 }}>
          {SHOP.map((item) => (
            <Row key={item.id} item={item} game={game} />
          ))}
        </View>
      </ScrollView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: C.muted },
  title: { flex: 1, fontSize: 26, color: C.ink },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ffe2c2',
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 11,
    borderRadius: 14,
  },
  coin: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#ffc23d' },
  coinText: { color: C.coinText, fontSize: 14 },

  blurb: { fontSize: 13.5, color: C.muted, lineHeight: 19, marginBottom: 18, paddingHorizontal: 4 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, color: '#fff' },
  name: { fontSize: 16, color: C.ink },
  desc: { fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 17 },
  held: { fontSize: 11.5, color: C.mutedSoft, marginTop: 3 },
  buy: { minWidth: 64, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
});
