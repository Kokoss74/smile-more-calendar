import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Clinic } from '@/types';

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
