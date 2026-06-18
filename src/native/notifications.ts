import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_ID_PREFIX = 'trivia-trap-reminder';
const LEGACY_DAILY_ID = 'trivia-trap-daily-reminder';
const REMINDER_CHANNEL_ID = 'play-reminder';
const HOUR = 19;
const MINUTE = 0;
const EVERY_OTHER_DAY_MS = 2 * 24 * 60 * 60 * 1000;
const ROLLING_REMINDER_COUNT = 32;

const MESSAGES: { title: string; body: string }[] = [
  { title: 'Keep your streak alive!', body: 'Your Daily 10 is ready. Can you stay flawless today?' },
  { title: 'Brain check-in', body: "10 quick questions are waiting. Don't break the streak!" },
  { title: 'Daily Challenge', body: 'New questions just dropped. Beat the crowd today!' },
  { title: 'Two minutes, big points', body: 'A fresh Daily 10 round is live. Jump back in!' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function nextReminderStart(now = new Date()): Date {
  const start = new Date(now);
  start.setHours(HOUR, MINUTE, 0, 0);
  if (start.getTime() <= now.getTime()) {
    start.setDate(start.getDate() + 1);
  }
  return start;
}

function reminderDate(index: number, start = nextReminderStart()): Date {
  return new Date(start.getTime() + index * EVERY_OTHER_DAY_MS);
}

function reminderId(index: number): string {
  return `${REMINDER_ID_PREFIX}-${index}`;
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Play reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#ff4d6d',
    });
  } catch {
    // Channel setup is best-effort.
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

export async function cancelPlayReminders(): Promise<void> {
  const ids = [LEGACY_DAILY_ID, ...Array.from({ length: ROLLING_REMINDER_COUNT }, (_, index) => reminderId(index))];
  await Promise.all(
    ids.map(async (id) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch {
        // Nothing scheduled for this id.
      }
    }),
  );
}

export async function schedulePlayReminders(): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    const granted = await requestNotificationPermission();
    if (!granted) return false;

    await cancelPlayReminders();

    const start = nextReminderStart();
    await Promise.all(
      Array.from({ length: ROLLING_REMINDER_COUNT }, async (_, index) => {
        const message = MESSAGES[index % MESSAGES.length];
        await Notifications.scheduleNotificationAsync({
          identifier: reminderId(index),
          content: {
            title: message.title,
            body: message.body,
            sound: false,
            ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate(index, start),
          },
        });
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export async function syncPlayReminders(enabled: boolean): Promise<void> {
  if (enabled) {
    await schedulePlayReminders();
  } else {
    await cancelPlayReminders();
  }
}
