import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from '@expo-google-fonts/fredoka';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from './src/components/BottomNav';
import { SCREEN_BACKDROP_IMAGE } from './src/components/ScreenBackdrop';
import { useGame } from './src/game/useGame';
import CategoryScreen from './src/screens/CategoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import QuestionScreen from './src/screens/QuestionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import { C } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });
  const game = useGame();
  const { screen } = game.state;

  if (!fontsLoaded || !game.state.loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={C.pink} size="large" />
      </View>
    );
  }

  const showNav = screen === 'home' || screen === 'profile' || screen === 'settings';
  const immersive = screen === 'summary' || screen === 'question';
  const bg = screen === 'summary' ? '#ffe1ec' : C.appBg;
  const showCandyBackdrop = screen === 'home' || screen === 'category';

  return (
    <SafeAreaProvider>
      <View style={[styles.appShell, { backgroundColor: bg }]}>
        {showCandyBackdrop ? (
          <>
            <ImageBackground source={SCREEN_BACKDROP_IMAGE} resizeMode="cover" style={StyleSheet.absoluteFill} />
            <View pointerEvents="none" style={styles.backdropTint} />
          </>
        ) : null}
        <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
          <StatusBar hidden />
          <View style={styles.body}>
            {screen === 'home' && <HomeScreen game={game} />}
            {screen === 'category' && <CategoryScreen game={game} />}
            {screen === 'question' && <QuestionScreen game={game} />}
            {screen === 'summary' && <SummaryScreen game={game} />}
            {screen === 'profile' && <ProfileScreen game={game} />}
            {screen === 'settings' && <SettingsScreen game={game} />}
          </View>
          {showNav && !immersive ? (
            <BottomNav
              screen={screen}
              onHome={game.goHome}
              onDaily={() => game.selectMode('daily')}
              onStats={game.goProfile}
              onSettings={game.goSettings}
            />
          ) : null}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appShell: { flex: 1 },
  root: { flex: 1 },
  body: { flex: 1 },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.appBg },
});
