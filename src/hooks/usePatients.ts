'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Patient, PatientFormData } from '@/types';

const supabase = createClient();

export type SortOption = 'created_at' | 'first_name' | 'last_name';

interface FetchPatientsParams {
  sortBy: SortOption;
  isDispensary: boolean | null;
}

// Fetch patients with sorting and filtering
const fetchPatients = async ({ sortBy, isDispensary }: FetchPatientsParams): Promise<Patient[]> => {
  let query = supabase
    .from('patients')
    .select('*');

  if (isDispensary !== null) {
    query = query.eq('is_dispensary', isDispensary);
  }

  query = query.order(sortBy, { ascending: sortBy !== 'created_at' });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const usePatients = (params: FetchPatientsParams) => {
  return useQuery<Patient[], Error>({
    queryKey: ['patients', params],
    queryFn: () => fetchPatients(params),
  });
};

// Add a new patient
const addPatient = async (patientData: PatientFormData): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useAddPatient = () => {
  const queryClient = useQueryClient();
  return useMutation<Patient, Error, PatientFormData>({
    mutationFn: addPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

// Update a patient
const updatePatient = async ({ id, ...patientData }: { id: string } & PatientFormData): Promise<Patient> => {
  const { data, error } = await supabase
    .from('patients')
    .update(patientData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation<Patient, Error, { id: string } & PatientFormData>({
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

// Delete a patient
const deletePatient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeletePatient = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};
