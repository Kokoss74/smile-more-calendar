-- Table: clinics
CREATE TABLE public.clinics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color_hex text
);

-- Table: profiles
CREATE TABLE public.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL,
    clinic_id uuid REFERENCES public.clinics(id)
);

-- Table: procedures_catalog
CREATE TABLE public.procedures_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color_hex text,
    created_by uuid REFERENCES auth.users(id)
);

-- Table: appointment_templates
CREATE TABLE public.appointment_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    default_duration_min integer,
    default_procedure_id uuid REFERENCES public.procedures_catalog(id),
    default_cost numeric(10, 2),
    created_by uuid REFERENCES auth.users(id)
);

-- Table: patients
CREATE TABLE public.patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text,
    phone text,
    age integer,
    notes text,
    medical_info jsonb,
    is_dispensary boolean,
    owner_id uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Table: patient_files
CREATE TABLE public.patient_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_url text NOT NULL,
    mime text,
    size bigint,
    uploaded_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enum: appointment_status
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'canceled');

-- Table: appointments
CREATE TABLE public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id uuid REFERENCES public.clinics(id),
    start_ts timestamptz NOT NULL,
    end_ts timestamptz NOT NULL,
    patient_id uuid REFERENCES public.patients(id),
    short_label text,
    status public.appointment_status DEFAULT 'scheduled'::public.appointment_status,
    procedure_id uuid REFERENCES public.procedures_catalog(id),
    cost numeric(10, 2),
    tooth_num character varying(10),
    description text,
    private boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    updated_by uuid REFERENCES auth.users(id),
    canceled_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz
);

-- Table: wa_templates
CREATE TABLE public.wa_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    body_ru text,
    body_il text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enum: wa_status
CREATE TYPE public.wa_status AS ENUM ('pending', 'sent', 'failed');

-- Table: wa_outbox
CREATE TABLE public.wa_outbox (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id uuid REFERENCES public.appointments(id),
    patient_id uuid NOT NULL REFERENCES public.patients(id),
    template_code text REFERENCES public.wa_templates(code),
    payload jsonb,
    sent_at timestamptz,
    status public.wa_status DEFAULT 'pending'::public.wa_status,
    error_message text
);
