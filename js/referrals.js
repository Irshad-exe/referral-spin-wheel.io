// js/referrals.js

// Load all clients for the dropdown
async function loadClients() {
  try {
    const { data: clients, error } = await auth.supabase
      .from('clients')
      .select('id, name, ucc')
      .order('name');
    
    if (error) throw error;
    
    const select = document.getElementById('referrer');
    
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = `${client.name} (${client.ucc})`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading clients:', error);
    showError('Error loading clients: ' + error.message);
  }
}

// Create a new referral
async function createReferral(event) {
  event.preventDefault();
  
  const referrerId = document.getElementById('referrer').value;
  const newClientName = document.getElementById('new-client-name').value;
  const newClientEmail = document.getElementById('new-client-email').value;
  const newClientContact = document.getElementById('new-client-contact').value;
  const newClientUcc = document.getElementById('new-client-ucc').value;
  
  if (!referrerId || !newClientName || !newClientEmail || !newClientContact || !newClientUcc) {
    showError('Please fill in all fields');
    return;
  }
  
  try {
    // 1. Create the new client
    const { data: newClient, error: clientError } = await auth.supabase
      .from('clients')
      .insert([{
        name: newClientName,
        email: newClientEmail,
        contact_info: newClientContact,
        ucc: newClientUcc,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (clientError) throw clientError;
    
    // 2. Create the referral record
    const { data: referral, error: referralError } = await auth.supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId,
        referred_id: newClient.id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (referralError) throw referralError;
    
    // 3. Generate a unique spin token
    const spinToken = generateUniqueToken();
    
    // 4. Create a spin record
    const { data: spin, error: spinError } = await auth.supabase
      .from('spins')
      .insert([{
        referral_id: referral.id,
        client_id: referrerId,
        token: spinToken,
        used: false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (spinError) throw spinError;
    
    // 5. Show success message with spin link
    const spinLink = auth.generateSpinUrl(spinToken);
    document.getElementById('spin-link').value = spinLink;
    document.getElementById('success-message').style.display = 'block';
    document.getElementById('referral-form').reset();
    
  } catch (error) {
    console.error('Error creating referral:', error);
    showError('Error creating referral: ' + error.message);
  }
}

// Generate a unique token for the spin link
function generateUniqueToken() {
  return 'spin_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

// Copy spin link to clipboard
document.getElementById('copy-link-btn').addEventListener('click', () => {
  const spinLink = document.getElementById('spin-link');
  spinLink.select();
  document.execCommand('copy');
  
  const copyBtn = document.getElementById('copy-link-btn');
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
});

// Form submission
document.getElementById('referral-form').addEventListener('submit', createReferral);
