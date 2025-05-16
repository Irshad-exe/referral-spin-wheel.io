// js/clients.js

// Load all clients
async function loadClients() {
  showLoading(true);
  
  try {
    // Get clients data
    const { data: clients, error } = await auth.supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get referral counts for each client
    const referralCounts = await getClientReferralCounts();
    
    // Get ladoo counts for each client
    const ladooCounts = await getClientLadooCounts();
    
    displayClients(clients, referralCounts, ladooCounts);
  } catch (error) {
    console.error('Error loading clients:', error);
    showAlert('Error loading clients: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// Get referral counts for all clients
async function getClientReferralCounts() {
  try {
    const { data: referrals, error } = await auth.supabase
      .from('referrals')
      .select('referrer_id');
    
    if (error) throw error;
    
    // Count referrals by referrer_id
    const counts = {};
    referrals.forEach(ref => {
      if (ref.referrer_id) {
        counts[ref.referrer_id] = (counts[ref.referrer_id] || 0) + 1;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting referral counts:', error);
    return {};
  }
}

// Get ladoo counts for all clients
async function getClientLadooCounts() {
  try {
    const { data: ladoos, error } = await auth.supabase
      .from('ladoos')
      .select('client_id, color');
    
    if (error) throw error;
    
    // Group ladoos by client_id and color
    const counts = {};
    ladoos.forEach(ladoo => {
      if (!counts[ladoo.client_id]) {
        counts[ladoo.client_id] = { red: 0, yellow: 0, green: 0, total: 0 };
      }
      
      if (ladoo.color) {
        counts[ladoo.client_id][ladoo.color]++;
        counts[ladoo.client_id].total++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting ladoo counts:', error);
    return {};
  }
}

// Display clients in the table
function displayClients(clients, referralCounts, ladooCounts) {
  const tbody = document.getElementById('clients-tbody');
  tbody.innerHTML = '';
  
  if (!clients || clients.length === 0) {
    document.getElementById('no-results').style.display = 'block';
    document.getElementById('clients-table').style.display = 'none';
    return;
  }
  
  document.getElementById('no-results').style.display = 'none';
  document.getElementById('clients-table').style.display = 'table';
  
  clients.forEach(client => {
    const row = document.createElement('tr');
    
    // Get referral count
    const referralCount = referralCounts[client.id] || 0;
    
    // Get ladoo count
    const ladooCount = ladooCounts[client.id] || { red: 0, yellow: 0, green: 0, total: 0 };
    
    // Create ladoo display
    const ladooDisplay = `
      <div class="d-flex align-center">
        <span>${ladooCount.total}</span>
        ${ladooCount.red ? `<span class="ladoo ladoo-red" title="Red: ${ladooCount.red}"></span>` : ''}
        ${ladooCount.yellow ? `<span class="ladoo ladoo-yellow" title="Yellow: ${ladooCount.yellow}"></span>` : ''}
        ${ladooCount.green ? `<span class="ladoo ladoo-green" title="Green: ${ladooCount.green}"></span>` : ''}
      </div>
    `;
    
    row.innerHTML = `
      <td>${escapeHtml(client.name || '')}</td>
      <td>${escapeHtml(client.email || '')}</td>
      <td>${escapeHtml(client.ucc || '')}</td>
      <td>${escapeHtml(client.contact_info || '')}</td>
      <td>${ladooDisplay}</td>
      <td>${referralCount}</td>
      <td>
        <button class="btn btn-outline-primary" onclick="viewClient('${client.id}')">View</button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// View client details
function viewClient(clientId) {
  // Implement client view functionality
  console.log('View client:', clientId);
}

// Search clients
function searchClients() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const rows = document.querySelectorAll('#clients-tbody tr');
  let matchFound = false;
  
  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const email = row.cells[1].textContent.toLowerCase();
    const ucc = row.cells[2].textContent.toLowerCase();
    const contact = row.cells[3].textContent.toLowerCase();
    
    if (name.includes(searchTerm) || 
        email.includes(searchTerm) || 
        ucc.includes(searchTerm) || 
        contact.includes(searchTerm)) {
      row.style.display = '';
      matchFound = true;
    } else {
      row.style.display = 'none';
    }
  });
  
  document.getElementById('no-results').style.display = matchFound ? 'none' : 'block';
}

// Show loading state
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Add event listeners
document.getElementById('search-btn').addEventListener('click', searchClients);
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchClients();
  }
});
