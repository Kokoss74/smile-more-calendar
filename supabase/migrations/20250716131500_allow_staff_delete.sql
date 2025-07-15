-- This migration addresses the issue where clinic_staff cannot delete their own appointments.
-- It adds a new RLS policy to allow this action.

-- 1. Create a new policy to allow clinic_staff to delete appointments in their clinic.
-- This ensures they can only remove records they are responsible for.
CREATE POLICY "Allow staff to delete appointments in their clinic"
ON public.appointments
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'clinic_staff'
      AND clinic_id = appointments.clinic_id
  )
);
