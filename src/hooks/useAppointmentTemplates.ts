import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { AppointmentTemplate } from '@/types';

const supabase = createClient();

// Fetch all appointment templates
const fetchAppointmentTemplates = async (): Promise<AppointmentTemplate[]> => {
  const { data, error } = await supabase
    .from('appointment_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useAppointmentTemplates = () => {
  return useQuery<AppointmentTemplate[], Error>({
    queryKey: ['appointment_templates'],
    queryFn: fetchAppointmentTemplates,
  });
};

// Add a new appointment template
const addAppointmentTemplate = async (newTemplate: Omit<AppointmentTemplate, 'id' | 'created_by'>) => {
  // TODO: created_by should be dynamically set to the current user's ID
  const { data, error } = await supabase
    .from('appointment_templates')
    .insert([newTemplate])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useAddAppointmentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAppointmentTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment_templates'] });
    },
  });
};

// Update an existing appointment template
const updateAppointmentTemplate = async (updatedTemplate: AppointmentTemplate) => {
  const { data, error } = await supabase
    .from('appointment_templates')
    .update(updatedTemplate)
    .eq('id', updatedTemplate.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useUpdateAppointmentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAppointmentTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment_templates'] });
    },
  });
};

// Delete an appointment template
const deleteAppointmentTemplate = async (id: string) => {
  const { error } = await supabase
    .from('appointment_templates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeleteAppointmentTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAppointmentTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment_templates'] });
    },
  });
};
