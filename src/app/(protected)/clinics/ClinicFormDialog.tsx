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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clinicSchema, ClinicFormData } from '@/types';

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
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: defaultValues || { name: '', color_hex: '#ffffff' },
  });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{defaultValues ? 'Edit Clinic' : 'Add New Clinic'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Clinic Name"
                  variant="outlined"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="color_hex"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Color"
                  variant="outlined"
                  type="color"
                  error={!!errors.color_hex}
                  helperText={errors.color_hex?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
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
