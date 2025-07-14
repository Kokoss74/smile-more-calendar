'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { WaTemplate, WaTemplateFormData, waTemplateSchema } from '@/types';
import { useAddWaTemplate, useUpdateWaTemplate } from '@/hooks/useWaTemplates';

interface WaTemplateFormDialogProps {
  open: boolean;
  onClose: () => void;
  template?: WaTemplate;
}

const WaTemplateFormDialog: React.FC<WaTemplateFormDialogProps> = ({ open, onClose, template }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WaTemplateFormData>({
    resolver: zodResolver(waTemplateSchema),
    defaultValues: {
      code: template?.code || '',
      body_ru: template?.body_ru || '',
      body_il: template?.body_il || '',
    },
  });

  React.useEffect(() => {
    if (template) {
      reset({
        code: template.code,
        body_ru: template.body_ru,
        body_il: template.body_il,
      });
    } else {
      reset({
        code: '',
        body_ru: '',
        body_il: '',
      });
    }
  }, [template, reset]);

  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  const addMutation = useAddWaTemplate();
  const updateMutation = useUpdateWaTemplate();

  const onSubmit = (data: WaTemplateFormData) => {
    if (template) {
      updateMutation.mutate({ ...data, id: template.id }, {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Template updated successfully!', severity: 'success' });
          onClose();
        },
        onError: (error) => {
          setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
        },
      });
    } else {
      addMutation.mutate(data, {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Template added successfully!', severity: 'success' });
          onClose();
        },
        onError: (error) => {
          setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
        },
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{template ? 'Edit WA Template' : 'Add New WA Template'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Template Code"
                      fullWidth
                      margin="dense"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      disabled={!!template}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="body_ru"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Russian Template Body"
                      fullWidth
                      margin="dense"
                      multiline
                      rows={4}
                      error={!!errors.body_ru}
                      helperText={errors.body_ru?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="body_il"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Hebrew Template Body"
                      fullWidth
                      margin="dense"
                      multiline
                      rows={4}
                      error={!!errors.body_il}
                      helperText={errors.body_il?.message}
                      dir="rtl"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {template ? 'Save Changes' : 'Add Template'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {snackbar && (
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default WaTemplateFormDialog;
