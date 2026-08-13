import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type TimeOfDay = { hour: number; minute: number };

const CHANNEL_ID = 'reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissionsAsync(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === 'granted';
}

async function cancelByCategory(category: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter((n) => n.content.data?.category === category);
  await Promise.all(toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

async function scheduleDaily(title: string, body: string, time: TimeOfDay, category: string): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { category } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: CHANNEL_ID,
      hour: time.hour,
      minute: time.minute,
    },
  });
}

// day: 0=Lunes..6=Domingo (mismo convenio que set_reminder_screen.tsx) — WeeklyTriggerInput
// de expo-notifications usa 1=Domingo..7=Sábado, de ahí la conversión.
async function scheduleWeekly(title: string, body: string, time: TimeOfDay, day: number, category: string): Promise<string> {
  const weekday = ((day + 1) % 7) + 1;
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { category } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      channelId: CHANNEL_ID,
      weekday,
      hour: time.hour,
      minute: time.minute,
    },
  });
}

export interface WaterReminderSettings {
  enabled: boolean;
  is24Hours: boolean;
  intervalMinutes: number;
  start?: TimeOfDay;
  end?: TimeOfDay;
  atTime?: TimeOfDay;
}

/** Reprograma todos los recordatorios de agua desde cero (cancela los anteriores primero). */
export async function scheduleWaterReminders(settings: WaterReminderSettings): Promise<void> {
  await cancelByCategory('water');
  if (!settings.enabled) return;
  const granted = await ensureNotificationPermissionsAsync();
  if (!granted) return;

  if (settings.is24Hours) {
    if (settings.atTime) {
      await scheduleDaily('💧 Hora de beber agua', 'No olvides mantenerte hidratado hoy.', settings.atTime, 'water');
    }
    return;
  }
  if (!settings.start || !settings.end) return;
  const startMinutes = settings.start.hour * 60 + settings.start.minute;
  const endMinutes = settings.end.hour * 60 + settings.end.minute;
  const interval = Math.max(15, settings.intervalMinutes || 60);
  for (let m = startMinutes; m <= endMinutes; m += interval) {
    const hour = Math.floor(m / 60) % 24;
    const minute = m % 60;
    await scheduleDaily('💧 Hora de beber agua', 'No olvides mantenerte hidratado hoy.', { hour, minute }, 'water');
  }
}

export interface MealReminderSettings {
  breakfast: { enabled: boolean; time: TimeOfDay };
  lunch: { enabled: boolean; time: TimeOfDay };
  snacks: { enabled: boolean; time: TimeOfDay };
  dinner: { enabled: boolean; time: TimeOfDay };
}

const MEAL_LABELS: Record<keyof MealReminderSettings, string> = {
  breakfast: 'Desayuno',
  lunch: 'Comida',
  snacks: 'Snack',
  dinner: 'Cena',
};

/** Reprograma todos los recordatorios de comidas desde cero (cancela los anteriores primero). */
export async function scheduleMealReminders(meals: MealReminderSettings): Promise<void> {
  await cancelByCategory('meal');
  const anyEnabled = Object.values(meals).some((m) => m.enabled);
  if (!anyEnabled) return;
  const granted = await ensureNotificationPermissionsAsync();
  if (!granted) return;

  for (const key of Object.keys(MEAL_LABELS) as (keyof MealReminderSettings)[]) {
    const meal = meals[key];
    if (!meal.enabled) continue;
    const label = MEAL_LABELS[key];
    await scheduleDaily(`🍽️ ${label}`, `Es hora de registrar tu ${label.toLowerCase()}.`, meal.time, 'meal');
  }
}

export interface CustomReminderInput {
  title: string;
  description: string;
  time: TimeOfDay;
  days: number[]; // 0=Lunes..6=Domingo, ignorado si isDaily
  isDaily: boolean;
}

/** Programa un recordatorio personalizado nuevo — devuelve los ids de notificación creados (uno por día si no es diario). */
export async function scheduleCustomReminder(input: CustomReminderInput): Promise<string[]> {
  const granted = await ensureNotificationPermissionsAsync();
  if (!granted) return [];
  if (input.isDaily) {
    const id = await scheduleDaily(input.title, input.description, input.time, 'custom');
    return [id];
  }
  const ids: string[] = [];
  for (const day of input.days) {
    ids.push(await scheduleWeekly(input.title, input.description, input.time, day, 'custom'));
  }
  return ids;
}

export async function cancelNotifications(notificationIds: string[]): Promise<void> {
  await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
