'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box } from '@mui/material';

const Calendar: React.FC = () => {
  return (
    <Box sx={{ 
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
        // events will be loaded in the next step
        // select={handleDateSelect}
        // eventClick={handleEventClick}
        // eventsSet={handleEvents}
      />
    </Box>
  );
};

export default Calendar;
