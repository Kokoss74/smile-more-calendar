-- This migration addresses the issue where clinic_staff cannot edit (drag, resize) their own appointments.
-- It replaces the overly restrictive 'update to canceled' policy with a more general update policy.

-- 1. Drop the old, restrictive policy that only allowed updating status to 'canceled'.
DROP POLICY IF EXISTS "Allow staff to update status to canceled" ON public.appointments;

-- 2. Create a new, more comprehensive policy for updates by clinic_staff.
-- This policy allows staff to update appointments within their own clinic,
-- with a check to prevent them from moving the appointment to another clinic
-- or marking it as 'completed'.
CREATE POLICY "Allow staff to update their clinic's appointments"
ON public.appointments
FOR UPDATE
USING (
  -- The user must be a clinic_staff and the appointment must belong to their clinic.
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND role = 'clinic_staff'
      AND clinic_id = appointments.clinic_id
  )
)
WITH CHECK (
  -- The check clause ensures that on update, the appointment remains in the staff's clinic.
  clinic_id = (
    SELECT p.clinic_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
  )
  -- Staff cannot change the status to 'completed'. This is reserved for the admin.
  AND status <> 'completed'
);
