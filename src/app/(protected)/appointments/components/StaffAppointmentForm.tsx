'use client';

import React from 'react';
import { Grid, TextField } from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { AppointmentFormData } from '@/types';

interface StaffAppointmentFormProps {
  control: Control<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
}

const StaffAppointmentForm: React.FC<StaffAppointmentFormProps> = ({ control, errors }) => {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="short_label"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Short Label" fullWidth required error={!!errors.short_label} helperText={errors.short_label?.message} />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="cost"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label="Cost"
              fullWidth
              error={!!errors.cost}
              helperText={errors.cost?.message}
              InputLabelProps={{ shrink: !!field.value || field.value === 0 }}
              value={field.value ?? ''}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Description" multiline rows={3} fullWidth error={!!errors.description} helperText={errors.description?.message} />
          )}
        />
      </Grid>
    </>
  );
};

export default StaffAppointmentForm;
