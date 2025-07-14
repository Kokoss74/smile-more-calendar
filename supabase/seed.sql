-- Seed data for the 'clinics' table
INSERT INTO public.clinics (name, color_hex) VALUES
('Smile More Clinic', '#3498db'),
('Dudko Dental Clinic', '#e74c3c'),

-- Seed data for the 'procedures_catalog' table
INSERT INTO public.procedures_catalog (name, color_hex) VALUES
('Консультация', '#f1c40f'),
('Гигиена', '#1abc9c'),
('Лечение кариеса', '#9b59b6'),
('Лечение корневого канала', '#e67e22')

-- Seed data for the 'wa_templates' table
INSERT INTO public.wa_templates (code, body_ru, body_il) VALUES
('APPOINTMENT_CONFIRMATION', 'Здравствуйте, {patient_name}! Ваш визит к врачу назначен на {appointment_date} в {appointment_time}.', 'שלום {patient_name}! תורך נקבע ל-{appointment_date} בשעה {appointment_time}.'),
('APPOINTMENT_REMINDER_24H', 'Напоминаем о Вашем визите завтра, {appointment_date} в {appointment_time}.', 'תזכורת לתור שלך מחר, {appointment_date} בשעה {appointment_time}.'),
('APPOINTMENT_CANCELED', 'Ваш визит на {appointment_date} в {appointment_time} был отменен.', 'התור שלך ב-{appointment_date} בשעה {appointment_time} בוטל.');
