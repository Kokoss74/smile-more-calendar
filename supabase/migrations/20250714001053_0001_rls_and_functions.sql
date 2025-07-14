-- Helper function to get current user's role
create function public.current_role() returns text
  language sql stable as $$
    select role from public.profiles where user_id = auth.uid()
  $$;

-- Helper function to get current user's clinic
create function public.current_clinic() returns uuid
  language sql stable as $$
    select clinic_id from public.profiles where user_id = auth.uid()
  $$;

-- RLS Policies for 'clinics' table
alter table public.clinics enable row level security;
create policy "Allow admin full access to clinics" on public.clinics for all using ( current_role() = 'admin' );
create policy "Allow staff to read their own clinic" on public.clinics for select using ( id = current_clinic() );

-- RLS Policies for 'patients' table
alter table public.patients enable row level security;
create policy "Allow admin full access to patients" on public.patients for all using ( current_role() = 'admin' );
create policy "Allow staff to read/create patients for their clinic" on public.patients for select, insert with check ( current_role() = 'clinic_staff' and owner_id is null );

-- RLS Policies for 'appointments' table
alter table public.appointments enable row level security;
create policy "Allow admin full access to appointments" on public.appointments for all using ( current_role() = 'admin' );
create policy "Allow staff to read appointments of their clinic" on public.appointments for select using ( current_role() = 'clinic_staff' and clinic_id = current_clinic() );
create policy "Allow staff to insert appointments for their clinic" on public.appointments for insert with check ( current_role() = 'clinic_staff' and clinic_id = current_clinic() and private = false and patient_id is null );
create policy "Allow staff to update status to canceled" on public.appointments for update using ( current_role() = 'clinic_staff' and clinic_id = current_clinic() ) with check ( status = 'canceled' );
create policy "Deny staff from deleting appointments" on public.appointments for delete using ( false );

-- Trigger function to check for overlapping appointments
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE
      (clinic_id = NEW.clinic_id OR (clinic_id IS NULL AND NEW.clinic_id IS NULL)) AND
      id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000') AND
      tstzrange(start_ts, end_ts, '[]') && tstzrange(NEW.start_ts, NEW.end_ts, '[]') AND
      status != 'canceled'
  ) THEN
    RAISE EXCEPTION 'timeslot_is_already_booked'
      USING HINT = 'Выбранный временной слот уже занят.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that executes the function
CREATE TRIGGER trigger_check_appointment_overlap
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_overlap();
