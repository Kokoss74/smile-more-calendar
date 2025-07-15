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
  FormControl,
  Switch,
  Snackbar,
  Alert,
  Checkbox,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { setHours, parseISO, startOfDay } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAppointmentSchema, AppointmentDialogFormData, AppointmentWithRelations } from '@/types';
import { useAddAppointment, useUpdateAppointment, useDeleteAppointment } from '@/hooks/useAppointments';
import { usePatients, useAddPatient, useUpdatePatient } from '@/hooks/usePatients';
import { useProcedures, useAddProcedure } from '@/hooks/useProcedures';
import { useClinics } from '@/hooks/useClinics';
import { useSessionStore } from '@/store/sessionStore';
import PatientFormDialog from '../patients/PatientFormDialog';
import ProcedureFormDialog from '../procedures/ProcedureFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { PatientFormData, ProcedureFormData } from '@/types';
import { DURATION_OPTIONS, SMILE_MORE_CLINIC_NAME, CALENDAR_BUSINESS_HOURS } from '@/config/constants';
import AdminAppointmentForm from './components/AdminAppointmentForm';
import StaffAppointmentForm from './components/StaffAppointmentForm';
import BlockTimeForm from './components/BlockTimeForm';

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
  const { profile, user } = useSessionStore();
  const isClinicStaff = profile?.role === 'clinic_staff';

  const appointmentSchema = createAppointmentSchema(isClinicStaff);

  const { data: patients, isLoading: isLoadingPatients } = usePatients({ sortBy: 'last_name', sortDirection: 'asc', isDispensary: null });
  const { data: procedures, isLoading: isLoadingProcedures } = useProcedures();
  const { data: clinics, isLoading: isLoadingClinics } = useClinics();

  const addAppointmentMutation = useAddAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();
  const addPatientMutation = useAddPatient();
  const updatePatientMutation = useUpdatePatient();
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

  const selectedPatientId = watch('patient_id');
  const selectedProcedureId = watch('procedure_id');
  const startTs = watch('start_ts');
  const endTs = watch('end_ts');
  const status = watch('status');

  const [isPatientDialogOpen, setPatientDialogOpen] = useState(false);
  const [isProcedureDialogOpen, setProcedureDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [isBlockMode, setBlockMode] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [errorSnackbar, setErrorSnackbar] = useState<string | null>(null);

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
    if (isBlockMode) {
      setValue('status', 'blocked');
      setValue('patient_id', null);
      setValue('procedure_id', null);
      setValue('cost', null);
      setValue('tooth_num', null);
      setValue('description', '');
      setValue('send_notifications', false);
      setValue('short_label', 'Blocked');
      const smileMoreClinic = clinics?.find(c => c.name === SMILE_MORE_CLINIC_NAME);
      if (smileMoreClinic) {
        setValue('clinic_id', smileMoreClinic.id);
      }
    } else {
      setValue('status', 'scheduled');
      setValue('send_notifications', true);
      setValue('short_label', '');
    }
  }, [isBlockMode, setValue, clinics]);

  useEffect(() => {
    if (isAllDay && isBlockMode) {
        const currentStartDate = startTs ? new Date(startTs) : new Date();
        const dayStart = setHours(startOfDay(currentStartDate), parseInt(CALENDAR_BUSINESS_HOURS.startTime.split(':')[0], 10));
        const dayEnd = setHours(startOfDay(currentStartDate), parseInt(CALENDAR_BUSINESS_HOURS.endTime.split(':')[0], 10));
        setValue('start_ts', dayStart.toISOString(), { shouldValidate: true });
        setValue('end_ts', dayEnd.toISOString(), { shouldValidate: true });
    }
  }, [isAllDay, isBlockMode, startTs, setValue]);


  useEffect(() => {
    if (selectedProcedureId && procedures && !isBlockMode) {
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
  }, [selectedProcedureId, procedures, setValue, isBlockMode]);

  useEffect(() => {
    if (selectedPatientId && selectedProcedureId && patients && procedures && !isBlockMode) {
      const patient = patients.find(p => p.id === selectedPatientId);
      const procedure = procedures.find(p => p.id === selectedProcedureId);
      if (patient && procedure) {
        const currentLabel = getValues('short_label');
        if (!currentLabel || currentLabel.includes(patient.last_name) || currentLabel.includes(procedure.name)) {
           setValue('short_label', `${patient.last_name} - ${procedure.name}`);
        }
      }
    }
  }, [selectedPatientId, selectedProcedureId, patients, procedures, setValue, getValues, isBlockMode]);

  const handleAddNewPatient = async (data: PatientFormData) => {
    const finalPatientData = { ...data, owner_id: null as string | null };

    if (profile?.role === 'admin' && user && clinics) {
      const selectedClinicId = getValues('clinic_id');
      const smileMoreClinic = clinics.find(c => c.name === SMILE_MORE_CLINIC_NAME);
      if (selectedClinicId === smileMoreClinic?.id) {
        finalPatientData.owner_id = user.id;
      }
    }

    const newPatient = await addPatientMutation.mutateAsync(finalPatientData);
    setValue('patient_id', newPatient.id, { shouldValidate: true });
    setPatientDialogOpen(false);
  };

  const handleAddNewProcedure = async (data: ProcedureFormData) => {
    const newProcedure = await addProcedureMutation.mutateAsync(data);
    setValue('procedure_id', newProcedure.id, { shouldValidate: true });
    setProcedureDialogOpen(false);
  };

  const onValid = async (data: AppointmentDialogFormData) => {
    try {
      const clinicId = data.clinic_id || profile?.clinic_id;

      if (!clinicId) {
        setErrorSnackbar('Error: Clinic ID is missing. Cannot save appointment.');
        console.error('Clinic ID is missing for profile:', profile);
        return;
      }

      const submissionData = {
        ...data,
        cost: data.cost ? Number(data.cost) : undefined,
        clinic_id: clinicId,
      };

      if (profile?.role === 'admin' && user && submissionData.patient_id && clinics && patients) {
        const smileMoreClinic = clinics.find(c => c.name === SMILE_MORE_CLINIC_NAME);
        const patientToUpdate = patients.find(p => p.id === submissionData.patient_id);

        if (patientToUpdate) {
          const newOwnerId = submissionData.clinic_id === smileMoreClinic?.id ? user.id : null;

          if (patientToUpdate.owner_id !== newOwnerId) {
            const { ...rest } = patientToUpdate;
            const patientFormData: Omit<PatientFormData, 'owner_id'> & { owner_id: string | null } = {
              ...rest,
              patient_type: rest.patient_type || null,
              owner_id: newOwnerId,
            };
            
            updatePatientMutation.mutate({ 
              id: patientToUpdate.id,
              ...patientFormData,
            });
          }
        }
      }

      if (isEditMode && appointment) {
        await updateAppointmentMutation.mutateAsync({ id: appointment.id, ...submissionData });
      } else if (isClinicStaff) {
        await addAppointmentMutation.mutateAsync({
          ...submissionData,
          patient_id: null,
          procedure_id: null,
          tooth_num: '',
          send_notifications: false,
        });
      } else {
        await addAppointmentMutation.mutateAsync(submissionData);
      }
      onClose();
    } catch (error) {
        const errorMessage = (error as Error)?.message;
        if (errorMessage?.includes('timeslot_is_already_booked')) {
            setErrorSnackbar('This time slot is already booked. Please choose a different time.');
        } else {
            setErrorSnackbar('Failed to save the appointment. Please try again.');
        }
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
        onClose();
      } catch (error) {
        console.error("Failed to delete appointment", error);
        setConfirmDeleteDialogOpen(false);
      }
    }
  };

  useEffect(() => {
    if (open) {
        const isBlocked = appointment?.status === 'blocked';
        setBlockMode(isBlocked);
        setIsAllDay(false);
        if (isEditMode && appointment) {
            reset({
                ...appointment,
                start_ts: new Date(appointment.start_ts).toISOString(),
                end_ts: new Date(appointment.end_ts).toISOString(),
                clinic_id: String(appointment.clinic_id),
                patient_id: appointment.patient_id ? String(appointment.patient_id) : null,
                procedure_id: appointment.procedure_id ? String(appointment.procedure_id) : null,
                cost: appointment.cost ?? undefined,
                tooth_num: appointment.tooth_num ?? '',
                description: appointment.description ?? '',
                status: appointment.status ?? 'scheduled',
                short_label: appointment.short_label ?? '',
                send_notifications: appointment.send_notifications ?? true,
            });
        } else if (profile) {
            const newAppointmentStart = defaultDateTime?.start || new Date();
            const newAppointmentEnd = defaultDateTime?.end || new Date(newAppointmentStart.getTime() + 30 * 60000);
            
            let defaultClinicId: string | undefined = undefined;
            if (profile.role === 'admin') {
                const smileMoreClinic = clinics?.find(c => c.name === SMILE_MORE_CLINIC_NAME);
                if (smileMoreClinic) {
                    defaultClinicId = smileMoreClinic.id;
                }
            } else if (profile.clinic_id) {
                defaultClinicId = profile.clinic_id;
            }

            reset({
                start_ts: newAppointmentStart.toISOString(),
                end_ts: newAppointmentEnd.toISOString(),
                status: 'scheduled',
                short_label: '',
                patient_id: null,
                procedure_id: null,
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
    } else {
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
            {isEditMode ? (status === 'blocked' ? 'Edit Blocked Time' : 'Edit Appointment') : 'New Appointment'}
            {isEditMode && (
              <IconButton onClick={handleDelete} disabled={isSubmitting || status === 'completed'}>
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
                
                {profile?.role === 'admin' && !isClinicStaff && !(isBlockMode || status === 'blocked') && (
                  <Grid size={{ xs: 12 }}>
                    <FormControl component="fieldset" error={!!errors.clinic_id}>
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
                                disabled={status === 'completed'}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                      {errors.clinic_id && <p style={{ color: '#d32f2f', fontSize: '0.75rem', margin: '3px 14px 0' }}>{errors.clinic_id.message}</p>}
                    </FormControl>
                  </Grid>
                )}

                {profile?.role === 'admin' && !isClinicStaff && !isEditMode && (
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={<Switch checked={isBlockMode} onChange={(e) => setBlockMode(e.target.checked)} />}
                      label="Block Time Slot"
                    />
                  </Grid>
                )}
                
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
                          disabled={isAllDay || status === 'completed'}
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
                          label="Start Time"
                          value={field.value ? parseISO(field.value) : null}
                          onChange={(date) => handleDateTimeChange(date, 'time')}
                          ampm={false}
                          minTime={setHours(new Date(0), parseInt(CALENDAR_BUSINESS_HOURS.startTime.split(':')[0], 10))}
                          maxTime={setHours(new Date(0), parseInt(CALENDAR_BUSINESS_HOURS.endTime.split(':')[0], 10))}
                          slotProps={{ textField: { fullWidth: true, error: !!errors.start_ts, helperText: errors.start_ts?.message } }}
                          disabled={isAllDay || status === 'completed'}
                        />
                      )}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  {isBlockMode || status === 'blocked' ? null : (
                    <TextField
                      select
                      label="Duration"
                      value={duration}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      fullWidth
                      error={!!errors.end_ts}
                      helperText={errors.end_ts ? 'Invalid duration' : ''}
                      disabled={status === 'completed'}
                    >
                      {DURATION_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>

                {isBlockMode || status === 'blocked' ? (
                  <BlockTimeForm
                    control={control as any}
                    errors={errors as any}
                    isAllDay={isAllDay}
                    setIsAllDay={setIsAllDay}
                    startTs={startTs}
                    setValue={setValue as any}
                  />
                ) : isClinicStaff ? (
                  <StaffAppointmentForm control={control as any} errors={errors as any} />
                ) : (
                  <AdminAppointmentForm
                    control={control as any}
                    errors={errors as any}
                    status={status || 'scheduled'}
                    patients={patients || []}
                    procedures={procedures || []}
                    setPatientDialogOpen={setPatientDialogOpen}
                    setProcedureDialogOpen={setProcedureDialogOpen}
                  />
                )}
                
                {isEditMode && !isClinicStaff && !(isBlockMode || status === 'blocked') && (
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={status === 'completed'}
                          onChange={(e) => setValue('status', e.target.checked ? 'completed' : 'scheduled', { shouldValidate: true })}
                        />
                      }
                      label="Mark as Completed"
                    />
                  </Grid>
                )}

                {isEditMode && status !== 'completed' && !(isBlockMode || status === 'blocked') && (
                  <Grid size={{ xs: 12 }}>
                     <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup {...field} row>
                            <FormControlLabel value="scheduled" control={<Radio />} label="Scheduled" disabled={isClinicStaff} />
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

      <Snackbar open={!!errorSnackbar} autoHideDuration={6000} onClose={() => setErrorSnackbar(null)}>
        <Alert onClose={() => setErrorSnackbar(null)} severity="error" sx={{ width: '100%' }}>
          {errorSnackbar}
        </Alert>
      </Snackbar>

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
