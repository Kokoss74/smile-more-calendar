import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Appointment, AppointmentFormData, AppointmentWithRelations } from '@/types';

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

const addAppointment = async (appointment: AppointmentFormData): Promise<Appointment> => {
  const { data, error } = await supabase.from('appointments').insert(appointment).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const useAddAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

const updateAppointment = async ({ id, ...appointment }: Partial<AppointmentFormData> & { id: number }): Promise<Appointment> => {
  const { data, error } = await supabase.from('appointments').update(appointment).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

const deleteAppointment = async (id: number): Promise<void> => {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
