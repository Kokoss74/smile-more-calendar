-- This migration restores the production version of the get_calendar_appointments RPC function,
-- replacing the simplified debugging version.

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
            WHEN requesting_user_role = 'admin' OR p.owner_id IS NULL OR a.clinic_id = requesting_user_clinic_id
            THEN a.patient_id
            ELSE NULL
        END AS patient_id,
        CASE
            WHEN requesting_user_role = 'admin' OR a.clinic_id = requesting_user_clinic_id OR p.owner_id IS NULL
            THEN a.short_label
            WHEN p.owner_id IS NOT NULL AND a.clinic_id != requesting_user_clinic_id
            THEN 'Время занято'
            ELSE a.short_label
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
        tstzrange(a.start_ts, a.end_ts, '[]') && tstzrange(start_date, end_date, '[]')
        AND a.status != 'canceled';
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_calendar_appointments(timestamptz, timestamptz) TO authenticated;
