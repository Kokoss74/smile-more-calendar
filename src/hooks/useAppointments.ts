import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Appointment, AppointmentFormData, AppointmentWithRelations, Patient } from '@/types';
import { useSessionStore } from '@/store/sessionStore';

const supabase = createClient();

interface AppointmentWithPatient extends AppointmentWithRelations {
  patients: Pick<Patient, 'owner_id'> | null;
}

const fetchAppointments = async (role: string | undefined, clinicId: string | null | undefined): Promise<AppointmentWithRelations[]> => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      clinics ( color_hex ),
      procedures_catalog ( color_hex ),
      patients ( owner_id )
    `)
    .neq('status', 'canceled');

  if (role === 'clinic_staff' && clinicId) {
    query = query.eq('clinic_id', clinicId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching appointments:', error);
    throw new Error(error.message);
  }

  if (role === 'clinic_staff') {
    return (data as AppointmentWithPatient[]).map(apt => {
      // If patient is private (has an owner_id), anonymize the appointment
      if (apt.patients?.owner_id) {
        return {
          ...apt,
          short_label: 'Время занято',
          patient_id: undefined,
          procedure_id: undefined,
          cost: undefined,
          tooth_num: undefined,
          description: undefined,
          send_notifications: false,
        };
      }
      return apt;
    });
  }

  return data || [];
};

export const useAppointments = () => {
  const { profile } = useSessionStore();
  const role = profile?.role;
  const clinicId = profile?.clinic_id;

  return useQuery<AppointmentWithRelations[], Error>({
    queryKey: ['appointments', role, clinicId],
    queryFn: () => fetchAppointments(role, clinicId),
    enabled: !!role, // Only fetch if the user profile is loaded
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
