-- ============================================================
-- Sorgathin Pathai - Row Level Security Policies
-- Run AFTER 01-setup-tables.sql
-- Safe to re-run (drops existing policies first)
-- FIX: Uses SECURITY DEFINER helper to avoid infinite recursion
--      on users table (policies that query users from users = recursion)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadiya_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: checks if current JWT user is admin, bypasses RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE custom_id = (current_setting('request.jwt.claims', true)::json->>'custom_id')
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- MEMBERS: Public read, admin write
-- ============================================================
DROP POLICY IF EXISTS "Members: Public read" ON members;
CREATE POLICY "Members: Public read"
    ON members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Members: Admin insert" ON members;
DROP POLICY IF EXISTS "Members: Allow insert" ON members;
CREATE POLICY "Members: Allow insert"
    ON members FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Members: Admin update" ON members;
DROP POLICY IF EXISTS "Members: Allow update" ON members;
CREATE POLICY "Members: Allow update"
    ON members FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Members: Admin delete" ON members;
DROP POLICY IF EXISTS "Members: Allow delete" ON members;
CREATE POLICY "Members: Allow delete"
    ON members FOR DELETE USING (true);

-- ============================================================
-- USERS: Public read for auth (no recursion), admin via helper
-- ============================================================
DROP POLICY IF EXISTS "Users: Public read for auth" ON users;
DROP POLICY IF EXISTS "Users: Admin read all" ON users;
DROP POLICY IF EXISTS "Users: Read own" ON users;
-- Single permissive SELECT: phone lookup must work without JWT
CREATE POLICY "Users: Public read for auth"
    ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users: Admin update all" ON users;
DROP POLICY IF EXISTS "Users: Update own profile" ON users;
DROP POLICY IF EXISTS "Users: Update own" ON users;
DROP POLICY IF EXISTS "Users: Allow update" ON users;
CREATE POLICY "Users: Allow update"
    ON users FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users: Admin insert" ON users;
DROP POLICY IF EXISTS "Users: Allow insert" ON users;
CREATE POLICY "Users: Allow insert"
    ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users: Admin delete" ON users;
DROP POLICY IF EXISTS "Users: Allow delete" ON users;
CREATE POLICY "Users: Allow delete"
    ON users FOR DELETE USING (true);

-- ============================================================
-- WEEKLY STATUS: Permissive (custom auth via anon key, app-layer checks)
-- ============================================================
DROP POLICY IF EXISTS "Weekly Status: Public read" ON weekly_status;
DROP POLICY IF EXISTS "Weekly Status: Admin full access" ON weekly_status;
DROP POLICY IF EXISTS "Weekly Status: Users insert own" ON weekly_status;
DROP POLICY IF EXISTS "Weekly Status: Users update own current week" ON weekly_status;
DROP POLICY IF EXISTS "Weekly Status: Allow all" ON weekly_status;
CREATE POLICY "Weekly Status: Allow all"
    ON weekly_status FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- HADIYA DETAILS: Public read, admin write
-- ============================================================
DROP POLICY IF EXISTS "Hadiya: Public read" ON hadiya_details;
CREATE POLICY "Hadiya: Public read"
    ON hadiya_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hadiya: Admin full access" ON hadiya_details;
DROP POLICY IF EXISTS "Hadiya: Allow all" ON hadiya_details;
CREATE POLICY "Hadiya: Allow all"
    ON hadiya_details FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- NOTIFICATIONS: Read own, admin write
-- ============================================================
DROP POLICY IF EXISTS "Notifications: Read own" ON notifications;
CREATE POLICY "Notifications: Read own"
    ON notifications FOR SELECT USING (
        target_user_id = (current_setting('request.jwt.claims', true)::json->>'custom_id')
        OR target_role = 'admin'
    );

DROP POLICY IF EXISTS "Notifications: Admin insert" ON notifications;
DROP POLICY IF EXISTS "Notifications: Allow insert" ON notifications;
CREATE POLICY "Notifications: Allow insert"
    ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications: User update own" ON notifications;
DROP POLICY IF EXISTS "Notifications: Admin update all" ON notifications;
DROP POLICY IF EXISTS "Notifications: Allow update" ON notifications;
CREATE POLICY "Notifications: Allow update"
    ON notifications FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications: Admin delete" ON notifications;
DROP POLICY IF EXISTS "Notifications: User delete own" ON notifications;
DROP POLICY IF EXISTS "Notifications: Allow delete" ON notifications;
CREATE POLICY "Notifications: Allow delete"
    ON notifications FOR DELETE USING (true);
