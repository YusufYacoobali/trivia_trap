import React from 'react';
import { Image, ImageSourcePropType, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Raised from '../components/Raised';
import ScreenBackdrop from '../components/ScreenBackdrop';
import Txt from '../components/Txt';
import { CATMETA, CATS, getCategoryQuestionCount, MODES } from '../data/game';
import { GameApi } from '../game/useGame';
import { C } from '../theme';

function countFor(cat: string): string {
  if (cat === 'All') return 'Everything';
  const n = getCategoryQuestionCount(cat);
  return `${n} questions`;
}

const CATEGORY_ICONS: Record<string, ImageSourcePropType> = {
  All: require('../../assets/category-icons/all.png'),
  History: require('../../assets/category-icons/history.png'),
  Science: require('../../assets/category-icons/science.png'),
  Football: require('../../assets/category-icons/football.png'),
  Movies: require('../../assets/category-icons/movies.png'),
  Geography: require('../../assets/category-icons/geography.png'),
  Animals: require('../../assets/category-icons/animals.png'),
  'Weird facts': require('../../assets/category-icons/weird-facts.png'),
};

export default function CategoryScreen({ game }: { game: GameApi }) {
  const { state, selectCategory, goHome } = game;
  const insets = useSafeAreaInsets();
  const mode = state.mode!;
  const modeName = MODES[mode].name;

  return (
    <ScreenBackdrop>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 30 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.head}>
        <Raised onPress={goHome} radius={14} depth={4} shadowColor={C.lineDeep} faceColor="#fff" style={styles.back}>
          <Txt style={styles.backArrow}>&lt;</Txt>
        </Raised>
        <View>
          <Txt w={700} style={styles.title}>
            Pick a category
          </Txt>
          <Txt w={500} style={styles.subtitle}>
            {modeName}
          </Txt>
        </View>
      </View>

      <View style={styles.grid}>
        {CATS.map((name) => {
          const meta = CATMETA[name];
          return (
            <View key={name} style={{ width: '48%' }}>
              <Raised
                onPress={() => selectCategory(name)}
                radius={22}
                depth={6}
                shadowColor={meta.sh}
                gradient={meta.gradient}
                style={styles.catFace}
              >
                <View style={styles.iconBox}>
                  <Image source={CATEGORY_ICONS[name]} style={styles.iconImage} resizeMode="contain" />
                </View>
                <Txt w={600} style={styles.catName}>
                  {name}
                </Txt>
                <Txt w={500} style={styles.catCount}>
                  {countFor(name)}
                </Txt>
              </Raised>
            </View>
          );
        })}
      </View>
      </ScrollView>
    </ScreenBackdrop>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 30 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 22 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.line },
  backArrow: { fontSize: 22, color: C.ink, lineHeight: 24 },
  title: { fontSize: 22, color: C.ink, lineHeight: 24 },
  subtitle: { fontSize: 13, color: C.muted },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 13 },
  catFace: { padding: 16, minHeight: 120 },
  iconBox: { width: 54, height: 54, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  iconImage: { width: 46, height: 46 },
  catName: { fontSize: 16, color: '#fff', lineHeight: 18 },
  catCount: { fontSize: 12, color: 'rgba(255,255,255,0.82)', marginTop: 3 },
});
