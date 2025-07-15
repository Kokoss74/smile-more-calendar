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
  ListItemButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useClinics, useAddClinic, useUpdateClinic, useDeleteClinic } from '@/hooks/useClinics';
import ClinicFormDialog from './ClinicFormDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Clinic, ClinicFormData } from '@/types';

export default function ClinicsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: clinics, isLoading, isError, error } = useClinics();
  const addClinicMutation = useAddClinic();
  const updateClinicMutation = useUpdateClinic();
  const deleteClinicMutation = useDeleteClinic();

  const handleOpenForm = (clinic: Clinic | null) => {
    setEditingClinic(clinic);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingClinic(null);
    setFormOpen(false);
  };

  const handleSaveClinic = (data: ClinicFormData) => {
    const mutation = editingClinic
      ? updateClinicMutation.mutateAsync({ ...data, id: editingClinic.id })
      : addClinicMutation.mutateAsync(data);

    mutation
      .then(() => {
        handleCloseForm();
        setSnackbar({ open: true, message: `Clinic ${editingClinic ? 'updated' : 'added'} successfully!`, severity: 'success' });
      })
      .catch((error) => {
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      });
  };

  const openDeleteConfirm = (e: React.MouseEvent, clinic: Clinic) => {
    e.stopPropagation(); // Prevent ListItem click event
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
        <Button variant="contained" onClick={() => handleOpenForm(null)}>
          Add Clinic
        </Button>
      </Box>
      <List>
        {clinics?.map((clinic) => (
          <ListItem
            key={clinic.id}
            disablePadding
            sx={{ border: '1px solid #ddd', mb: 1, borderRadius: '4px' }}
            secondaryAction={
              clinic.name !== 'Smile More Clinic' && (
                <IconButton edge="end" aria-label="delete" onClick={(e) => openDeleteConfirm(e, clinic)}>
                  <DeleteIcon />
                </IconButton>
              )
            }
          >
            <ListItemButton onClick={() => handleOpenForm(clinic)}>
              <ListItemText 
                primary={clinic.name} 
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    Color: 
                    <Box component="span" sx={{ width: 16, height: 16, backgroundColor: clinic.color_hex, ml: 1, border: '1px solid #ccc' }} />
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <ClinicFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveClinic}
        defaultValues={editingClinic ? { name: editingClinic.name, color_hex: editingClinic.color_hex } : undefined}
      />
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteClinic}
        title="Confirm Deletion"
        description={`Are you sure want to delete the clinic "${clinicToDelete?.name}"? This action cannot be undone.`}
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
