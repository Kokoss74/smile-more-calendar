'use client';

import React, { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, CircularProgress, Typography, Snackbar, Alert } from '@mui/material';
import { EventInput, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { AppointmentWithRelations } from '@/types';
import AppointmentFormDialog from '@/app/(protected)/appointments/AppointmentFormDialog';
import { useAppointments } from '@/hooks/useAppointments';
import { 
  CALENDAR_BUSINESS_HOURS, 
  CALENDAR_DAY_HEADER_FORMAT, 
  CALENDAR_NON_WORKING_DAYS, 
  CALENDAR_SLOT_LABEL_FORMAT,
  DEFAULT_EVENT_BACKGROUND_COLOR,
  DEFAULT_EVENT_BORDER_COLOR,
  BLOCKED_SLOT_BACKGROUND_COLOR,
  BLOCKED_SLOT_BORDER_COLOR
} from '@/config/constants';

const Calendar: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const { data: appointments, isLoading, isError, error } = useAppointments(dateRange?.start, dateRange?.end);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | undefined>(undefined);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'warning' | 'info' | 'success' } | null>(null);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const { start, end, view } = selectInfo;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      setSnackbar({ open: true, message: "Cannot select a past date.", severity: 'warning' });
      view.calendar.unselect();
      return;
    }

    const isOverlapping = appointments?.some(app => 
      app.status !== 'canceled' && (start < new Date(app.end_ts) && end > new Date(app.start_ts))
    );

    if (isOverlapping) {
      setSnackbar({ open: true, message: "This time slot is already booked.", severity: 'warning' });
      view.calendar.unselect();
      return;
    }

    setSelectedSlot({ start, end });
    setSelectedAppointment(null);
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const appointment = clickInfo.event.extendedProps as AppointmentWithRelations;
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
    if (!appointments) return CALENDAR_NON_WORKING_DAYS;

    const appointmentEvents: EventInput[] = appointments.map(app => {
      if (app.status === 'blocked') {
        return {
          id: String(app.id),
          title: app.short_label,
          start: app.start_ts,
          end: app.end_ts,
          backgroundColor: BLOCKED_SLOT_BACKGROUND_COLOR,
          borderColor: BLOCKED_SLOT_BORDER_COLOR,
          classNames: ['event-with-border'],
          extendedProps: {
            ...app
          }
        };
      }
      
      return {
        id: String(app.id),
        title: app.short_label,
        start: app.start_ts,
        end: app.end_ts,
        backgroundColor: app.clinics?.color_hex || DEFAULT_EVENT_BACKGROUND_COLOR,
        borderColor: app.procedures_catalog?.color_hex || DEFAULT_EVENT_BORDER_COLOR,
        classNames: ['event-with-border'],
        extendedProps: {
          ...app
        }
      };
    });
    
    return [...CALENDAR_NON_WORKING_DAYS, ...appointmentEvents];
  }, [appointments]);

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
        <Typography color="error">Error loading appointments: {error.message}</Typography>
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
        datesSet={(arg) => {
          setDateRange({ start: arg.start, end: arg.end });
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
