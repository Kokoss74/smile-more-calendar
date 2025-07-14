import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { AppointmentWithRelations } from '@/types';

const supabase = createClient();

const fetchAppointments = async (): Promise<AppointmentWithRelations[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clinics ( color_hex ),
      procedures_catalog ( color_hex )
    `)
    .neq('status', 'canceled');

  if (error) {
    console.error('Error fetching appointments:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const useAppointments = () => {
  return useQuery<AppointmentWithRelations[], Error>({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });
};
