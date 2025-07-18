'use client';

import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { Box, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';
import { EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { AppointmentWithRelations } from '@/types';
import AppointmentFormDialog from '@/app/(protected)/appointments/AppointmentFormDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { useSessionStore } from '@/store/sessionStore';
import { 
  CALENDAR_BUSINESS_HOURS, 
  CALENDAR_DAY_HEADER_FORMAT, 
  CALENDAR_NON_WORKING_DAYS, 
  CALENDAR_SLOT_LABEL_FORMAT,
  DEFAULT_EVENT_BACKGROUND_COLOR,
  DEFAULT_EVENT_BORDER_COLOR,
  BLOCKED_SLOT_BACKGROUND_COLOR,
  BLOCKED_SLOT_BORDER_COLOR,
  GENERIC_BUSY_LABEL,
  COMPLETED_EVENT_TEXT_COLOR
} from '@/config/constants';

const Calendar: React.FC = () => {
  const { profile } = useSessionStore();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const { data: fetchedAppointments, isLoading, isError, error } = useAppointments(dateRange?.start, dateRange?.end);
  const [localAppointments, setLocalAppointments] = useState<AppointmentWithRelations[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | undefined>(undefined);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'warning' | 'info' | 'success' } | null>(null);

  useEffect(() => {
    if (fetchedAppointments) {
      setLocalAppointments(fetchedAppointments);
    }
  }, [fetchedAppointments]);

  const handleSlotSelect = (start: Date, end: Date, unselect?: () => void) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      setSnackbar({ open: true, message: "Cannot select a past date.", severity: 'warning' });
      unselect?.();
      return;
    }

    const isOverlapping = localAppointments?.some(app =>
      app.status !== 'canceled' && (start < new Date(app.end_ts) && end > new Date(app.start_ts))
    );

    if (isOverlapping) {
      setSnackbar({ open: true, message: "This time slot is already booked.", severity: 'warning' });
      unselect?.();
      return;
    }

    setSelectedSlot({ start, end });
    setSelectedAppointment(null);
    setDialogOpen(true);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    handleSlotSelect(selectInfo.start, selectInfo.end, selectInfo.view.calendar.unselect);
  };

  const handleDateClick = (clickInfo: DateClickArg) => {
    const { date, view } = clickInfo;
    // Only handle clicks in time grid views to allow creating appointments by tapping a slot
    if (view.type !== 'timeGridWeek' && view.type !== 'timeGridDay') {
      return;
    }
    const slotDurationStr = view.calendar.getOption('slotDuration') as string || '00:30:00';
    const [hours, minutes, seconds] = slotDurationStr.split(':').map(Number);
    const durationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    const end = new Date(date.getTime() + durationMs);
    handleSlotSelect(date, end);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const appointment = clickInfo.event.extendedProps as AppointmentWithRelations;

    // Security check: Prevent clinic_staff from opening appointments that are not theirs.
    // The RPC function already anonymizes private admin appointments, but this adds a layer of UI safety.
    if (profile?.role === 'clinic_staff' && appointment.clinic_id !== profile.clinic_id) {
      // Optionally, show a snackbar message
      setSnackbar({ open: true, message: "You do not have permission to view this appointment.", severity: 'warning' });
      return; // Do not open the dialog
    }

    setSelectedAppointment(appointment);
    setSelectedSlot(undefined);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAppointment(null);
    setSelectedSlot(undefined);
  };


  const events = useMemo(() => {
    if (!localAppointments) return CALENDAR_NON_WORKING_DAYS;

    const appointmentEvents: EventInput[] = localAppointments.map(app => {
      // For clinic_staff, render any appointment not in their clinic as a generic busy slot.
      if (profile?.role === 'clinic_staff' && app.clinic_id !== profile.clinic_id) {
        return {
          id: String(app.id),
          title: GENERIC_BUSY_LABEL, // Generic "Busy" label, RPC already provides this
          start: app.start_ts,
          end: app.end_ts,
          backgroundColor: BLOCKED_SLOT_BACKGROUND_COLOR,
          borderColor: BLOCKED_SLOT_BORDER_COLOR,
          classNames: ['event-with-border'],
          editable: false, // Prevent interaction
          extendedProps: { ...app },
        };
      }

      // Render explicitly blocked slots with the same busy style for all roles.
      if (app.status === 'blocked') {
        return {
          id: String(app.id),
          title: app.short_label,
          start: app.start_ts,
          end: app.end_ts,
          backgroundColor: BLOCKED_SLOT_BACKGROUND_COLOR,
          borderColor: BLOCKED_SLOT_BORDER_COLOR,
          classNames: ['event-with-border'],
          extendedProps: { ...app },
        };
      }
      
      // Default rendering for admin or for staff's own appointments.
      return {
        id: String(app.id),
        title: app.short_label,
        start: app.start_ts,
        end: app.end_ts,
        backgroundColor: app.clinics?.color_hex || DEFAULT_EVENT_BACKGROUND_COLOR,
        borderColor: app.procedures_catalog?.color_hex || DEFAULT_EVENT_BORDER_COLOR,
        textColor: app.status === 'completed' ? COMPLETED_EVENT_TEXT_COLOR : undefined,
        classNames: ['event-with-border'],
        extendedProps: { ...app },
      };
    });
    
    return [...CALENDAR_NON_WORKING_DAYS, ...appointmentEvents];
  }, [localAppointments, profile]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="error">Error loading appointments: {error?.message}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: 'calc(100vh - 64px - 48px)', // Adjust based on AppBar and padding
      display: 'flex',
      flexDirection: 'column',
      '& .fc': {
        flexGrow: 1,
        '--fc-border-color': 'rgba(0, 0, 0, 0.12)',
        '--fc-today-bg-color': 'rgba(25, 118, 210, 0.04)',
        '.event-with-border': {
          borderLeft: '8px solid',
        },
        '.fc-event-title': {
          fontSize: '0.9em',
          fontWeight: '',
        },
        '& ::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '& ::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
        '& ::-webkit-scrollbar-thumb': {
          backgroundColor: '#ccc',
          borderRadius: '4px',
        },
        '& ::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#aaa',
        }
      },
      '.fc-toolbar-title': { fontSize: '1.2rem' },
      '.fc-button': { textTransform: 'capitalize' }
    }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        hiddenDays={[6]} // Hide Saturday
        slotMinTime={CALENDAR_BUSINESS_HOURS.startTime}
        slotMaxTime={CALENDAR_BUSINESS_HOURS.endTime}
        height="100%"
        locale='ru'
        firstDay={0} // Sunday
        slotLabelFormat={CALENDAR_SLOT_LABEL_FORMAT}
        dayHeaderFormat={CALENDAR_DAY_HEADER_FORMAT}
        businessHours={CALENDAR_BUSINESS_HOURS}
        events={events}
        selectConstraint="businessHours"
        eventConstraint="businessHours"
        allDaySlot={false}
        select={handleDateSelect}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        datesSet={(arg) => {
          if (dateRange?.start?.getTime() !== arg.start.getTime() || dateRange?.end?.getTime() !== arg.end.getTime()) {
            setDateRange({ start: arg.start, end: arg.end });
          }
        }}
      />
      <AppointmentFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        appointment={selectedAppointment}
        defaultDateTime={selectedSlot}
      />
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default Calendar;
