'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProcedureFormData, procedureSchema } from '@/types';
import { COLOR_PALETTE } from '@/config/constants';

interface ProcedureFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProcedureFormData) => void;
  defaultValues?: ProcedureFormData;
}

export default function ProcedureFormDialog({ open, onClose, onSubmit, defaultValues }: ProcedureFormDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(procedureSchema),
    defaultValues: defaultValues || { 
      name: '', 
      color_hex: COLOR_PALETTE[0],
      default_duration_min: null,
      default_cost: null,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues || { 
        name: '', 
        color_hex: COLOR_PALETTE[0],
        default_duration_min: null,
        default_cost: null,
      });
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: ProcedureFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{defaultValues ? 'Edit Procedure' : 'Add New Procedure'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    autoFocus
                    label="Procedure Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="default_duration_min"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Default Duration (min)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.default_duration_min}
                    helperText={errors.default_duration_min?.message}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    value={field.value ?? ''}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="default_cost"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Default Cost"
                    type="number"
                    fullWidth
                    variant="outlined"
                    error={!!errors.default_cost}
                    helperText={errors.default_cost?.message}
                    onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                    value={field.value ?? ''}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="color_hex"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Color</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {COLOR_PALETTE.map((color) => (
                      <IconButton
                        key={color}
                        onClick={() => setValue('color_hex', color, { shouldValidate: true })}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: color,
                          border: field.value === color ? '3px solid #3f51b5' : '1px solid #ddd',
                          '&:hover': {
                            backgroundColor: color,
                            opacity: 0.9,
                          },
                        }}
                      />
                    ))}
                  </Box>
                  {errors.color_hex && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                      {errors.color_hex.message}
                    </Typography>
                  )}
                </Box>
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
