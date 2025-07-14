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
