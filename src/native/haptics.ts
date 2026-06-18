import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Thin guarded wrappers so haptics are a no-op on web and never throw.
export function tapHaptic(enabled: boolean) {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function resultHaptic(enabled: boolean, correct: boolean) {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.notificationAsync(
    correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
  ).catch(() => {});
}
