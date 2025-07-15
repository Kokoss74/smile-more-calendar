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
  ListItemButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useProcedures, useAddProcedure, useUpdateProcedure, useDeleteProcedure } from '@/hooks/useProcedures';
import ProcedureFormDialog from './ProcedureFormDialog';
import { Procedure, ProcedureFormData } from '@/types';

export default function ProceduresPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [procedureToDelete, setProcedureToDelete] = useState<Procedure | null>(null);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: procedures, isLoading, isError, error } = useProcedures();
  const addProcedureMutation = useAddProcedure();
  const updateProcedureMutation = useUpdateProcedure();
  const deleteProcedureMutation = useDeleteProcedure();

  const handleOpenForm = (procedure: Procedure | null) => {
    setEditingProcedure(procedure);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProcedure(null);
    setFormOpen(false);
  };

  const handleSaveProcedure = (data: ProcedureFormData) => {
    const mutation = editingProcedure
      ? updateProcedureMutation.mutateAsync({ ...data, id: editingProcedure.id })
      : addProcedureMutation.mutateAsync(data);

    mutation
      .then(() => {
        handleCloseForm();
        setSnackbar({ open: true, message: `Procedure ${editingProcedure ? 'updated' : 'added'} successfully!`, severity: 'success' });
      })
      .catch((error) => {
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      });
  };

  const openDeleteConfirm = (e: React.MouseEvent, procedure: Procedure) => {
    e.stopPropagation();
    setProcedureToDelete(procedure);
    setConfirmOpen(true);
  };

  const handleDeleteProcedure = () => {
    if (procedureToDelete) {
      deleteProcedureMutation.mutate(procedureToDelete.id, {
        onSuccess: () => {
          setConfirmOpen(false);
          setProcedureToDelete(null);
          setSnackbar({ open: true, message: 'Procedure deleted successfully!', severity: 'success' });
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
    return <Alert severity="error">Error fetching procedures: {error.message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Procedures Catalog
        </Typography>
        <Button variant="contained" onClick={() => handleOpenForm(null)}>
          Add Procedure
        </Button>
      </Box>
      <List>
        {procedures?.map((procedure) => (
          <ListItem
            key={procedure.id}
            disablePadding
            sx={{ border: '1px solid #ddd', mb: 1, borderRadius: '4px' }}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={(e) => openDeleteConfirm(e, procedure)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => handleOpenForm(procedure)}>
              <ListItemText 
                primary={procedure.name} 
                secondary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    Color: 
                    <Box component="span" sx={{ width: 16, height: 16, backgroundColor: procedure.color_hex, ml: 1, border: '1px solid #ccc' }} />
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <ProcedureFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSaveProcedure}
        defaultValues={editingProcedure ? { 
          name: editingProcedure.name, 
          color_hex: editingProcedure.color_hex,
          default_duration_min: editingProcedure.default_duration_min,
          default_cost: editingProcedure.default_cost,
        } : undefined}
      />
      <Dialog
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure want to delete the procedure &quot;{procedureToDelete?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProcedure} color="error" autoFocus>
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
