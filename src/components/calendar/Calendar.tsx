'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';
import { 
  CALENDAR_BUSINESS_HOURS, 
  CALENDAR_DAY_HEADER_FORMAT, 
  CALENDAR_NON_WORKING_DAYS, 
  CALENDAR_SLOT_LABEL_FORMAT 
} from '@/config/constants';

const Calendar: React.FC = () => {
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
        slotMinTime={CALENDAR_BUSINESS_HOURS.startTime}
        slotMaxTime={CALENDAR_BUSINESS_HOURS.endTime}
        height="100%"
        locale='ru'
        firstDay={0} // Sunday
        slotLabelFormat={CALENDAR_SLOT_LABEL_FORMAT}
        dayHeaderFormat={CALENDAR_DAY_HEADER_FORMAT}
        businessHours={CALENDAR_BUSINESS_HOURS}
        events={CALENDAR_NON_WORKING_DAYS}
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
