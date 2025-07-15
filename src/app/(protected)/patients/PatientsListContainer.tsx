'use client';

import React from 'react';
import { CircularProgress, Alert } from '@mui/material';
import { usePatients, SortOption, SortDirection } from '@/hooks/usePatients';
import PatientList from './PatientList';
import { Patient } from '@/types';

interface PatientsListContainerProps {
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  isDispensary: boolean | null;
  onEdit: (patient: Patient) => void;
  onDelete: (e: React.MouseEvent, patient: Patient) => void;
}

const PatientsListContainer: React.FC<PatientsListContainerProps> = ({
  searchQuery,
  sortBy,
  sortDirection,
  isDispensary,
  onEdit,
  onDelete,
}) => {
  const { data: patients, isLoading, isError, error } = usePatients({
    sortBy,
    sortDirection,
    isDispensary,
    searchQuery,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error fetching patients: {error.message}</Alert>;
  }

  return (
    <>
      {patients && <PatientList patients={patients} onEdit={onEdit} onDelete={onDelete} />}
    </>
  );
};

export default PatientsListContainer;
