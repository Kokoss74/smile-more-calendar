import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Clinic, ClinicFormData } from '@/types';

const supabase = createClient();

const fetchClinics = async (): Promise<Clinic[]> => {
  const { data, error } = await supabase.from('clinics').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const useClinics = () => {
  return useQuery({
    queryKey: ['clinics'],
    queryFn: fetchClinics,
  });
};

const addClinic = async (clinic: ClinicFormData) => {
  const { data, error } = await supabase.from('clinics').insert(clinic).select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const useAddClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
};

const deleteClinic = async (id: string) => {
  const { error } = await supabase.from('clinics').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeleteClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
};
