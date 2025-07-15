import { EventInput } from '@fullcalendar/core';

export const COLOR_PALETTE = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
  '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
  '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
  '#FF5722', '#795548', '#9E9E9E', '#607D8B',
];

export const CALENDAR_BUSINESS_HOURS = {
  daysOfWeek: [0, 1, 2, 3, 4, 5], // Sunday - Friday
  startTime: '08:00',
  endTime: '21:00',
};

export const CALENDAR_NON_WORKING_DAYS: EventInput[] = [
  {
    daysOfWeek: [6], // Saturday
    display: 'background',
    color: '#fafafa',
    allDay: true,
  }
];

export const CALENDAR_SLOT_LABEL_FORMAT = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
} as const;

export const CALENDAR_DAY_HEADER_FORMAT = {
  weekday: 'short',
  day: 'numeric',
  omitCommas: true
} as const;

export const DEFAULT_EVENT_BACKGROUND_COLOR = '#3788d8';
export const DEFAULT_EVENT_BORDER_COLOR = '#2a6fb5';

export const BLOCKED_SLOT_BACKGROUND_COLOR = '#e0e0e0';
export const BLOCKED_SLOT_BORDER_COLOR = '#616161';

export const DURATION_OPTIONS = [
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
];

export const PATIENT_TYPES = [
  'Взрослый',
  'Ребёнок',
  'Израильтянин',
  'Близкий',
];

export const SMILE_MORE_CLINIC_NAME = 'Smile More Clinic';
