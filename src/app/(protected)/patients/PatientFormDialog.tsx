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
  FormControlLabel,
  Switch,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientFormData, patientSchema } from '@/types';
import { PATIENT_TYPES } from '@/config/constants';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  defaultValues?: PatientFormData;
}

export default function PatientFormDialog({ open, onClose, onSubmit, defaultValues }: PatientFormDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues || {
      first_name: '',
      last_name: '',
      phone: '',
      patient_type: 'Взрослый',
      notes: null,
      is_dispensary: false,
      notification_language_is_hebrew: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues || {
        first_name: '',
        last_name: '',
        phone: '',
        patient_type: 'Взрослый',
        notes: null,
        is_dispensary: false,
        notification_language_is_hebrew: false,
      });
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: PatientFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{defaultValues ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="first_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    margin="dense"
                    label="First Name"
                    fullWidth
                    variant="outlined"
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="last_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="Last Name"
                    fullWidth
                    variant="outlined"
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="Phone Number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="patient_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    margin="dense"
                    label="Patient Type"
                    fullWidth
                    variant="outlined"
                    error={!!errors.patient_type}
                    helperText={errors.patient_type?.message}
                  >
                    {PATIENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="Notes"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    value={field.value ?? ''}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="is_dispensary"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Dispensary Group"
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="notification_language_is_hebrew"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Notifications in Hebrew"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
