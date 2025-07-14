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
