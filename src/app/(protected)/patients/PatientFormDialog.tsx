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
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { usePatientAppointments } from '@/hooks/usePatientAppointments';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { PatientFormData, patientSchema } from '@/types';
import { PATIENT_TYPES } from '@/config/constants';

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  defaultValues?: PatientFormData & { id?: string };
}

export default function PatientFormDialog({ open, onClose, onSubmit, defaultValues }: PatientFormDialogProps) {
  const patientId = defaultValues?.id;
  const { data: appointments, isLoading: isLoadingAppointments } = usePatientAppointments(patientId);

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

          {defaultValues && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Appointment History
              </Typography>
              {isLoadingAppointments ? (
                <CircularProgress />
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Procedure</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments && appointments.length > 0 ? (
                        appointments.map((app) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              {format(new Date(app.start_ts), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>{app.procedures_catalog?.name || 'N/A'}</TableCell>
                            <TableCell>{app.status}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            No appointments found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
