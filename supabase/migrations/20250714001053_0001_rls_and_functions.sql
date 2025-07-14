-- RLS Policies for 'profiles' table
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using ( user_id = auth.uid() );
create policy "Users can insert own profile" on public.profiles for insert with check ( user_id = auth.uid() );
create policy "Users can update own profile" on public.profiles for update using ( user_id = auth.uid() );

-- RLS Policies for 'clinics' table
alter table public.clinics enable row level security;
create policy "Allow admin select clinics" on public.clinics for select using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin insert clinics" on public.clinics for insert with check ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin update clinics" on public.clinics for update using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin delete clinics" on public.clinics for delete using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow staff to read their own clinic" on public.clinics for select using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and clinic_id = clinics.id) 
);

-- RLS Policies for 'patients' table
alter table public.patients enable row level security;
create policy "Allow admin select patients" on public.patients for select using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin insert patients" on public.patients for insert with check ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin update patients" on public.patients for update using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin delete patients" on public.patients for delete using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow staff to read patients for their clinic" on public.patients for select using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'clinic_staff') and owner_id is null 
);
create policy "Allow staff to create patients for their clinic" on public.patients for insert with check ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'clinic_staff') and owner_id is null 
);

-- RLS Policies for 'appointments' table
alter table public.appointments enable row level security;
create policy "Allow admin select appointments" on public.appointments for select using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin insert appointments" on public.appointments for insert with check ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin update appointments" on public.appointments for update using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow admin delete appointments" on public.appointments for delete using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin') 
);
create policy "Allow staff to read appointments of their clinic" on public.appointments for select using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'clinic_staff' and clinic_id = appointments.clinic_id) 
);
create policy "Allow staff to insert appointments for their clinic" on public.appointments for insert with check ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'clinic_staff' and clinic_id = appointments.clinic_id) 
  and private = false and patient_id is null 
);
create policy "Allow staff to update status to canceled" on public.appointments for update using ( 
  exists(select 1 from public.profiles where user_id = auth.uid() and role = 'clinic_staff' and clinic_id = appointments.clinic_id) 
) with check ( status = 'canceled' );

-- Trigger function to check for overlapping appointments
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
RETURNS TRIGGER 
LANGUAGE plpgsql
-- Устанавливаем пустой search_path для безопасности
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    -- Явно указываем схему 'public' для таблицы
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
$$;

-- Trigger that executes the function
CREATE TRIGGER trigger_check_appointment_overlap
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION check_appointment_overlap();

-- Helper functions with secure search_path
CREATE OR REPLACE FUNCTION public.current_role() 
RETURNS text
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
-- Устанавливаем пустой search_path для безопасности
SET search_path = ''
AS $$
  -- Явно указываем схемы для таблицы и функции
  SELECT role FROM public.profiles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.current_clinic() 
RETURNS uuid
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
-- Устанавливаем пустой search_path для безопасности
SET search_path = ''
AS $$
  -- Явно указываем схемы для таблицы и функции
  SELECT clinic_id FROM public.profiles WHERE user_id = auth.uid()
$$;
