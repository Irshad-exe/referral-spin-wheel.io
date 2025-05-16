// spin.js - Core algorithm for the real spinner

// Supabase configuration
const SUPABASE_URL = 'https://nnqxwcmncytolztvvpvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ucXh3Y21uY3l0b2x6dHZ2cHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDg0MjMsImV4cCI6MjA2MjM4NDQyM30.2Ad2Wv3YC9DwxOG82JBF21BGvkS6gbIFOpPXLCWkdso';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Wheel sections with default probabilities
const sections = [
  { name: 'Red Ladoo', color: 'red', probability: 0.4 },
  { name: 'Yellow Ladoo', color: 'yellow', probability: 0.4 },
  { name: 'Green Ladoo', color: 'green', probability: 0.0 },
  { name: 'Try Again', color: null, probability: 0.2 }
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

// Calculate adjusted probabilities based on client's existing ladoos and referral count
async function calculateProbabilities(clientId) {
  try {
    // Get client's existing ladoos
    const { data: existingLadoos, error: ladooError } = await supabase
      .from('ladoos')
      .select('color')
      .eq('client_id', clientId);
    
    if (ladooError) {
      console.error('Error fetching existing ladoos:', ladooError);
      return [...sections]; // Return default probabilities
    }
    
    // Count existing ladoo colors
    const ladooCounts = { red: 0, yellow: 0, green: 0 };
    if (existingLadoos) {
      existingLadoos.forEach(ladoo => {
        if (ladoo.color) {
          ladooCounts[ladoo.color]++;
        }
      });
    }
    
    // Get referral count for this client
    const { count: referralCount, error: referralError } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', clientId);
    
    if (referralError) {
      console.error('Error counting referrals:', referralError);
      return [...sections]; // Return default probabilities
    }
    
    // Count unique colors the client already has
    const uniqueColors = Object.keys(ladooCounts).filter(color => ladooCounts[color] > 0).length;
    
    let adjustedSections = [...sections];
    
    if (uniqueColors < 2) {
      // Make it easy to get the first two colors
      // Exclude colors they already have
      const hasRed = ladooCounts.red > 0;
      const hasYellow = ladooCounts.yellow > 0;
      
      if (hasRed && !hasYellow) {
        // They have red but not yellow, make yellow more likely
        adjustedSections = [
          { name: 'Red Ladoo', color: 'red', probability: 0.1 },
          { name: 'Yellow Ladoo', color: 'yellow', probability: 0.7 },
          { name: 'Green Ladoo', color: 'green', probability: 0.0 },
          { name: 'Try Again', color: null, probability: 0.2 }
        ];
      } else if (hasYellow && !hasRed) {
        // They have yellow but not red, make red more likely
        adjustedSections = [
          { name: 'Red Ladoo', color: 'red', probability: 0.7 },
          { name: 'Yellow Ladoo', color: 'yellow', probability: 0.1 },
          { name: 'Green Ladoo', color: 'green', probability: 0.0 },
          { name: 'Try Again', color: null, probability: 0.2 }
        ];
      }
      // If they have neither, keep original probabilities for first two colors
    } else if (uniqueColors === 2) {
      // They have both red and yellow
      
      // Only enable green if they have 7+ referrals
      if (referralCount >= 7) {
        // Calculate probability for green based on referral count
        // At 7 referrals: 5% chance
        // At 10+ referrals: 20% chance
        const greenProbability = Math.min(0.05 + (referralCount - 7) * 0.05, 0.2);
        
        adjustedSections = [
          { name: 'Red Ladoo', color: 'red', probability: 0.1 },
          { name: 'Yellow Ladoo', color: 'yellow', probability: 0.1 },
          { name: 'Green Ladoo', color: 'green', probability: greenProbability },
          { name: 'Try Again', color: null, probability: 0.8 - greenProbability }
        ];
      } else {
        // Not enough referrals for green
        adjustedSections = [
          { name: 'Red Ladoo', color: 'red', probability: 0.1 },
          { name: 'Yellow Ladoo', color: 'yellow', probability: 0.1 },
          { name: 'Green Ladoo', color: 'green', probability: 0.0 },
          { name: 'Try Again', color: null, probability: 0.8 }
        ];
      }
    }
    
    return adjustedSections;
  } catch (error) {
    console.error('Error calculating probabilities:', error);
    return [...sections]; // Return default probabilities
  }
}

// Get a random section based on probabilities
function getRandomSection(sectionsArray) {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const section of sectionsArray) {
    cumulativeProbability += section.probability;
    if (random <= cumulativeProbability) {
      return section;
    }
  }
  
  return sectionsArray[sectionsArray.length - 1];
}

// Spin the wheel
async function spinWheel() {
  // Disable spin button
  document.getElementById('spin-btn').disabled = true;
  
  // Check token and get spin data
  const spin = await checkToken();
  if (!spin) {
    document.getElementById('spin-btn').disabled = false;
    return;
  }
  
  // Get client ID from the spin data
  const clientId = spin.referrals.referrer_id;
  
  // Calculate adjusted probabilities
  const adjustedSections = await calculateProbabilities(clientId);
  
  // Determine the winning section
  const winningSection = getRandomSection(adjustedSections);
  
  // Calculate the rotation angle
  const sectionAngle = 360 / sections.length;
  const sectionIndex = sections.findIndex(s => s.name === winningSection.name);
  const rotationAngle = 1800 + (sectionIndex * sectionAngle);
  
  // Animate the wheel
  const wheel = document.getElementById('wheel');
  wheel.style.transform = `rotate(${rotationAngle}deg)`;
  
  // Wait for animation to finish
  setTimeout(async () => {
    try {
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
            client_id: clientId,
            color: winningSection.color,
            created_at: new Date().toISOString()
          }]);
      }
      
      // Show result
      showResult(winningSection);
    } catch (error) {
      console.error('Error updating spin result:', error);
      showError('Error saving your result. Please try again.');
    } finally {
      // Re-enable spin button
      document.getElementById('spin-btn').disabled = false;
    }
  }, 5000);
}

// Show the result
function showResult(section) {
  const resultContainer = document.getElementById('result');
  const resultText = document.getElementById('result-text');
  const ladooContainer = document.getElementById('result-ladoo-container');
  
  if (section.color) {
    resultText.textContent = `Congratulations! You won a ${section.name}!`;
    
    const ladoo = document.createElement('div');
    ladoo.className = `ladoo ladoo-${section.color}`;
    ladooContainer.innerHTML = '';
    ladooContainer.appendChild(ladoo);
    
    resultContainer.className = 'result-container success';
  } else {
    resultText.textContent = 'Better luck next time!';
    ladooContainer.innerHTML = '';
    resultContainer.className = 'result-container try-again';
  }
  
  resultContainer.style.display = 'block';
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
