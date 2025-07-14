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
