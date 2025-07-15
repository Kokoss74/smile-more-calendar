'use client';

import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { Patient } from '@/types';

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (e: React.MouseEvent, patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onEdit, onDelete }) => {
  return (
    <List>
      {patients.map((patient) => (
        <ListItem
          key={patient.id}
          disablePadding
          sx={{ border: '1px solid #ddd', mb: 1, borderRadius: '4px' }}
          secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={(e) => onDelete(e, patient)}>
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton onClick={() => onEdit(patient)}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {patient.is_dispensary && (
                    <Tooltip title="Dispensary Group">
                      <StarIcon sx={{ color: 'gold' }} />
                    </Tooltip>
                  )}
                  <Typography component="span" variant="body1">
                    {`${patient.last_name} ${patient.first_name}`}
                  </Typography>
                  <Tooltip title={`Notification language: ${patient.notification_language_is_hebrew ? 'Hebrew' : 'Russian'}`}>
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        border: '1px solid',
                        borderColor: 'grey.400',
                        borderRadius: '4px',
                        px: 0.5,
                        ml: 'auto',
                      }}
                    >
                      {patient.notification_language_is_hebrew ? 'HE' : 'RU'}
                    </Typography>
                  </Tooltip>
                </Box>
              }
              secondary={`${patient.patient_type} | ${patient.phone} | Added: ${new Date(patient.created_at).toLocaleDateString('en-GB')}`}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default PatientList;
