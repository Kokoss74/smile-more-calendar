-- This migration fixes a critical vulnerability in the appointment overlap check.
-- The original trigger only checked for conflicts within the same clinic_id,
-- allowing a clinic_staff member to create an appointment in a slot
-- already booked by the admin for a different clinic or a blocked time slot.
--
-- The fix removes the clinic_id filter from the overlap check, ensuring that
-- all appointments and blocked slots are considered globally, preventing any double-booking.

-- Drop the existing trigger and function to ensure a clean update.
DROP TRIGGER IF EXISTS trigger_check_appointment_overlap ON public.appointments;
DROP FUNCTION IF EXISTS public.check_appointment_overlap();

-- Re-create the function without the clinic_id check for global overlap validation.
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- The check now looks for overlaps across ALL clinics by removing the clinic_id filter.
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE
      -- The clinic_id check has been removed to enforce a global lock on time slots.
      id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000') AND
      tstzrange(start_ts, end_ts, '[]') && tstzrange(NEW.start_ts, NEW.end_ts, '[]') AND
      status != 'canceled' -- Canceled appointments don't cause conflicts.
  ) THEN
    RAISE EXCEPTION 'timeslot_is_already_booked'
      USING HINT = 'Выбранный временной слот уже занят.';
  END IF;
  RETURN NEW;
END;
$$;

-- Re-create the trigger to use the updated function.
CREATE TRIGGER trigger_check_appointment_overlap
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_overlap();
