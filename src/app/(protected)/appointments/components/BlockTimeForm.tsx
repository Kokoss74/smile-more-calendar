'use client';

import React from 'react';
import { Grid, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers';
import { Controller, Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { parseISO, setHours } from 'date-fns';
import { AppointmentFormData } from '@/types';
import { CALENDAR_BUSINESS_HOURS } from '@/config/constants';

interface BlockTimeFormProps {
  control: Control<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
  isAllDay: boolean;
  setIsAllDay: (isAllDay: boolean) => void;
  startTs: string | null;
  setValue: UseFormSetValue<AppointmentFormData>;
}

const BlockTimeForm: React.FC<BlockTimeFormProps> = ({ control, errors, isAllDay, setIsAllDay, startTs, setValue }) => {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
            />
          }
          label="All-day"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Controller
          name="end_ts"
          control={control}
          render={({ field }) => (
            <TimePicker
              label="End Time"
              value={field.value ? parseISO(field.value) : null}
              onChange={(date) => setValue('end_ts', date?.toISOString() || '', { shouldValidate: true })}
              ampm={false}
              minTime={startTs ? parseISO(startTs) : setHours(new Date(0), parseInt(CALENDAR_BUSINESS_HOURS.startTime.split(':')[0], 10))}
              maxTime={setHours(new Date(0), parseInt(CALENDAR_BUSINESS_HOURS.endTime.split(':')[0], 10))}
              slotProps={{ textField: { fullWidth: true, error: !!errors.end_ts, helperText: errors.end_ts?.message } }}
              disabled={isAllDay}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
            name="short_label"
            control={control}
            render={({ field }) => (
                <TextField {...field} label="Reason for blocking (optional)" fullWidth />
            )}
        />
      </Grid>
    </>
  );
};

export default BlockTimeForm;
