import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Platform } from 'react-native';

// Short answer-feedback sound effects. Players are created lazily once and
// reused (rewound on each play) so playback is instant and cheap.

let correctPlayer: AudioPlayer | null = null;
let wrongPlayer: AudioPlayer | null = null;
let initialized = false;

function init() {
  if (initialized) return;
  initialized = true;
  try {
    // Play even when the device ringer is on silent (iOS), and don't pause
    // other audio mixing rules beyond defaults.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    correctPlayer = createAudioPlayer(require('../../assets/sounds/correct.wav'));
    wrongPlayer = createAudioPlayer(require('../../assets/sounds/wrong.wav'));
  } catch {
    // audio unavailable; degrade silently
  }
}

export function playSound(enabled: boolean, type: 'correct' | 'wrong') {
  if (!enabled || Platform.OS === 'web') return;
  try {
    init();
    const p = type === 'correct' ? correctPlayer : wrongPlayer;
    if (!p) return;
    // Rewind then play so rapid repeat answers always retrigger from the start.
    (async () => {
      try {
        await p.seekTo(0);
        p.play();
      } catch {
        // ignore playback hiccups
      }
    })();
  } catch {
    // ignore
  }
}
