-- ============================================================
-- Sorgathin Pathai - Migration: Link hadiya to members
-- Run AFTER 01-setup-tables.sql (safe to re-run)
-- Links hadiya_details.nominated_to -> members via custom_id
-- Future hadiya rows should use nominated_member_id
-- ============================================================

-- 1. Add column if not exists
ALTER TABLE hadiya_details ADD COLUMN IF NOT EXISTS nominated_member_id TEXT REFERENCES members(custom_id);
CREATE INDEX IF NOT EXISTS idx_hadiya_member_id ON hadiya_details(nominated_member_id);

-- 2. Backfill existing rows by matching nominated_to text to members.name_en
UPDATE hadiya_details h
SET nominated_member_id = m.custom_id
FROM members m
WHERE h.nominated_member_id IS NULL
  AND LOWER(TRIM(h.nominated_to)) = LOWER(TRIM(m.name_en))
  AND m.custom_id IS NOT NULL;

-- 3. Verify
-- SELECT start_date, nominated_to, nominated_member_id FROM hadiya_details ORDER BY start_date;
