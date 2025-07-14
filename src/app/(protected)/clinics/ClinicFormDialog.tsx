'use client';

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clinicSchema, ClinicFormData } from '@/types';
import { COLOR_PALETTE } from '@/config/constants';

interface ClinicFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClinicFormData) => void;
  defaultValues?: ClinicFormData;
}

export default function ClinicFormDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: ClinicFormDialogProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: defaultValues || { name: '', color_hex: COLOR_PALETTE[0] },
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues || { name: '', color_hex: COLOR_PALETTE[0] });
    }
  }, [defaultValues, open, reset]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{defaultValues ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Clinic Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="color_hex"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Color</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {COLOR_PALETTE.map((color) => (
                      <Box
                        key={color}
                        onClick={() => setValue('color_hex', color, { shouldValidate: true })}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: color,
                          borderRadius: '50%',
                          cursor: 'pointer',
                          border: field.value === color ? '3px solid #1976d2' : '1px solid #ddd',
                          transition: 'border-color 0.2s',
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
