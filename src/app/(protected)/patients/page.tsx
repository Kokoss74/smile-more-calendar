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
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import {
  usePatients,
  useAddPatient,
  useUpdatePatient,
  useDeletePatient,
  SortOption,
} from '@/hooks/usePatients';
import PatientFormDialog from './PatientFormDialog';
import { Patient, PatientFormData } from '@/types';

export default function PatientsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [isDispensary, setIsDispensary] = useState<boolean | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: patients, isLoading, isError, error } = usePatients({ sortBy, isDispensary });
  const addPatientMutation = useAddPatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();

  const handleOpenForm = (patient: Patient | null) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingPatient(null);
    setFormOpen(false);
  };

  const handleSavePatient = (data: PatientFormData) => {
    const mutation = editingPatient
      ? updatePatientMutation.mutateAsync({ ...data, id: editingPatient.id })
      : addPatientMutation.mutateAsync(data);

    mutation
      .then(() => {
        handleCloseForm();
        setSnackbar({ open: true, message: `Patient ${editingPatient ? 'updated' : 'added'} successfully!`, severity: 'success' });
      })
      .catch((err) => {
        setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
      });
  };

  const openDeleteConfirm = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setPatientToDelete(patient);
    setConfirmOpen(true);
  };

  const handleDeletePatient = () => {
    if (patientToDelete) {
      deletePatientMutation.mutate(patientToDelete.id, {
        onSuccess: () => {
          setConfirmOpen(false);
          setPatientToDelete(null);
          setSnackbar({ open: true, message: 'Patient deleted successfully!', severity: 'success' });
        },
        onError: (err) => {
          setConfirmOpen(false);
          setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        },
      });
    }
  };

  const handleDispensaryToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsDispensary(event.target.checked ? true : null);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error fetching patients: {error.message}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: { xs: 2, md: 0 } }}>
          Patients Management
        </Typography>
        <Button variant="contained" onClick={() => handleOpenForm(null)}>
          Add Patient
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <FormControl fullWidth>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <MenuItem value="created_at">Creation Date</MenuItem>
              <MenuItem value="last_name">Last Name</MenuItem>
              <MenuItem value="first_name">First Name</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <FormControlLabel
            control={<Switch checked={isDispensary === true} onChange={handleDispensaryToggle} />}
            label="Show only Dispensary Group"
          />
        </Grid>
      </Grid>

      <List>
        {patients?.map((patient) => (
          <ListItem
            key={patient.id}
            disablePadding
            sx={{ border: '1px solid #ddd', mb: 1, borderRadius: '4px' }}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={(e) => openDeleteConfirm(e, patient)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => handleOpenForm(patient)}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {patient.is_dispensary && (
                      <Tooltip title="Dispensary Group">
                        <StarIcon sx={{ color: 'gold', mr: 1 }} />
                      </Tooltip>
                    )}
                    {`${patient.last_name} ${patient.first_name}`}
                  </Box>
                }
                secondary={`Phone: ${patient.phone} | Age: ${patient.age ?? 'N/A'} | Added: ${new Date(patient.created_at).toLocaleDateString('en-GB')}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <PatientFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSavePatient}
        defaultValues={editingPatient ? {
          first_name: editingPatient.first_name,
          last_name: editingPatient.last_name,
          phone: editingPatient.phone,
          age: editingPatient.age,
          notes: editingPatient.notes,
          is_dispensary: editingPatient.is_dispensary,
        } : undefined}
      />

      <Dialog
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure want to delete the patient &quot;{patientToDelete?.first_name} {patientToDelete?.last_name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeletePatient} color="error" autoFocus>
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
