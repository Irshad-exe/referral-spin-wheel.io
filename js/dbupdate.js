const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';
const supabase = createClient(supabaseUrl, supabaseKey);

// Read Excel file
const workbook = xlsx.readFile('../CLIENT.xls');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet);

// Function to insert data into Supabase
async function insertData() {
  for (const record of data) {
    const { error } = await supabase.from('clients').insert([record]);
    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully');
    }
  }
}

// Run the insert function
insertData();