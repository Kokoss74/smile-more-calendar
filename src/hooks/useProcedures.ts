'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Procedure, ProcedureFormData } from '@/types';

const supabase = createClient();

// Fetch procedures
const fetchProcedures = async (): Promise<Procedure[]> => {
  const { data, error } = await supabase
    .from('procedures_catalog')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useProcedures = () => {
  return useQuery<Procedure[], Error>({
    queryKey: ['procedures'],
    queryFn: fetchProcedures,
  });
};

// Add a new procedure
const addProcedure = async (procedureData: ProcedureFormData): Promise<Procedure> => {
  const { data, error } = await supabase
    .from('procedures_catalog')
    .insert([procedureData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useAddProcedure = () => {
  const queryClient = useQueryClient();
  return useMutation<Procedure, Error, ProcedureFormData>({
    mutationFn: addProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
    },
  });
};

// Update a procedure
const updateProcedure = async ({ id, ...procedureData }: { id: string } & ProcedureFormData): Promise<Procedure> => {
  const { data, error } = await supabase
    .from('procedures_catalog')
    .update(procedureData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useUpdateProcedure = () => {
  const queryClient = useQueryClient();
  return useMutation<Procedure, Error, { id: string } & ProcedureFormData>({
    mutationFn: updateProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
    },
  });
};

// Delete a procedure
const deleteProcedure = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('procedures_catalog')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const useDeleteProcedure = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteProcedure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
    },
  });
};
