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
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentFormData, appointmentSchema, AppointmentWithRelations } from '@/types';
import { useAddAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { useClinics } from '@/hooks/useClinics';
import { usePatients } from '@/hooks/usePatients';
import { useProcedures } from '@/hooks/useProcedures';
import { useSessionStore } from '@/store/sessionStore';

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
  const { profile } = useSessionStore();

  const { data: clinics, isLoading: isLoadingClinics } = useClinics();
  const { data: patients, isLoading: isLoadingPatients } = usePatients({ sortBy: 'created_at', isDispensary: null });
  const { data: procedures, isLoading: isLoadingProcedures } = useProcedures();

  const addAppointmentMutation = useAddAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    shouldFocusError: true,
  });

  const isSubmitting = addAppointmentMutation.isPending || updateAppointmentMutation.isPending;

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (isEditMode && appointment) {
        await updateAppointmentMutation.mutateAsync({ id: appointment.id, ...data });
      } else {
        await addAppointmentMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save appointment", error);
      // Here you can add user-facing error handling (e.g., a snackbar)
    }
  };

  const handleDelete = async () => {
    if (isEditMode && appointment) {
      try {
        await deleteAppointmentMutation.mutateAsync(appointment.id);
        onClose();
      } catch (error) {
        console.error("Failed to delete appointment", error);
      }
    }
  };

  React.useEffect(() => {
    if (!open) return;

    if (isEditMode && appointment) {
      const defaultValues: AppointmentFormData = {
        ...appointment,
        start_ts: new Date(appointment.start_ts).toISOString(),
        end_ts: new Date(appointment.end_ts).toISOString(),
        clinic_id: String(appointment.clinic_id),
        patient_id: appointment.patient_id ? String(appointment.patient_id) : '',
        procedure_id: appointment.procedure_id ? String(appointment.procedure_id) : '',
        cost: appointment.cost ?? undefined,
        tooth_num: appointment.tooth_num ?? '',
        description: appointment.description ?? '',
        status: appointment.status ?? 'scheduled',
        private: appointment.private ?? true,
        short_label: appointment.short_label ?? '',
      };
      reset(defaultValues);
    } else {
      const initialValues: AppointmentFormData = {
        start_ts: defaultDateTime ? new Date(defaultDateTime.startStr).toISOString() : '',
        end_ts: defaultDateTime ? new Date(defaultDateTime.endStr).toISOString() : '',
        status: 'scheduled',
        private: profile?.role === 'admin',
        clinic_id: profile?.clinic_id || '',
        short_label: '',
        patient_id: '',
        procedure_id: '',
        cost: undefined,
        description: '',
        tooth_num: '',
      };
      reset(initialValues);
    }
  }, [open, isEditMode, appointment, defaultDateTime, reset, profile]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {isEditMode ? 'Edit Appointment' : 'New Appointment'}
          {isEditMode && (
            <IconButton onClick={handleDelete} disabled={deleteAppointmentMutation.isPending}>
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {(isLoadingClinics || isLoadingPatients || isLoadingProcedures) ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="short_label"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Short Label" fullWidth error={!!errors.short_label} helperText={errors.short_label?.message} />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="clinic_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Clinic" fullWidth error={!!errors.clinic_id} helperText={errors.clinic_id?.message}>
                      {clinics?.map((clinic) => (
                        <MenuItem key={clinic.id} value={clinic.id}>{clinic.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="patient_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Patient" fullWidth error={!!errors.patient_id} helperText={errors.patient_id?.message}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {patients?.map((patient) => (
                        <MenuItem key={patient.id} value={patient.id}>{`${patient.first_name} ${patient.last_name}`}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="procedure_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Procedure" fullWidth error={!!errors.procedure_id} helperText={errors.procedure_id?.message}>
                      <MenuItem value=""><em>None</em></MenuItem>
                      {procedures?.map((proc) => (
                        <MenuItem key={proc.id} value={proc.id}>{proc.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} type="number" label="Cost" fullWidth error={!!errors.cost} helperText={errors.cost?.message} />
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth error={!!errors.status} helperText={errors.status?.message}>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="canceled">Canceled</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Controller
                      name="private"
                      control={control}
                      render={({ field }) => <Checkbox {...field} checked={field.value} />}
                    />
                  }
                  label="Private Appointment"
                />
              </Grid>
            </Grid>
          )}
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
