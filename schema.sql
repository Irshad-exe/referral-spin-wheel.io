-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    ladoo_count INTEGER DEFAULT 0,
    email TEXT,
    ucc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) NOT NULL,
    referee_name TEXT NOT NULL,
    referee_contact TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE spin_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID REFERENCES referrals(id) NOT NULL,
    token UUID NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    prize TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_spin_links_token ON spin_links(token);
CREATE INDEX idx_referrals_client_id ON referrals(client_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all access for clients" ON clients;
DROP POLICY IF EXISTS "Enable all access for referrals" ON referrals;
DROP POLICY IF EXISTS "Enable all access for spin_links" ON spin_links;

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE spin_links ENABLE ROW LEVEL SECURITY;

-- Clients table policies
CREATE POLICY "Enable all access for clients"
    ON clients
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Referrals table policies
CREATE POLICY "Enable all access for referrals"
    ON referrals
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Spin links table policies
CREATE POLICY "Enable all access for spin_links"
    ON spin_links
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Function to notify admin when ladoo_count reaches 3
CREATE OR REPLACE FUNCTION notify_ladoo_threshold()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ladoo_count >= 3 AND OLD.ladoo_count < 3 THEN
        -- You can implement email notification here using Supabase Edge Functions
        -- For now, we'll just log it
        RAISE NOTICE 'Client % has reached 3 ladoos!', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ladoo threshold notification
CREATE TRIGGER check_ladoo_threshold
    AFTER UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION notify_ladoo_threshold();

-- Function to get or create client
CREATE OR REPLACE FUNCTION get_or_create_client(
    p_name TEXT,
    p_contact TEXT
) RETURNS UUID AS $$
DECLARE
    v_client_id UUID;
BEGIN
    -- Try to find existing client
    SELECT id INTO v_client_id
    FROM clients
    WHERE name = p_name AND contact_info = p_contact;

    -- If client doesn't exist, create new one
    IF v_client_id IS NULL THEN
        INSERT INTO clients (name, contact_info)
        VALUES (p_name, p_contact)
        RETURNING id INTO v_client_id;
    END IF;

    RETURN v_client_id;
END;
$$ LANGUAGE plpgsql;

-- Insert initial client and get their ID
DO $$
DECLARE
    v_client_id UUID;
BEGIN
    -- Get or create client
    v_client_id := get_or_create_client('Raj', '7990977122');

    -- Create initial spin link
    WITH initial_referral AS (
        INSERT INTO referrals (client_id, referee_name, referee_contact, status)
        VALUES (v_client_id, 'Initial Spin', 'Initial Spin', 'verified')
        RETURNING id
    )
    INSERT INTO spin_links (referral_id, token)
    SELECT id, uuid_generate_v4()
    FROM initial_referral;
END;
$$; 


