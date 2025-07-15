-- Phase 3.2: Architectural Refactoring

-- 1. Drop the appointment_templates table as it's no longer needed.
-- Its functionality will be merged into procedures_catalog.
DROP TABLE IF EXISTS public.appointment_templates;

-- 2. Add default duration and cost to the procedures_catalog table.
-- This simplifies appointment creation by providing defaults directly from the procedure.
ALTER TABLE public.procedures_catalog
ADD COLUMN IF NOT EXISTS default_duration_min integer,
ADD COLUMN IF NOT EXISTS default_cost numeric(10,2);

-- 3. Modify the patients table:
-- 3.1. Rename 'age' to 'patient_type' to better reflect the new classification.
ALTER TABLE public.patients
RENAME COLUMN IF EXISTS age TO patient_type;

-- 3.2. Ensure the new column has the correct type.
ALTER TABLE public.patients
ALTER COLUMN patient_type TYPE text;

-- 3.3. Add a flag for notification language preference.
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS notification_language_is_hebrew boolean DEFAULT false;

-- 4. Rename 'private' to 'send_notifications' in the appointments table for clarity.
ALTER TABLE public.appointments
RENAME COLUMN IF EXISTS private TO send_notifications;

-- 5. Update the RLS policy for clinic_staff to reflect the column rename from 'private' to 'send_notifications'.
-- This is crucial to ensure staff members can still create appointments under the new schema.
DROP POLICY IF EXISTS "Allow staff to insert appointments for their clinic" ON public.appointments;

CREATE POLICY "Allow staff to insert appointments for their clinic" ON public.appointments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'clinic_staff' AND clinic_id = appointments.clinic_id
  )
  AND send_notifications = false
  AND patient_id IS NULL
);
