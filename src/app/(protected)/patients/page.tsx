'use client';

import React, { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Snackbar,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  ButtonGroup,
} from '@mui/material';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PatientsListContainer from './PatientsListContainer';
import {
  useAddPatient,
  useUpdatePatient,
  useDeletePatient,
  SortOption,
  SortDirection,
} from '@/hooks/usePatients';
import PatientFormDialog from './PatientFormDialog';
import { Patient, PatientFormData } from '@/types';

export default function PatientsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isDispensary, setIsDispensary] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          label="Search by Name or Phone"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <ButtonGroup variant="outlined" size="small" aria-label="sort-by-buttons">
          <Button
            onClick={() => handleSortChange('last_name')}
            variant={sortBy === 'last_name' ? 'contained' : 'outlined'}
          >
            Last Name {sortBy === 'last_name' && (sortDirection === 'asc' ? '▲' : '▼')}
          </Button>
          <Button
            onClick={() => handleSortChange('first_name')}
            variant={sortBy === 'first_name' ? 'contained' : 'outlined'}
          >
            First Name {sortBy === 'first_name' && (sortDirection === 'asc' ? '▲' : '▼')}
          </Button>
           <Button
            onClick={() => handleSortChange('created_at')}
            variant={sortBy === 'created_at' ? 'contained' : 'outlined'}
          >
            Date {sortBy === 'created_at' && (sortDirection === 'asc' ? '▲' : '▼')}
          </Button>
        </ButtonGroup>
        <FormControlLabel
          control={<Switch checked={isDispensary === true} onChange={handleDispensaryToggle} />}
          label="Dispensary Only"
          sx={{ mr: 0 }}
        />
      </Box>

      <PatientsListContainer
        searchQuery={searchQuery}
        sortBy={sortBy}
        sortDirection={sortDirection}
        isDispensary={isDispensary}
        onEdit={handleOpenForm}
        onDelete={openDeleteConfirm}
      />

      <PatientFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSavePatient}
        defaultValues={editingPatient ? {
          ...editingPatient,
          notes: editingPatient.notes ?? null,
        } : undefined}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeletePatient}
        title="Confirm Deletion"
        description={`Are you sure want to delete the patient "${patientToDelete?.first_name} ${patientToDelete?.last_name}"? This action cannot be undone.`}
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
