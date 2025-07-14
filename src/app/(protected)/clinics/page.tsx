'use client';

import React from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useClinics } from '@/hooks/useClinics';

export default function ClinicsPage() {
  const { data: clinics, isLoading, isError, error } = useClinics();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Alert severity="error">Error fetching clinics: {error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Clinics Management
      </Typography>
      <List>
        {clinics?.map((clinic) => (
          <ListItem key={clinic.id}>
            <ListItemText primary={clinic.name} secondary={`Color: ${clinic.color_hex}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
