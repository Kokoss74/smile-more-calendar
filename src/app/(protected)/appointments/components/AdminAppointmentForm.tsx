'use client';

import React from 'react';
import { Grid, TextField, FormControlLabel, Switch, MenuItem, Divider, Autocomplete } from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { AppointmentFormData, Patient, Procedure } from '@/types';

interface AdminAppointmentFormProps {
  control: Control<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
  status: string;
  patients: Patient[];
  procedures: Procedure[];
  setPatientDialogOpen: (isOpen: boolean) => void;
  setProcedureDialogOpen: (isOpen: boolean) => void;
}

const AdminAppointmentForm: React.FC<AdminAppointmentFormProps> = ({
  control,
  errors,
  status,
  patients,
  procedures,
  setPatientDialogOpen,
  setProcedureDialogOpen,
}) => {
  return (
    <>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="patient_id"
          control={control}
          render={({ field }) => (
            <Autocomplete
              disabled={status === 'completed'}
              options={patients || []}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              value={patients?.find(p => p.id === field.value) || null}
              onChange={(_, newValue) => {
                field.onChange(newValue ? newValue.id : '');
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Patient"
                  required
                  error={!!errors.patient_id}
                  helperText={errors.patient_id?.message}
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {`${option.first_name} ${option.last_name}`}
                </li>
              )}
              ListboxComponent={(props) => (
                <ul {...props}>
                  {props.children}
                  <Divider />
                  <MenuItem onClick={() => setPatientDialogOpen(true)}>
                    <AddCircleOutlineIcon sx={{ mr: 1 }} />
                    Add New Patient
                  </MenuItem>
                </ul>
              )}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="procedure_id"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Procedure" fullWidth required error={!!errors.procedure_id} helperText={errors.procedure_id?.message} disabled={status === 'completed'}>
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
      <Grid size={{ xs: 12, sm: 8 }}>
        <Controller
          name="short_label"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Short Label (Optional)" fullWidth error={!!errors.short_label} helperText={errors.short_label?.message} disabled={status === 'completed'} />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <Controller
          name="tooth_num"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Tooth #" fullWidth error={!!errors.tooth_num} helperText={errors.tooth_num?.message} disabled={status === 'completed'} />
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
              disabled={status === 'completed'}
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
                <Switch {...field} checked={field.value} disabled={status === 'completed'} />
              )}
            />
          }
          label="Send Notifications"
        />
      </Grid>
    </>
  );
};

export default AdminAppointmentForm;
