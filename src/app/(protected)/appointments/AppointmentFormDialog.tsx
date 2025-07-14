'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentFormData, appointmentSchema } from '@/types';
import { AppointmentWithRelations } from '@/types';

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  appointment?: AppointmentWithRelations | null;
  defaultDateTime?: { startStr: string, endStr: string };
}

const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  open,
  onClose,
  appointment,
  defaultDateTime,
}) => {
  const isEditMode = !!appointment;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: AppointmentFormData) => {
    // Submit logic will be here
    console.log(data);
    onClose();
  };

  React.useEffect(() => {
    if (open) {
      if (isEditMode && appointment) {
        // set edit values
      } else if (defaultDateTime) {
        // set new values
      } else {
        reset({});
      }
    }
  }, [appointment, defaultDateTime, isEditMode, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Form fields will be here */}
            <Grid size={{ xs: 12 }}>
              <Controller
                name="short_label"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Short Label"
                    fullWidth
                    error={!!errors.short_label}
                    helperText={errors.short_label?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : (isEditMode ? 'Save Changes' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentFormDialog;
