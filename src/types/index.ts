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
  default_duration_min?: number | null;
  default_cost?: number | null;
}

export const procedureSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  color_hex: z.string().regex(/^#[0-9A-F]{6}$/i, { message: "Invalid hex color." }),
  default_duration_min: z.coerce.number().int().positive({ message: "Duration must be a positive number." }).optional().nullable(),
  default_cost: z.coerce.number().positive({ message: "Cost must be a positive number." }).optional().nullable(),
});

export type ProcedureFormData = z.infer<typeof procedureSchema>;

export const PATIENT_TYPES = ['Взрослый', 'Ребёнок', 'Израильтянин', 'Близкий'] as const;

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  patient_type: (typeof PATIENT_TYPES)[number] | null;
  notes: string | null;
  medical_info: Record<string, unknown> | null;
  is_dispensary: boolean;
  owner_id: string | null; // admin user_id
  created_at: string;
  notification_language_is_hebrew: boolean;
}

export const patientSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  phone: z.string().min(9, { message: "Phone number must be at least 9 digits." }),
  patient_type: z.enum(PATIENT_TYPES).optional().nullable(),
  notes: z.string().optional().nullable(),
  medical_info: z.record(z.string(), z.unknown()).optional().nullable(),
  is_dispensary: z.boolean().default(false),
  notification_language_is_hebrew: z.boolean().default(false),
  owner_id: z.uuid().nullable().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export interface WaTemplate {
  id: string;
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
  id: string;
  clinic_id: string;
  start_ts: string;
  end_ts: string;
  patient_id?: string;
  short_label: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'blocked';
  procedure_id?: string;
  cost?: number;
  tooth_num?: string;
  description?: string;
  send_notifications: boolean;
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

export const appointmentSchema = z.object({
  clinic_id: z.string().uuid({ message: "Clinic is required." }),
  start_ts: z.string().datetime({ message: "Invalid start time." }),
  end_ts: z.string().datetime({ message: "Invalid end time." }),
  patient_id: z.uuid({ message: "Patient is required." }).optional().nullable(),
  procedure_id: z.uuid({ message: "Procedure is required." }).optional().nullable(),
  short_label: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'canceled', 'blocked']),
  cost: z.coerce.number().positive({ message: "Cost must be a positive number." }).optional().nullable(),
  tooth_num: z.string().max(10, "Tooth number is too long.").optional().nullable(),
  description: z.string().optional().nullable(),
  send_notifications: z.boolean().default(true),
})
.refine(data => new Date(data.start_ts) < new Date(data.end_ts), {
  message: "End time must be after start time.",
  path: ["end_ts"],
})
.refine(data => {
  if (data.status !== 'blocked') {
    return !!data.patient_id;
  }
  return true;
}, {
  message: "Patient is required.",
  path: ["patient_id"],
})
.refine(data => {
  if (data.status !== 'blocked') {
    return !!data.procedure_id;
  }
  return true;
}, {
  message: "Procedure is required.",
  path: ["procedure_id"],
})
.refine(data => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(data.start_ts) >= now;
}, {
  message: "Cannot book appointments in the past.",
  path: ["start_ts"],
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
