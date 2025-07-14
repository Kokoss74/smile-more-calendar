import { z } from 'zod';

export interface Clinic {
  id: string;
  name: string;
  color_hex: string;
  created_at: string;
}

export const clinicSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  color_hex: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Invalid hex color." }),
});

export type ClinicFormData = z.infer<typeof clinicSchema>;

export interface Procedure {
  id: string;
  name: string;
  color_hex: string;
  created_at: string;
  created_by: string; // user_id
}

export const procedureSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  color_hex: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Invalid hex color." }),
});

export type ProcedureFormData = z.infer<typeof procedureSchema>;

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  age: number | null;
  notes: string | null;
  medical_info: Record<string, unknown> | null;
  is_dispensary: boolean;
  owner_id: string | null; // admin user_id
  created_at: string;
}

export const patientSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  phone: z.string().min(9, { message: "Phone number must be at least 9 digits." }),
  age: z.coerce.number().int().positive().min(5, { message: "Age must be at least 5." }).max(120, { message: "Age must be at most 120." }).optional().nullable(),
  notes: z.string().optional().nullable(),
  medical_info: z.record(z.string(), z.unknown()).optional().nullable(),
  is_dispensary: z.boolean().default(false),
});

export type PatientFormData = z.infer<typeof patientSchema>;
