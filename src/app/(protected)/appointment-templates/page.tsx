'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAppointmentTemplates, useDeleteAppointmentTemplate } from '@/hooks/useAppointmentTemplates';
import { AppointmentTemplate } from '@/types';
import AppointmentTemplateFormDialog from './AppointmentTemplateFormDialog';

const AppointmentTemplatesPage = () => {
  const { data: templates, isLoading, error } = useAppointmentTemplates();
  const deleteTemplateMutation = useDeleteAppointmentTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppointmentTemplate | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<AppointmentTemplate | null>(null);

  const handleOpenDialog = (template: AppointmentTemplate | null = null) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTemplate(null);
    setDialogOpen(false);
  };

  const openDeleteConfirm = (template: AppointmentTemplate) => {
    setTemplateToDelete(template);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    if (templateToDelete) {
      deleteTemplateMutation.mutate(templateToDelete.id, {
        onSuccess: () => {
          setConfirmOpen(false);
          setTemplateToDelete(null);
          // Optionally, add a snackbar here for feedback
        },
        onError: (error) => {
          setConfirmOpen(false);
          // Optionally, add a snackbar here for feedback
          console.error("Failed to delete template:", error);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading appointment templates: {error.message}</Alert>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Appointment Templates
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Template
        </Button>
      </Box>

      <List>
        {templates?.map((template) => (
          <React.Fragment key={template.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(template)}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => openDeleteConfirm(template)} sx={{ ml: 1 }}>
                    <Delete />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={template.name}
                secondary={`Duration: ${template.default_duration_min} min | Cost: ${template.default_cost || 'N/A'}`}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <AppointmentTemplateFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        template={selectedTemplate}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure want to delete the template &quot;{templateToDelete?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentTemplatesPage;
