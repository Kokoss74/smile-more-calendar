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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatientFormData, patientSchema } from '@/types';

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
      age: null,
      notes: null,
      is_dispensary: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues || {
        first_name: '',
        last_name: '',
        phone: '',
        age: null,
        notes: null,
        is_dispensary: false,
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
                name="age"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="Age"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.age}
                    helperText={errors.age?.message}
                    onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    value={field.value ?? ''}
                  />
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
            <Grid size={12}>
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
