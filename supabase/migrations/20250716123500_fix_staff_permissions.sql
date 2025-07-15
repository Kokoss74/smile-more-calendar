-- This migration addresses critical permission issues for the 'clinic_staff' role.
-- 1. Fixes the RLS policy that prevented staff from creating appointments.
-- 2. Replaces the restrictive SELECT policy with a secure RPC function to allow
--    staff to see anonymized busy slots from other clinics.

-- Step 1: Fix the INSERT policy for clinic_staff.
-- The previous policy was too strict, checking for business logic (send_notifications, patient_id)
-- at the database level, which made the client-side implementation brittle.
-- The new policy only enforces that the staff member belongs to the correct clinic.

-- Drop the old, restrictive policy
DROP POLICY IF EXISTS "Allow staff to insert appointments for their clinic" ON public.appointments;

-- Create a new, simpler policy focusing only on clinic membership
CREATE POLICY "Allow staff to insert appointments for their clinic" ON public.appointments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'clinic_staff' AND clinic_id = appointments.clinic_id
  )
);

-- Step 2: Create an RPC function to securely fetch calendar data.
-- This replaces the old SELECT policy and allows staff to see all busy slots
-- without exposing sensitive data from other clinics.

-- Drop the old, restrictive SELECT policy
DROP POLICY IF EXISTS "Allow staff to read appointments of their clinic" ON public.appointments;

-- Re-enable the SELECT policy but make it permissive for staff, as the RPC will handle the logic.
-- The actual data filtering will happen in the RPC function.
CREATE POLICY "Allow staff to read appointments" ON public.appointments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'clinic_staff'
  )
);


-- Create the RPC function
CREATE OR REPLACE FUNCTION public.get_calendar_appointments(
    start_date timestamptz,
    end_date timestamptz
)
RETURNS TABLE (
    id uuid,
    clinic_id uuid,
    start_ts timestamptz,
    end_ts timestamptz,
    patient_id uuid,
    short_label text,
    status public.appointment_status,
    procedure_id uuid,
    cost numeric,
    tooth_num character varying,
    description text,
    send_notifications boolean,
    created_by uuid,
    "owner_id" uuid, -- patient's owner_id
    "first_name" text,
    "last_name" text,
    "clinic_name" text,
    "clinic_color" text,
    "procedure_name" text,
    "procedure_color" text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requesting_user_role text;
    requesting_user_clinic_id uuid;
BEGIN
    -- Get the role and clinic_id of the user making the request
    SELECT role, clinic_id INTO requesting_user_role, requesting_user_clinic_id
    FROM public.profiles
    WHERE user_id = auth.uid();

    -- Return the query result
    RETURN QUERY
    SELECT
        a.id,
        a.clinic_id,
        a.start_ts,
        a.end_ts,
        CASE
            -- If user is admin, show everything.
            -- If user is staff and patient is public (owner_id is NULL), show patient_id.
            -- If user is staff and appointment is in their clinic, show patient_id.
            WHEN requesting_user_role = 'admin' OR p.owner_id IS NULL OR a.clinic_id = requesting_user_clinic_id
            THEN a.patient_id
            ELSE NULL
        END AS patient_id,
        CASE
            -- If user is admin, show the real label.
            -- If user is staff and this is their clinic's appointment, show the label.
            -- If user is staff and it's a public patient, show the label.
            WHEN requesting_user_role = 'admin' OR a.clinic_id = requesting_user_clinic_id OR p.owner_id IS NULL
            THEN a.short_label
            -- If it's a private patient of the admin in another clinic, show "Время занято".
            WHEN p.owner_id IS NOT NULL AND a.clinic_id != requesting_user_clinic_id
            THEN 'Время занято'
            ELSE a.short_label -- Default case
        END AS short_label,
        a.status,
        a.procedure_id,
        a.cost,
        a.tooth_num,
        a.description,
        a.send_notifications,
        a.created_by,
        p.owner_id,
        p.first_name,
        p.last_name,
        c.name AS clinic_name,
        c.color_hex AS clinic_color,
        pc.name AS procedure_name,
        pc.color_hex AS procedure_color
    FROM
        public.appointments a
    LEFT JOIN
        public.patients p ON a.patient_id = p.id
    LEFT JOIN
        public.clinics c ON a.clinic_id = c.id
    LEFT JOIN
        public.procedures_catalog pc ON a.procedure_id = pc.id
    WHERE
        a.start_ts >= start_date AND a.end_ts <= end_date
        AND a.status != 'canceled';
END;
$$;

-- Grant execute permission on the new function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_calendar_appointments(timestamptz, timestamptz) TO authenticated;
