-- ============================================================
-- Sorgathin Pathai - Seed Data
-- Run AFTER 02-rls-policies.sql
-- ============================================================

-- ============================================================
-- ADMIN USER (Change password before production!)
-- Default password: admin123
-- ============================================================
INSERT INTO users (custom_id, name, email, phone, password, role, first_login)
VALUES ('ADMIN001', 'Admin', 'admin@sorgathinpathai.local', NULL, 'admin123', 'admin', false)
ON CONFLICT (custom_id) DO NOTHING;

-- ============================================================
-- 35 MEMBERS - Sorgathin Pathai
-- Each member reads LA ILAHA ILLALLAH 2000 times per week
-- ============================================================
INSERT INTO members (custom_id, name_en, name_ta, effective_date) VALUES
('M001', 'Rabiya beevi', 'ராபியா பீவி', '2026-01-01'),
('M002', 'Balkis Khaja', 'பல்கிஸ் காஜா', '2026-01-01'),
('M003', 'Sabira Ajmal khan', 'சபிரா அஜ்மல்கான்', '2026-01-01'),
('M004', 'Khairunnisa', 'கைருன்னிஸா', '2026-01-01'),
('M005', 'Pawn nisha', 'பவன் நிஷா', '2026-01-01'),
('M006', 'Noor Amma', 'நூர் அம்மா', '2026-01-01'),
('M007', 'Mahamooda Nazeer', 'மஹூமதா நஜீர்', '2026-01-01'),
('M008', 'Johara Abbas', 'ஜோஹரா அப்பாஸ்', '2026-01-01'),
('M009', 'Sabitha Banu Iqbal', 'சபிதா பானு இக்பால்', '2026-01-01'),
('M010', 'Kamila Habeeburrahman', 'காமிலா ஹபீபுர் ரஹ்மான்', '2026-01-01'),
('M011', 'Siddeqa Ribay', 'சித்திகா ரிபாய்', '2026-01-01'),
('M012', 'Fathima Hasan', 'ஃபாத்திமா ஹசன்', '2026-01-01'),
('M013', 'Roja Shajahan', 'ரோஜா ஷாஜஹான்', '2026-01-01'),
('M014', 'Ayesha Ibrahim', 'ஆயிஷா இப்ராஹிம்', '2026-01-01'),
('M015', 'Sarifa Banu', 'சரிபா பானு', '2026-01-01'),
('M016', 'Sultana Yahya', 'சுல்தானா யஹ்யா', '2026-01-01'),
('M017', 'Sauda Moosa', 'சௌதா மூசா', '2026-01-01'),
('M018', 'Mumthaj Khaja', 'மும்தாஜ் காஜா', '2026-01-01'),
('M019', 'Balkis Thameem', 'பல்கிஸ் தாமீம்', '2026-01-01'),
('M020', 'Parveen Siddiq', 'பர்வீன் சித்திக்', '2026-01-01'),
('M021', 'Madeena Shahul', 'மதீனா ஷாகுல்', '2026-01-01'),
('M022', 'Jasmin Salman', 'ஜாஸ்மின் சல்மான்', '2026-01-01'),
('M023', 'Banu Jahir', 'பானு ஜாஹிர்', '2026-01-01'),
('M024', 'Sarmi Habeeb', 'சர்மி ஹபீப்', '2026-01-01'),
('M025', 'Baby Haroon', 'பேபி ஹரூன்', '2026-01-01'),
('M026', 'Rahmath Saleem', 'ரஹ்மத் சலீம்', '2026-01-01'),
('M027', 'Shakeela Abdul Rahman', 'ஷேகிலா அப்துல் ரஹ்மான்', '2026-01-01'),
('M028', 'Dil Kareem', 'தில் கரீம்', '2026-01-01'),
('M029', 'Sarmila Hidayathulla', 'சர்மிளா ஹிதயத்துல்லா', '2026-01-01'),
('M030', 'Sumaya Jafar Sadiq', 'சுமையா ஜாபர் சாதிக்', '2026-01-01'),
('M031', 'Fathima Madeena', 'ஃபாத்திமா மதீனா', '2026-01-01'),
('M032', 'Barakath Habeed', 'பாரகத் ஹபீப்', '2026-01-01'),
('M033', 'Rashitha Rajik', 'ராஷிதா ராஜிக்', '2026-01-01'),
('M034', 'Zulaiha Sheik Bareed', 'ஜூலைஹா ஷேக் பாரீத்', '2026-01-01'),
('M035', 'Afra Arafsa', 'அஃப்ரா ஆராஃப்ஸா', '2026-01-01')
ON CONFLICT (custom_id) DO NOTHING;

