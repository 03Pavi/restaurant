-- ============================================================================
-- SQL SCHEMA FOR QR CODES, SCANS, AND PROMOTIONAL OFFERS
-- Compatible with PostgreSQL / Supabase
-- ============================================================================

-- 1. Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: qr_codes
-- Supports both:
--   - 'TABLE' (Dine-in contactless ordering from seats)
--   - 'OFFER_SCRATCH' (Promotional flyer / delivery box scratch card deals)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id TEXT PRIMARY KEY DEFAULT ('qr_' || gen_random_uuid()),
    type TEXT NOT NULL DEFAULT 'TABLE' CHECK (type IN ('TABLE', 'OFFER_SCRATCH')),
    name TEXT NOT NULL,
    table_number TEXT,
    location TEXT DEFAULT 'Main Dining',
    campaign_title TEXT,
    offer_code TEXT,
    discount_reward TEXT,
    description TEXT,
    scans_today INTEGER NOT NULL DEFAULT 0,
    total_scans INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_type ON public.qr_codes (type);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON public.qr_codes (is_active);
CREATE INDEX IF NOT EXISTS idx_qr_codes_offer_code ON public.qr_codes (offer_code);

-- ============================================================================
-- TABLE: qr_scans
-- Logs scan analytics events for customer scans
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_table_id ON public.qr_scans (table_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanned_at ON public.qr_scans (scanned_at);

-- ============================================================================
-- TABLE: offers
-- Manages promotional coupons, discounts, and redemption analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT ('offer_' || gen_random_uuid()),
    restaurant_id TEXT,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENT', 'FLAT')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount NUMERIC(10, 2),
    expiry_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    times_redeemed INTEGER NOT NULL DEFAULT 0,
    total_saved NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_code ON public.offers (code);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON public.offers (is_active);

-- ============================================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_qr_codes_updated_at ON public.qr_codes;
CREATE TRIGGER trigger_qr_codes_updated_at
    BEFORE UPDATE ON public.qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_offers_updated_at ON public.offers;
CREATE TRIGGER trigger_offers_updated_at
    BEFORE UPDATE ON public.offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR SUPABASE (IDEMPOTENT)
-- ============================================================================
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
DROP POLICY IF EXISTS "Public read active qr_codes" ON public.qr_codes;
CREATE POLICY "Public read active qr_codes" ON public.qr_codes
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read active offers" ON public.offers;
CREATE POLICY "Public read active offers" ON public.offers
    FOR SELECT USING (is_active = true);

-- 2. Scan Logging Policy
DROP POLICY IF EXISTS "Public can log scans" ON public.qr_scans;
CREATE POLICY "Public can log scans" ON public.qr_scans
    FOR INSERT WITH CHECK (true);

-- 3. Admin / Authenticated Full Access Policies
DROP POLICY IF EXISTS "Admin full access qr_codes" ON public.qr_codes;
CREATE POLICY "Admin full access qr_codes" ON public.qr_codes
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access qr_scans" ON public.qr_scans;
CREATE POLICY "Admin full access qr_scans" ON public.qr_scans
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin full access offers" ON public.offers;
CREATE POLICY "Admin full access offers" ON public.offers
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
