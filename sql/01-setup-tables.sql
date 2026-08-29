-- ============================================================
-- Zikr Tracker - Supabase Database Setup
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_id TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_ta TEXT NOT NULL,
    effective_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USERS TABLE (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    custom_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    first_login BOOLEAN DEFAULT TRUE,
    reset_otp TEXT,
    reset_otp_expiry TIMESTAMPTZ,
    reset_otp_count INTEGER DEFAULT 0,
    reset_otp_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. WEEKLY STATUS TABLE
CREATE TABLE IF NOT EXISTS weekly_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start TEXT NOT NULL,
    member_id TEXT NOT NULL,
    member_name TEXT,
    status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Reciting', 'Completed', 'Exception Raised')),
    completed_date_time TEXT,
    exception_raised_time TEXT,
    supported_by_name TEXT,
    supported_by_id TEXT,
    support_status TEXT,
    audit_log TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(week_start, member_id)
);

-- 4. HADIYA DETAILS TABLE
CREATE TABLE IF NOT EXISTS hadiya_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    start_date TEXT NOT NULL UNIQUE,
    nominated_member_id TEXT REFERENCES members(custom_id),
    nominated_to TEXT,
    nominated_to_ta TEXT,
    dedicated_to TEXT,
    dedicated_to_ta TEXT,
    dedicated_purpose_english TEXT,
    dedicated_purpose_tamil TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
    countdown_end_moment TEXT,
    next_hadiya_start_moment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    target_user_id TEXT,
    target_role TEXT DEFAULT 'admin',
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_custom_id ON members(custom_id);
CREATE INDEX IF NOT EXISTS idx_users_custom_id ON users(custom_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_weekly_status_week_member ON weekly_status(week_start, member_id);
CREATE INDEX IF NOT EXISTS idx_weekly_status_member_id ON weekly_status(member_id);
CREATE INDEX IF NOT EXISTS idx_hadiya_details_start_date ON hadiya_details(start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_user_id, is_read);
