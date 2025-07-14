import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { WaTemplate, WaTemplateFormData } from '@/types';

const supabase = createClient();

const fetchWaTemplates = async (): Promise<WaTemplate[]> => {
  const { data, error } = await supabase
    .from('wa_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useWaTemplates = () => {
  return useQuery<WaTemplate[], Error>({
    queryKey: ['wa_templates'],
    queryFn: fetchWaTemplates,
  });
};

const addWaTemplate = async (template: WaTemplateFormData): Promise<WaTemplate> => {
  const { data, error } = await supabase
    .from('wa_templates')
    .insert([template])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useAddWaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<WaTemplate, Error, WaTemplateFormData>({
    mutationFn: addWaTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa_templates'] });
    },
  });
};

const updateWaTemplate = async ({ id, ...template }: WaTemplateFormData & { id: string }): Promise<WaTemplate> => {
  const { data, error } = await supabase
    .from('wa_templates')
    .update(template)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useUpdateWaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<WaTemplate, Error, WaTemplateFormData & { id: string }>({
    mutationFn: updateWaTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa_templates'] });
    },
  });
};

const deleteWaTemplate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('wa_templates')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeleteWaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteWaTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa_templates'] });
    },
  });
};
