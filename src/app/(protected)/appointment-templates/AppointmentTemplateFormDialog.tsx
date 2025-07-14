'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useAddAppointmentTemplate, useUpdateAppointmentTemplate } from '@/hooks/useAppointmentTemplates';
import { useProcedures } from '@/hooks/useProcedures';
import { AppointmentTemplate, AppointmentTemplateFormData, appointmentTemplateSchema } from '@/types';

interface AppointmentTemplateFormDialogProps {
  open: boolean;
  onClose: () => void;
  template: AppointmentTemplate | null;
}

const AppointmentTemplateFormDialog: React.FC<AppointmentTemplateFormDialogProps> = ({ open, onClose, template }) => {
  const { data: procedures, isLoading: isLoadingProcedures } = useProcedures();
  const addMutation = useAddAppointmentTemplate();
  const updateMutation = useUpdateAppointmentTemplate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ // REMOVED generic type here to let zodResolver infer it
    resolver: zodResolver(appointmentTemplateSchema),
  });

  useEffect(() => {
    if (template) {
      reset({
        name: template.name,
        default_duration_min: template.default_duration_min,
        default_procedure_id: template.default_procedure_id,
        default_cost: template.default_cost,
      });
    } else {
      reset({
        name: '',
        default_duration_min: 30,
        default_procedure_id: null,
        default_cost: null,
      });
    }
  }, [template, reset]);

  const onSubmit = async (data: AppointmentTemplateFormData) => {
    try {
      if (template) {
        const updatedData = {
          ...template,
          ...data,
          default_procedure_id: data.default_procedure_id || null,
          default_cost: data.default_cost || null,
        };
        await updateMutation.mutateAsync(updatedData);
      } else {
        // @ts-expect-error - created_by will be handled by the database trigger/policy
        await addMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
      // Here you could show a snackbar with the error
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{template ? 'Edit Template' : 'Add New Template'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                autoFocus
                margin="dense"
                label="Template Name"
                type="text"
                fullWidth
                variant="outlined"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="Default Duration (min)"
                type="number"
                fullWidth
                variant="outlined"
                {...register('default_duration_min')}
                error={!!errors.default_duration_min}
                helperText={errors.default_duration_min?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                margin="dense"
                label="Default Cost"
                type="number"
                fullWidth
                variant="outlined"
                {...register('default_cost')}
                error={!!errors.default_cost}
                helperText={errors.default_cost?.message}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth margin="dense" disabled={isLoadingProcedures}>
                <InputLabel id="procedure-select-label">Default Procedure</InputLabel>
                <Select
                  labelId="procedure-select-label"
                  label="Default Procedure"
                  defaultValue={template?.default_procedure_id || ''}
                  {...register('default_procedure_id')}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {procedures?.map((proc) => (
                    <MenuItem key={proc.id} value={proc.id}>
                      {proc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentTemplateFormDialog;
