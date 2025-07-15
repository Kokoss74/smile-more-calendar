import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { AppointmentWithRelations } from '@/types';

const supabase = createClient();

// Расширим тип, чтобы включить все необходимые поля для истории
export type AppointmentHistoryEntry = Pick<
  AppointmentWithRelations,
  'id' | 'start_ts' | 'status' | 'tooth_num' | 'cost' | 'description'
> & {
  procedures_catalog: {
    name: string;
  } | null;
};

const fetchPatientAppointments = async (patientId: string): Promise<AppointmentHistoryEntry[]> => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_ts,
      status,
      tooth_num,
      cost,
      description,
      procedures_catalog ( name )
    `)
    .eq('patient_id', patientId)
    .order('start_ts', { ascending: false });

  if (error) {
    console.error('Error fetching patient appointments:', error);
    throw new Error(error.message);
  }

  // Вручную приводим тип, так как Supabase возвращает массив для связи
  // и нам нужно взять первый элемент или null.
  const typedData = (data || []).map(item => ({
    ...item,
    procedures_catalog: Array.isArray(item.procedures_catalog) ? item.procedures_catalog[0] ?? null : item.procedures_catalog,
  }));

  return typedData;
};

export const usePatientAppointments = (patientId?: string) => {
  return useQuery<AppointmentHistoryEntry[], Error>({
    queryKey: ['appointments', 'history', patientId],
    queryFn: () => fetchPatientAppointments(patientId!),
    enabled: !!patientId, // Запрос будет выполняться только если patientId предоставлен
  });
};