-- ============================================================
-- USER ACCOUNTS for members
-- Default password: password (members should change on first login)
-- Phone numbers are placeholders - update with real numbers
-- ============================================================
INSERT INTO users (custom_id, name, email, phone, password, role, first_login) VALUES
('M001', 'Rabiya beevi', NULL, '9000000001', 'password', 'user', true),
('M002', 'Balkis Khaja', NULL, '9000000002', 'password', 'user', true),
('M003', 'Sabira Ajmal khan', NULL, '9000000003', 'password', 'user', true),
('M004', 'Khairunnisa', NULL, '9000000004', 'password', 'user', true),
('M005', 'Pawn nisha', NULL, '9000000005', 'password', 'user', true),
('M006', 'Noor Amma', NULL, '9000000006', 'password', 'user', true),
('M007', 'Mahamooda Nazeer', NULL, '9000000007', 'password', 'user', true),
('M008', 'Johara Abbas', NULL, '9000000008', 'password', 'user', true),
('M009', 'Sabitha Banu Iqbal', NULL, '9000000009', 'password', 'user', true),
('M010', 'Kamila Habeeburrahman', NULL, '9000000010', 'password', 'user', true),
('M011', 'Siddeqa Ribay', NULL, '9000000011', 'password', 'user', true),
('M012', 'Fathima Hasan', NULL, '9000000012', 'password', 'user', true),
('M013', 'Roja Shajahan', NULL, '9000000013', 'password', 'user', true),
('M014', 'Ayesha Ibrahim', NULL, '9000000014', 'password', 'user', true),
('M015', 'Sarifa Banu', NULL, '9000000015', 'password', 'user', true),
('M016', 'Sultana Yahya', NULL, '9000000016', 'password', 'user', true),
('M017', 'Sauda Moosa', NULL, '9000000017', 'password', 'user', true),
('M018', 'Mumthaj Khaja', NULL, '9000000018', 'password', 'user', true),
('M019', 'Balkis Thameem', NULL, '9000000019', 'password', 'user', true),
('M020', 'Parveen Siddiq', NULL, '9000000020', 'password', 'user', true),
('M021', 'Madeena Shahul', NULL, '9000000021', 'password', 'user', true),
('M022', 'Jasmin Salman', NULL, '9000000022', 'password', 'user', true),
('M023', 'Banu Jahir', NULL, '9000000023', 'password', 'user', true),
('M024', 'Sarmi Habeeb', NULL, '9000000024', 'password', 'user', true),
('M025', 'Baby Haroon', NULL, '9000000025', 'password', 'user', true),
('M026', 'Rahmath Saleem', NULL, '9000000026', 'password', 'user', true),
('M027', 'Shakeela Abdul Rahman', NULL, '9000000027', 'password', 'user', true),
('M028', 'Dil Kareem', NULL, '9000000028', 'password', 'user', true),
('M029', 'Sarmila Hidayathulla', NULL, '9000000029', 'password', 'user', true),
('M030', 'Sumaya Jafar Sadiq', NULL, '9000000030', 'password', 'user', true),
('M031', 'Fathima Madeena', NULL, '9000000031', 'password', 'user', true),
('M032', 'Barakath Habeed', NULL, '9000000032', 'password', 'user', true),
('M033', 'Rashitha Rajik', NULL, '9000000033', 'password', 'user', true),
('M034', 'Zulaiha Sheik Bareed', NULL, '9000000034', 'password', 'user', true),
('M035', 'Afra Arafsa', NULL, '9000000035', 'password', 'user', true)
ON CONFLICT (custom_id) DO NOTHING;

-- Hadiya entries are in 04-hadiya-loop.sql
