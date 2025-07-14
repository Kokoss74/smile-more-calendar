'use client';

import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, CircularProgress, Typography } from '@mui/material';
import { EventInput } from '@fullcalendar/core';
import { useAppointments } from '@/hooks/useAppointments';
import { 
  CALENDAR_BUSINESS_HOURS, 
  CALENDAR_DAY_HEADER_FORMAT, 
  CALENDAR_NON_WORKING_DAYS, 
  CALENDAR_SLOT_LABEL_FORMAT 
} from '@/config/constants';

const Calendar: React.FC = () => {
  const { data: appointments, isLoading, isError, error } = useAppointments();

  const events = useMemo(() => {
    if (!appointments) return CALENDAR_NON_WORKING_DAYS;

    const appointmentEvents: EventInput[] = appointments.map(app => ({
      id: String(app.id),
      title: app.short_label,
      start: app.start_ts,
      end: app.end_ts,
      backgroundColor: app.clinics?.color_hex || '#3788d8',
      borderColor: app.procedures_catalog?.color_hex || '#2a6fb5',
      classNames: ['event-with-border'],
      extendedProps: {
        ...app
      }
    }));
    
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
          borderLeft: '4px solid',
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
        // select={handleDateSelect}
        // eventClick={handleEventClick}
        // eventsSet={handleEvents}
      />
    </Box>
  );
};

export default Calendar;
