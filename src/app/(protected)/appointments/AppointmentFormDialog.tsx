'use client';

import React, { useEffect, useState } from 'react';
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
  IconButton,
  Box,
  RadioGroup,
  Radio,
  Divider,
  FormControl,
  Switch,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { setHours, parseISO } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentFormData, appointmentSchema, AppointmentWithRelations } from '@/types';
import { useAddAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { usePatients, useAddPatient } from '@/hooks/usePatients';
import { useProcedures, useAddProcedure } from '@/hooks/useProcedures';
import { useClinics } from '@/hooks/useClinics';
import { useSessionStore } from '@/store/sessionStore';
import PatientFormDialog from '../patients/PatientFormDialog';
import ProcedureFormDialog from '../procedures/ProcedureFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { PatientFormData, ProcedureFormData } from '@/types';
import { DURATION_OPTIONS, SMILE_MORE_CLINIC_NAME } from '@/config/constants';

interface AppointmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  appointment?: AppointmentWithRelations | null;
  defaultDateTime?: { start: Date, end: Date };
}

const AppointmentFormDialog: React.FC<AppointmentFormDialogProps> = ({
  open,
  onClose,
  appointment,
  defaultDateTime,
}) => {
  const isEditMode = !!appointment;
  const { profile } = useSessionStore();

  const { data: patients, isLoading: isLoadingPatients } = usePatients({ sortBy: 'created_at', isDispensary: null });
  const { data: procedures, isLoading: isLoadingProcedures } = useProcedures();
  const { data: clinics, isLoading: isLoadingClinics } = useClinics();

  const addAppointmentMutation = useAddAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();
  const addPatientMutation = useAddPatient();
  const addProcedureMutation = useAddProcedure();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    shouldFocusError: true,
  });

  const selectedProcedureId = watch('procedure_id');
  const startTs = watch('start_ts');
  const endTs = watch('end_ts');

  const [isPatientDialogOpen, setPatientDialogOpen] = useState(false);
  const [isProcedureDialogOpen, setProcedureDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const isSubmitting = addAppointmentMutation.isPending || updateAppointmentMutation.isPending;

  const duration = startTs && endTs ? Math.round((new Date(endTs).getTime() - new Date(startTs).getTime()) / 60000) : 0;

  const handleDurationChange = (newDuration: number) => {
    const currentStartTs = getValues('start_ts');
    if (currentStartTs) {
      const startDate = new Date(currentStartTs);
      const endDate = new Date(startDate.getTime() + newDuration * 60000);
      setValue('end_ts', endDate.toISOString(), { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (selectedProcedureId && procedures) {
      const procedure = procedures.find(p => p.id === selectedProcedureId);
      if (procedure) {
        if (procedure.default_duration_min) {
          handleDurationChange(procedure.default_duration_min);
        }
        if (procedure.default_cost) {
          setValue('cost', Number(procedure.default_cost));
        }
      }
    }
  }, [selectedProcedureId, procedures, setValue]);

  const handleAddNewPatient = async (data: PatientFormData) => {
    const newPatient = await addPatientMutation.mutateAsync(data);
    setValue('patient_id', newPatient.id, { shouldValidate: true });
    setPatientDialogOpen(false);
  };

  const handleAddNewProcedure = async (data: ProcedureFormData) => {
    const newProcedure = await addProcedureMutation.mutateAsync(data);
    setValue('procedure_id', newProcedure.id, { shouldValidate: true });
    setProcedureDialogOpen(false);
  };

  const onValid = async (data: AppointmentFormData) => {
    try {
      const submissionData = {
        ...data,
        cost: data.cost ? Number(data.cost) : undefined,
        clinic_id: data.clinic_id || profile?.clinic_id || '',
      };

      if (isEditMode && appointment) {
        await updateAppointmentMutation.mutateAsync({ id: appointment.id, ...submissionData });
      } else {
        await addAppointmentMutation.mutateAsync(submissionData);
      }
      onClose();
    } catch (error) {
      // Proper error handling with user feedback (e.g., Snackbar) can be added here
      console.error("Failed to save appointment:", error);
    }
  };


  const handleDelete = () => {
    setConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isEditMode && appointment) {
      try {
        await deleteAppointmentMutation.mutateAsync(appointment.id);
        setConfirmDeleteDialogOpen(false);
        onClose(); // Close the main form dialog as well
      } catch (error) {
        console.error("Failed to delete appointment", error);
        // Optionally, show a snackbar error message
        setConfirmDeleteDialogOpen(false);
      }
    }
  };

  useEffect(() => {
    if (open && profile) {
      if (isEditMode && appointment) {
        reset({
          ...appointment,
          start_ts: new Date(appointment.start_ts).toISOString(),
          end_ts: new Date(appointment.end_ts).toISOString(),
          clinic_id: String(appointment.clinic_id),
          patient_id: String(appointment.patient_id),
          procedure_id: String(appointment.procedure_id),
          cost: appointment.cost ?? undefined,
          tooth_num: appointment.tooth_num ?? '',
          description: appointment.description ?? '',
          status: appointment.status ?? 'scheduled',
          short_label: appointment.short_label ?? '',
          send_notifications: appointment.send_notifications ?? true,
        });
      } else {
        const newAppointmentStart = defaultDateTime?.start || new Date();
        const newAppointmentEnd = defaultDateTime?.end || new Date(newAppointmentStart.getTime() + 30 * 60000);
        
        let defaultClinicId = '';
        if (profile.role === 'admin') {
          const smileMoreClinic = clinics?.find(c => c.name === SMILE_MORE_CLINIC_NAME);
          if (smileMoreClinic) {
            defaultClinicId = smileMoreClinic.id;
          }
        } else {
          defaultClinicId = profile.clinic_id || '';
        }

        reset({
          start_ts: newAppointmentStart.toISOString(),
          end_ts: newAppointmentEnd.toISOString(),
          status: 'scheduled',
          short_label: '',
          patient_id: '',
          procedure_id: '',
          cost: undefined,
          description: '',
          tooth_num: '',
          clinic_id: defaultClinicId,
          send_notifications: true,
        });
      }
    }
  }, [open, isEditMode, appointment, defaultDateTime, reset, profile, clinics]);

  const handleDateTimeChange = (newDate: Date | null, field: 'date' | 'time') => {
    if (!newDate) return;

    const currentStart = new Date(getValues('start_ts'));
    const currentDuration = duration * 60000;

    let newStart: Date;

    if (field === 'date') {
      newStart = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        newDate.getDate(),
        currentStart.getHours(),
        currentStart.getMinutes()
      );
    } else { // time
      newStart = new Date(
        currentStart.getFullYear(),
        currentStart.getMonth(),
        currentStart.getDate(),
        newDate.getHours(),
        newDate.getMinutes()
      );
    }
    
    const newEnd = new Date(newStart.getTime() + currentDuration);

    setValue('start_ts', newStart.toISOString(), { shouldValidate: true });
    setValue('end_ts', newEnd.toISOString(), { shouldValidate: true });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {isEditMode ? 'Edit Appointment' : 'New Appointment'}
            {isEditMode && (
              <IconButton onClick={handleDelete} disabled={isSubmitting}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit(onValid)}>
          <DialogContent>
            {(isLoadingPatients || isLoadingProcedures || isLoadingClinics) ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Controller name="end_ts" control={control} render={({ field }) => <input type="hidden" {...field} />} />
                {profile?.role === 'admin' && (
                  <Grid size={{ xs: 12 }}>
                    <FormControl component="fieldset" error={!!errors.clinic_id}>
                      {/* <FormLabel component="legend">Clinic</FormLabel> */}
                      <Controller
                        name="clinic_id"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            {clinics?.map((clinic) => (
                              <FormControlLabel
                                key={clinic.id}
                                value={clinic.id}
                                control={<Radio />}
                                label={clinic.name}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                      {errors.clinic_id && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.clinic_id.message}</p>}
                    </FormControl>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="patient_id"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Patient" fullWidth required error={!!errors.patient_id} helperText={errors.patient_id?.message}>
                        {patients?.map((p) => (
                          <MenuItem key={p.id} value={p.id}>{`${p.first_name} ${p.last_name}`}</MenuItem>
                        ))}
                        <Divider />
                        <MenuItem onClick={() => setPatientDialogOpen(true)}>
                          <AddCircleOutlineIcon sx={{ mr: 1 }} />
                          Add New Patient
                        </MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="procedure_id"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Procedure" fullWidth required error={!!errors.procedure_id} helperText={errors.procedure_id?.message}>
                        {procedures?.map((p) => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                         <Divider />
                         <MenuItem onClick={() => setProcedureDialogOpen(true)}>
                           <AddCircleOutlineIcon sx={{ mr: 1 }} />
                           Add New Procedure
                         </MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                   <Controller
                      name="start_ts"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Date"
                          value={field.value ? parseISO(field.value) : null}
                          onChange={(date) => handleDateTimeChange(date, 'date')}
                          format="dd/MM/yyyy"
                          disablePast
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      )}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                   <Controller
                      name="start_ts"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          label="Time"
                          value={field.value ? parseISO(field.value) : null}
                          onChange={(date) => handleDateTimeChange(date, 'time')}
                          ampm={false}
                          minTime={setHours(new Date(0), 8)}
                          maxTime={setHours(new Date(0), 21)}
                          slotProps={{ textField: { fullWidth: true, error: !!errors.start_ts, helperText: errors.start_ts?.message } }}
                        />
                      )}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select
                      label="Duration"
                      value={duration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      fullWidth
                      error={!!errors.end_ts}
                      helperText={errors.end_ts ? 'Invalid duration' : ''}
                    >
                      {DURATION_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 8 }}>
                  <Controller
                    name="short_label"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Short Label (Optional)" fullWidth error={!!errors.short_label} helperText={errors.short_label?.message} />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Controller
                    name="tooth_num"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Tooth #" fullWidth error={!!errors.tooth_num} helperText={errors.tooth_num?.message} />
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

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="send_notifications"
                        control={control}
                        render={({ field }) => (
                          <Switch {...field} checked={field.value} />
                        )}
                      />
                    }
                    label="Send Notifications"
                  />
                </Grid>

                {isEditMode && (
                  <Grid size={{ xs: 12 }}>
                     <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            <FormControlLabel value="scheduled" control={<Radio />} label="Scheduled" />
                            <FormControlLabel value="completed" control={<Radio />} label="Completed" />
                            <FormControlLabel value="canceled" control={<Radio />} label="Canceled" />
                          </RadioGroup>
                        )}
                      />
                  </Grid>
                )}
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

      <PatientFormDialog
        open={isPatientDialogOpen}
        onClose={() => setPatientDialogOpen(false)}
        onSubmit={handleAddNewPatient}
      />

      <ProcedureFormDialog
        open={isProcedureDialogOpen}
        onClose={() => setProcedureDialogOpen(false)}
        onSubmit={handleAddNewProcedure}
      />
      <ConfirmDialog
        open={isConfirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </>
  );
};

export default AppointmentFormDialog;
