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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useClinics, useAddClinic, useDeleteClinic } from '@/hooks/useClinics';
import ClinicFormDialog from './ClinicFormDialog';
import { Clinic, ClinicFormData } from '@/types';

export default function ClinicsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: clinics, isLoading, isError, error } = useClinics();
  const addClinicMutation = useAddClinic();
  const deleteClinicMutation = useDeleteClinic();

  const handleAddClinic = (data: ClinicFormData) => {
    addClinicMutation.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
        setSnackbar({ open: true, message: 'Clinic added successfully!', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      },
    });
  };

  const openDeleteConfirm = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setConfirmOpen(true);
  };

  const handleDeleteClinic = () => {
    if (clinicToDelete) {
      deleteClinicMutation.mutate(clinicToDelete.id, {
        onSuccess: () => {
          setConfirmOpen(false);
          setClinicToDelete(null);
          setSnackbar({ open: true, message: 'Clinic deleted successfully!', severity: 'success' });
        },
        onError: (error) => {
          setConfirmOpen(false);
          setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
        },
      });
    }
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
        <Button variant="contained" onClick={() => setFormOpen(true)}>
          Add Clinic
        </Button>
      </Box>
      <List>
        {clinics?.map((clinic) => (
          <ListItem 
            key={clinic.id} 
            sx={{ border: '1px solid #ddd', mb: 1, borderRadius: '4px' }}
            secondaryAction={
              clinic.name !== 'Smile More Clinic' && (
                <IconButton edge="end" aria-label="delete" onClick={() => openDeleteConfirm(clinic)}>
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
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
        open={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddClinic}
      />
      <Dialog
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure want to delete the clinic &quot;{clinicToDelete?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteClinic} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
