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
  Checkbox,
  IconButton,
  Box,
  RadioGroup,
  Radio,
  Divider,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { setHours, parseISO } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentFormData, appointmentSchema, AppointmentWithRelations } from '@/types';
import { useAddAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { usePatients, useAddPatient } from '@/hooks/usePatients';
import { useProcedures, useAddProcedure } from '@/hooks/useProcedures';
import { useSessionStore } from '@/store/sessionStore';
import { useAppointmentTemplates } from '@/hooks/useAppointmentTemplates';
import PatientFormDialog from '../patients/PatientFormDialog';
import ProcedureFormDialog from '../procedures/ProcedureFormDialog';
import { PatientFormData, ProcedureFormData } from '@/types';
import { DURATION_OPTIONS } from '@/config/constants';

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
  const { data: templates } = useAppointmentTemplates();

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
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    shouldFocusError: true,
    defaultValues: {
      short_label: '',
      cost: undefined,
      description: '',
      tooth_num: '',
      status: 'scheduled',
    }
  });

  const selectedProcedureId = watch('procedure_id');
  const startTs = watch('start_ts');
  const endTs = watch('end_ts');

  const [isPatientDialogOpen, setPatientDialogOpen] = useState(false);
  const [isProcedureDialogOpen, setProcedureDialogOpen] = useState(false);

  const isSubmitting = addAppointmentMutation.isPending || updateAppointmentMutation.isPending;

  const duration = startTs && endTs ? Math.round((parseISO(endTs).getTime() - parseISO(startTs).getTime()) / 60000) : 0;

  const handleDurationChange = (newDuration: number) => {
    if (startTs) {
      const startDate = parseISO(startTs);
      const endDate = new Date(startDate.getTime() + newDuration * 60000);
      setValue('end_ts', endDate.toISOString());
    }
  };

  useEffect(() => {
    if (selectedProcedureId && templates && startTs) {
      const template = templates.find(t => t.default_procedure_id === selectedProcedureId);
      if (template) {
        handleDurationChange(template.default_duration_min);
        if (template.default_cost) {
          setValue('cost', template.default_cost);
        }
      }
    }
  }, [selectedProcedureId, templates, startTs, setValue]);

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

  useEffect(() => {
    if (!open) return;

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
      });
    } else {
      reset({
        start_ts: defaultDateTime ? defaultDateTime.start.toISOString() : '',
        end_ts: defaultDateTime ? defaultDateTime.end.toISOString() : '',
        status: 'scheduled',
        clinic_id: profile?.clinic_id || '',
        short_label: '',
        patient_id: '',
        procedure_id: '',
        cost: undefined,
        description: '',
        tooth_num: '',
      });
    }
  }, [open, isEditMode, appointment, defaultDateTime, reset, profile]);

  const isCompleted = useWatch({ control, name: 'status' }) === 'completed';

  const handleDateTimeChange = (newDate: Date | null, field: 'date' | 'time') => {
    if (!newDate) return;
    const currentStartDate = parseISO(startTs || new Date().toISOString());
    let year = currentStartDate.getFullYear();
    let month = currentStartDate.getMonth();
    let day = currentStartDate.getDate();
    let hours = currentStartDate.getHours();
    let minutes = currentStartDate.getMinutes();

    if (field === 'date') {
      year = newDate.getFullYear();
      month = newDate.getMonth();
      day = newDate.getDate();
    } else {
      hours = newDate.getHours();
      minutes = newDate.getMinutes();
    }
    
    const finalDate = new Date(year, month, day, hours, minutes);
    setValue('start_ts', finalDate.toISOString(), { shouldValidate: true });
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {(isLoadingPatients || isLoadingProcedures) ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Controller name="clinic_id" control={control} render={({ field }) => <input type="hidden" {...field} />} />
                <Controller name="end_ts" control={control} render={({ field }) => <input type="hidden" {...field} />} />

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
                          slotProps={{ textField: { fullWidth: true } }}
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
                      <TextField {...field} type="number" label="Cost" fullWidth error={!!errors.cost} helperText={errors.cost?.message} />
                    )}
                  />
                </Grid>

                {isEditMode && (
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <Checkbox
                              checked={field.value === 'completed'}
                              onChange={(e) => field.onChange(e.target.checked ? 'completed' : 'scheduled')}
                            />
                          )}
                        />
                      }
                      label="Mark as Completed"
                    />
                    {!isCompleted && (
                       <Controller
                          name="status"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup {...field} row>
                              <FormControlLabel value="scheduled" control={<Radio />} label="Scheduled" />
                              <FormControlLabel value="canceled" control={<Radio />} label="Canceled" />
                            </RadioGroup>
                          )}
                        />
                    )}
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
    </>
  );
};

export default AppointmentFormDialog;
