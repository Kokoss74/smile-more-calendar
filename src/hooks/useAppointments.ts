import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Appointment, AppointmentFormData, AppointmentWithRelations } from '@/types';
import { useSessionStore } from '@/store/sessionStore';

const supabase = createClient();

// Describes the flat structure returned by the get_calendar_appointments RPC call
interface RpcAppointment {
  id: string;
  clinic_id: string;
  start_ts: string;
  end_ts: string;
  patient_id: string | null;
  short_label: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'blocked';
  procedure_id: string | null;
  cost: number | null;
  tooth_num: string | null;
  description: string | null;
  send_notifications: boolean;
  created_by: string;
  owner_id: string | null;
  first_name: string | null;
  last_name: string | null;
  clinic_name: string | null;
  clinic_color: string | null;
  procedure_name: string | null;
  procedure_color: string | null;
}

export const useAppointments = (startDate: Date, endDate: Date) => {
  const { profile } = useSessionStore();

  return useQuery<AppointmentWithRelations[], Error>({
    queryKey: ['appointments', startDate, endDate, profile?.role],
    queryFn: async () => {
      if (!profile || !startDate || !endDate) return [];

      const { data, error } = await supabase.rpc('get_calendar_appointments', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      });

      if (error) {
        console.error('Error fetching appointments via RPC:', error);
        throw new Error(error.message);
      }

      // The RPC function returns a slightly different shape, so we map it to AppointmentWithRelations
      return data.map((apt: RpcAppointment) => ({
        ...apt,
        patient: apt.patient_id ? {
          id: apt.patient_id,
          first_name: apt.first_name,
          last_name: apt.last_name,
          owner_id: apt.owner_id,
        } : null,
        clinic: apt.clinic_id ? {
          id: apt.clinic_id,
          name: apt.clinic_name,
          color_hex: apt.clinic_color,
        } : null,
        procedure: apt.procedure_id ? {
          id: apt.procedure_id,
          name: apt.procedure_name,
          color_hex: apt.procedure_color,
        } : null,
      })) as AppointmentWithRelations[];
    },
    enabled: !!profile && !!startDate && !!endDate,
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

const updateAppointment = async ({ id, ...appointment }: Partial<AppointmentFormData> & { id: string }): Promise<Appointment> => {
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

const deleteAppointment = async (id: string): Promise<void> => {
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
