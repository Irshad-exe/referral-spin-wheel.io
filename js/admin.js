const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch data from Supabase
async function fetchData() {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
        console.error('Error fetching data:', error);
        return;
    }
    populateTable(data);
}

// Populate table with data
function populateTable(data) {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing data

    data.forEach(client => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = client.name;
        row.insertCell(1).textContent = client.contact_info;
        row.insertCell(2).textContent = client.ladoo_count;
        row.insertCell(3).textContent = client.email;
        row.insertCell(4).textContent = client.ucc;
        row.insertCell(5).textContent = new Date(client.created_at).toLocaleString();
    });
}

// Add search functionality
document.getElementById('search').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    const rows = document.querySelectorAll('#data-table tbody tr');

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const ucc = row.cells[4].textContent.toLowerCase();
        row.style.display = name.includes(searchTerm) || ucc.includes(searchTerm) ? '' : 'none';
    });
});

// Fetch and display data on page load
fetchData();