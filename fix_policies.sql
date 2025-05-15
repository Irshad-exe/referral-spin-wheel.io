-- Drop existing policies
DROP POLICY IF EXISTS "Enable all access for clients" ON clients;
DROP POLICY IF EXISTS "Enable all access for referrals" ON referrals;
DROP POLICY IF EXISTS "Enable all access for spin_links" ON spin_links;

-- Create new policies for authenticated users
CREATE POLICY "Enable read access for authenticated users"
    ON clients
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users"
    ON referrals
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable read access for authenticated users"
    ON spin_links
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policies for admin users
CREATE POLICY "Enable all access for admin users"
    ON clients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Enable all access for admin users"
    ON referrals
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Enable all access for admin users"
    ON spin_links
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    ); 