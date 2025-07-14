'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import { EventInput } from '@fullcalendar/core';

const Calendar: React.FC = () => {
  // Business hours (Sunday to Friday, 8am to 9pm)
  const businessHours = {
    daysOfWeek: [0, 1, 2, 3, 4, 5], // Sunday - Friday
    startTime: '08:00',
    endTime: '21:00',
  };

  // Mark Saturday as a non-working day
  const nonWorkingDays: EventInput[] = [
    {
      start: '2024-01-06T00:00:00', // A sample Saturday
      end: '2024-01-06T23:59:59',
      display: 'background',
      color: '#f5f5f5',
      allDay: true,
      daysOfWeek: [6] // Saturday
    }
  ];


  return (
    <Box sx={{
      height: 'calc(100vh - 64px - 48px)', // Adjust based on AppBar and padding
      display: 'flex',
      flexDirection: 'column',
      '& .fc': {
        flexGrow: 1,
        '--fc-border-color': 'rgba(0, 0, 0, 0.12)',
        '--fc-today-bg-color': 'rgba(25, 118, 210, 0.04)',
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
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        height="100%"
        locale='ru' // For Russian month/day names
        firstDay={0} // Sunday
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        dayHeaderFormat={{
          weekday: 'short',
          day: 'numeric',
          // month: 'numeric',
          omitCommas: true
        }}
        businessHours={businessHours}
        events={nonWorkingDays}
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
