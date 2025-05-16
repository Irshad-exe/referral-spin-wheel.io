// js/spin.js

// Supabase configuration
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Wheel sections
const sections = [
  { name: 'Red Ladoo', color: 'red', probability: 0.25 },
  { name: 'Yellow Ladoo', color: 'yellow', probability: 0.25 },
  { name: 'Green Ladoo', color: 'green', probability: 0.25 },
  { name: 'Try Again', color: null, probability: 0.25 }
];

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Check if token is valid
async function checkToken() {
  if (!token) {
    showError('Invalid or missing token');
    return false;
  }
  
  try {
    // Check if token exists and hasn't been used
    const { data: spin, error } = await supabase
      .from('spins')
      .select('*, referrals(referrer_id)')
      .eq('token', token)
      .eq('used', false)
      .single();
    
    if (error || !spin) {
      showError('This spin link has expired or already been used');
      return false;
    }
    
    return spin;
  } catch (error) {
    console.error('Error checking token:', error);
    showError('Error validating your spin token');
    return false;
  }
}

// Spin the wheel
async function spinWheel() {
  const spin = await checkToken();
  if (!spin) return;
  
  // Disable spin button
  document.getElementById('spin-btn').disabled = true;
  
  // Determine the winning section based on probabilities
  const winningSection = getRandomSection();
  
  // Calculate the rotation angle
  const sectionAngle = 360 / sections.length;
  const sectionIndex = sections.findIndex(s => s.name === winningSection.name);
  const rotationAngle = 1800 + (sectionIndex * sectionAngle);
  
  // Animate the wheel
  const wheel = document.getElementById('wheel');
  wheel.style.transform = `rotate(${rotationAngle}deg)`;
  
  // Wait for animation to finish
  setTimeout(async () => {
    // Show result
    showResult(winningSection);
    
    // Mark spin as used
    await supabase
      .from('spins')
      .update({ used: true })
      .eq('token', token);
    
    // If won a ladoo, add it to the database
    if (winningSection.color) {
      await supabase
        .from('ladoos')
        .insert([{
          client_id: spin.referrals.referrer_id,
          color: winningSection.color,
          created_at: new Date().toISOString()
        }]);
    }
  }, 5000);
}

// Get a random section based on probabilities
function getRandomSection() {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const section of sections) {
    cumulativeProbability += section.probability;
    if (random <= cumulativeProbability) {
      return section;
    }
  }
  
  return sections[sections.length - 1];
}

// Show the result
function showResult(section) {
  const resultText = document.getElementById('result-text');
  const ladooContainer = document.getElementById('ladoo-container');
  
  if (section.color) {
    resultText.textContent = `Congratulations! You won a ${section.name}!`;
    
    const ladoo = document.createElement('div');
    ladoo.className = `ladoo ladoo-${section.color}`;
    ladoo.style.width = '100px';
    ladoo.style.height = '100px';
    ladooContainer.appendChild(ladoo);
  } else {
    resultText.textContent = 'Better luck next time!';
  }
  
  document.getElementById('result').style.display = 'block';
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  document.getElementById('spin-btn').style.display = 'none';
}

// Add event listener to spin button
document.getElementById('spin-btn').addEventListener('click', spinWheel);

// Check token on page load
document.addEventListener('DOMContentLoaded', async () => {
  const spin = await checkToken();
  if (!spin) {
    document.getElementById('spin-btn').style.display = 'none';
  }
});
