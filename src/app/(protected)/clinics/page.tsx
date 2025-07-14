'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  Snackbar,
} from '@mui/material';
import { useClinics, useAddClinic } from '@/hooks/useClinics';
import ClinicFormDialog from './ClinicFormDialog';
import { ClinicFormData } from '@/types';

export default function ClinicsPage() {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: clinics, isLoading, isError, error } = useClinics();
  const addClinicMutation = useAddClinic();

  const handleAddClinic = (data: ClinicFormData) => {
    addClinicMutation.mutate(data, {
      onSuccess: () => {
        setDialogOpen(false);
        setSnackbar({ open: true, message: 'Clinic added successfully!', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      },
    });
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error fetching clinics: {error.message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Clinics Management
        </Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add Clinic
        </Button>
      </Box>
      <List>
        {clinics?.map((clinic) => (
          <ListItem key={clinic.id} sx={{ border: '1px solid #ddd', mb: 1, borderRadius: '4px' }}>
            <ListItemText 
              primary={clinic.name} 
              secondary={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  Color: 
                  <Box component="span" sx={{ width: 16, height: 16, backgroundColor: clinic.color_hex, ml: 1, border: '1px solid #ccc' }} />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      <ClinicFormDialog
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddClinic}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
