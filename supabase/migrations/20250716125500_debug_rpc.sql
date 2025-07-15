-- DEBUGGING MIGRATION
-- This migration temporarily simplifies the get_calendar_appointments RPC function
-- to help diagnose why the calendar is appearing empty.
-- It removes all role-based logic, CASE statements, and JOINs,
-- returning only raw appointment data.
-- This will help determine if the issue is in the basic query or the complex logic.

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
    "owner_id" uuid,
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
BEGIN
    -- Return the query result with simplified data
    RETURN QUERY
    SELECT
        a.id,
        a.clinic_id,
        a.start_ts,
        a.end_ts,
        a.patient_id,
        a.short_label,
        a.status,
        a.procedure_id,
        a.cost,
        a.tooth_num,
        a.description,
        a.send_notifications,
        a.created_by,
        -- Return NULL for all joined fields to match the table structure
        -- and avoid breaking the client-side mapping.
        NULL::uuid AS owner_id,
        NULL::text AS first_name,
        NULL::text AS last_name,
        NULL::text AS clinic_name,
        NULL::text AS clinic_color,
        NULL::text AS procedure_name,
        NULL::text AS procedure_color
    FROM
        public.appointments a
    WHERE
        tstzrange(a.start_ts, a.end_ts, '[]') && tstzrange(start_date, end_date, '[]')
        AND a.status != 'canceled';
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_calendar_appointments(timestamptz, timestamptz) TO authenticated;
