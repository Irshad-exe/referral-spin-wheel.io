const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase with service role key to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE; // Using service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Replace these with the actual values from your Supabase Auth user
const userId = 'b7186884-19f5-4367-9b72-cc8754689917';
const userEmail = 'raj@lakshinvestment.com';

async function addAdmin() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([
        { 
          id: userId,
          email: userEmail,
          created_at: new Date().toISOString(),
          role: 'admin',
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (error) {
      if (error.message.includes('duplicate key')) {
        console.log('User is already an admin');
        return;
      }
      throw error;
    }
    
    console.log('Successfully added admin user:', data);
  } catch (error) {
    console.error('Error adding admin user:', error);
  }
}

addAdmin();