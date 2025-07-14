'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useWaTemplates, useDeleteWaTemplate } from '@/hooks/useWaTemplates';
import { WaTemplate } from '@/types';
import WaTemplateFormDialog from './WaTemplateFormDialog';

const WaTemplatesPage = () => {
  const { data: templates, isLoading, error } = useWaTemplates();
  const deleteMutation = useDeleteWaTemplate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WaTemplate | undefined>(undefined);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WaTemplate | null>(null);

  const handleOpenDialog = (template?: WaTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedTemplate(undefined);
    setDialogOpen(false);
  };

  const handleOpenConfirmDelete = (template: WaTemplate) => {
    setTemplateToDelete(template);
    setConfirmDeleteOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setTemplateToDelete(null);
    setConfirmDeleteOpen(false);
  };

  const handleDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id, {
        onSuccess: () => {
          handleCloseConfirmDelete();
        },
      });
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error loading templates: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">
          WhatsApp Templates
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add New Template
        </Button>
      </Box>

      <Paper elevation={3}>
        <List>
          {templates?.map((template) => (
            <ListItem
              key={template.id}
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(template)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirmDelete(template)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={template.code}
                secondary={`RU: ${template.body_ru.substring(0, 50)}... | IL: ${template.body_il.substring(0, 50)}...`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <WaTemplateFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        template={selectedTemplate}
      />

      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCloseConfirmDelete}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the template &quot;{templateToDelete?.code}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDelete}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WaTemplatesPage;
