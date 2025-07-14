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

export interface AppointmentTemplate {
  id: string;
  name: string;
  default_duration_min: number;
  default_procedure_id: string | null;
  default_cost: number | null;
  created_by: string; // user_id
}

export const appointmentTemplateSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  default_duration_min: z.coerce.number().int().positive({ message: "Duration must be a positive number." }),
  default_procedure_id: z.string().uuid().optional().nullable(),
  default_cost: z.coerce.number().positive({ message: "Cost must be a positive number." }).optional().nullable(),
});

export type AppointmentTemplateFormData = z.infer<typeof appointmentTemplateSchema>;

export interface WaTemplate {
  id: number;
  code: string;
  body_ru: string;
  body_il: string;
  created_at: string;
}

export const waTemplateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  body_ru: z.string().min(1, "Russian body is required"),
  body_il: z.string().min(1, "Hebrew body is required"),
});

export type WaTemplateFormData = z.infer<typeof waTemplateSchema>;

export interface Appointment {
  id: number;
  clinic_id: number;
  start_ts: string;
  end_ts: string;
  patient_id?: number;
  short_label: string;
  status: 'scheduled' | 'completed' | 'canceled';
  procedure_id?: number;
  cost?: number;
  tooth_num?: string;
  description?: string;
  private: boolean;
  created_by: string;
  updated_by: string;
  canceled_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithRelations extends Appointment {
  clinics: { color_hex: string } | null;
  procedures_catalog: { color_hex: string } | null;
}
