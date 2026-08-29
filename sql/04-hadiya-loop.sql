-- ============================================================
-- Sorgathin Pathai - Hadiya Loop Seed
-- Starts 2 weeks before Fri 28 Aug 2026 to capture Member 1
-- Fri 14 Aug -> Rabiya (Completed), Fri 21 Aug -> Balkis (Completed),
-- Fri 28 Aug -> Sabira (Pending / current)
-- Extends automatically for all 35 members in serial order
-- Uses nominated_member_id so name changes via effective_date are reflected
-- Safe to re-run (DO UPDATE fixes text + member link)
-- ============================================================

-- Past weeks: Completed | Current: Pending
INSERT INTO hadiya_details (start_date, nominated_member_id, nominated_to, nominated_to_ta, status, countdown_end_moment, next_hadiya_start_moment)
VALUES ('2026-08-14', 'M001', 'Rabiya beevi', 'ராபியா பீவி', 'Completed', '2026-08-20 18:00:00+05:30', '2026-08-21 00:00:00+05:30')
ON CONFLICT (start_date) DO UPDATE SET nominated_member_id=EXCLUDED.nominated_member_id, nominated_to=EXCLUDED.nominated_to, nominated_to_ta=EXCLUDED.nominated_to_ta, status=EXCLUDED.status, countdown_end_moment=EXCLUDED.countdown_end_moment, next_hadiya_start_moment=EXCLUDED.next_hadiya_start_moment;

INSERT INTO hadiya_details (start_date, nominated_member_id, nominated_to, nominated_to_ta, status, countdown_end_moment, next_hadiya_start_moment)
VALUES ('2026-08-21', 'M002', 'Balkis Khaja', 'பல்கிஸ் காஜா', 'Completed', '2026-08-27 18:00:00+05:30', '2026-08-28 00:00:00+05:30')
ON CONFLICT (start_date) DO UPDATE SET nominated_member_id=EXCLUDED.nominated_member_id, nominated_to=EXCLUDED.nominated_to, nominated_to_ta=EXCLUDED.nominated_to_ta, status=EXCLUDED.status, countdown_end_moment=EXCLUDED.countdown_end_moment, next_hadiya_start_moment=EXCLUDED.next_hadiya_start_moment;

INSERT INTO hadiya_details (start_date, nominated_member_id, nominated_to, nominated_to_ta, status, countdown_end_moment, next_hadiya_start_moment)
VALUES ('2026-08-28', 'M003', 'Sabira Ajmal khan', 'சபிரா அஜ்மல்கான்', 'Pending', '2026-09-03 18:00:00+05:30', '2026-09-04 00:00:00+05:30')
ON CONFLICT (start_date) DO UPDATE SET nominated_member_id=EXCLUDED.nominated_member_id, nominated_to=EXCLUDED.nominated_to, nominated_to_ta=EXCLUDED.nominated_to_ta, status=EXCLUDED.status, countdown_end_moment=EXCLUDED.countdown_end_moment, next_hadiya_start_moment=EXCLUDED.next_hadiya_start_moment;

-- ============================================================
-- FUTURE WEEKS: Auto-loop through remaining members (4..35)
-- Each Friday gets next member in serial order
-- ============================================================
DO $$
DECLARE
    cids TEXT[] := ARRAY['M004','M005','M006','M007','M008','M009','M010','M011','M012','M013','M014','M015','M016','M017','M018','M019','M020','M021','M022','M023','M024','M025','M026','M027','M028','M029','M030','M031','M032','M033','M034','M035'];
    names TEXT[] := ARRAY[
        'Khairunnisa','Pawn nisha','Noor Amma','Mahamooda Nazeer','Johara Abbas',
        'Sabitha Banu Iqbal','Kamila Habeeburrahman','Siddeqa Ribay','Fathima Hasan','Roja Shajahan',
        'Ayesha Ibrahim','Sarifa Banu','Sultana Yahya','Sauda Moosa','Mumthaj Khaja',
        'Balkis Thameem','Parveen Siddiq','Madeena Shahul','Jasmin Salman','Banu Jahir',
        'Sarmi Habeeb','Baby Haroon','Rahmath Saleem','Shakeela Abdul Rahman','Dil Kareem',
        'Sarmila Hidayathulla','Sumaya Jafar Sadiq','Fathima Madeena','Barakath Habeed','Rashitha Rajik',
        'Zulaiha Sheik Bareed','Afra Arafsa'
    ];
    names_ta TEXT[] := ARRAY[
        'கைருன்னிஸா','பவன் நிஷா','நூர் அம்மா','மஹூமதா நஜீர்','ஜோஹரா அப்பாஸ்',
        'சபிதா பானு இக்பால்','காமிலா ஹபீபுர் ரஹ்மான்','சித்திகா ரிபாய்','ஃபாத்திமா ஹசன்','ரோஜா ஷாஜஹான்',
        'ஆயிஷா இப்ராஹிம்','சரிபா பானு','சுல்தானா யஹ்யா','சௌதா மூசா','மும்தாஜ் காஜா',
        'பல்கிஸ் தாமீம்','பர்வீன் சித்திக்','மதீனா ஷாகுல்','ஜாஸ்மின் சல்மான்','பானு ஜாஹிர்',
        'சர்மி ஹபீப்','பேபி ஹரூன்','ரஹ்மத் சலீம்','ஷேகிலா அப்துல் ரஹ்மான்','தில் கரீம்',
        'சர்மிளா ஹிதயத்துல்லா','சுமையா ஜாபர் சாதிக்','ஃபாத்திமா மதீனா','பாரகத் ஹபீப்','ராஷிதா ராஜிக்',
        'ஜூலைஹா ஷேக் பாரீத்','அஃப்ரா ஆராஃப்ஸா'
    ];
    base_date DATE := '2026-09-04';
    i INT; wk_start DATE; wk_end DATE; wk_next DATE;
BEGIN
    FOR i IN 1..32 LOOP
        wk_start := base_date + (i - 1) * 7;
        wk_end   := wk_start + 6;
        wk_next  := wk_start + 7;
        INSERT INTO hadiya_details (start_date, nominated_member_id, nominated_to, nominated_to_ta, status, countdown_end_moment, next_hadiya_start_moment)
        VALUES (wk_start::TEXT, cids[i], names[i], names_ta[i], 'Pending', (wk_end::TEXT || ' 18:00:00+05:30'), (wk_next::TEXT || ' 00:00:00+05:30'))
        ON CONFLICT (start_date) DO UPDATE SET nominated_member_id=EXCLUDED.nominated_member_id, nominated_to=EXCLUDED.nominated_to, nominated_to_ta=EXCLUDED.nominated_to_ta;
    END LOOP;
END $$;
