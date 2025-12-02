export interface Gig {
  id: string;
  title: string;
  description: string;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  time: string; // Time string (HH:mm)
  reminderSettings: ReminderSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderSettings {
  enabled: boolean;
  sevenDaysBefore: boolean;
  oneDayBefore: boolean;
  hoursBeforeOptions: number[]; // e.g., [1, 3, 6] for 1h, 3h, 6h before
  recurring: boolean;
  recurringIntervalDays: number; // e.g., 7 for weekly, 14 for biweekly
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  sevenDaysBefore: false,
  oneDayBefore: true,
  hoursBeforeOptions: [3],
  recurring: false,
  recurringIntervalDays: 7,
};

export type GigFormData = Omit<Gig, 'id' | 'createdAt' | 'updatedAt'>;
