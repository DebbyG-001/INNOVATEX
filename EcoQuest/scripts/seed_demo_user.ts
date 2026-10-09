import { toKobo } from '../src/lib/money';

const API_URL = 'http://127.0.0.1:8000/api';

async function seed() {
  console.log('🌱 Seeding demo user...');
  
  try {
    // 1. Register User
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo User',
        email: 'demo@ecoquest.app',
        password: 'password123',
        confirm_password: 'password123'
      })
    });
    
    const regData = await regRes.json();
    if (!regRes.ok) {
      if (regRes.status === 400 && regData.detail?.includes('already exists')) {
        console.log('✅ Demo user already exists.');
        return;
      }
      throw new Error(`Failed to register: ${JSON.stringify(regData)}`);
    }
    
    const token = regData.access_token;
    console.log('✅ Demo user created successfully!');
    
    // 2. Fetch Accounts
    const accRes = await fetch(`${API_URL}/accounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const accounts = await accRes.json();
    
    // 3. Add Funds
    for (const acc of accounts) {
      if (acc.account_type === 'savings') {
        console.log('💰 Adding ₦250,000 to Savings Account...');
        await fetch(`${API_URL}/accounts/funds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            account_id: acc.id,
            amount: toKobo(250000),
            source: 'System Seeder'
          })
        });
      } else if (acc.account_type === 'current') {
        console.log('💰 Adding ₦50,000 to Current Account...');
        await fetch(`${API_URL}/accounts/funds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            account_id: acc.id,
            amount: toKobo(50000),
            source: 'System Seeder'
          })
        });
      }
    }
    
    // 4. Submit Onboarding Profile
    console.log('📝 Submitting demo onboarding profile...');
    await fetch(`${API_URL}/onboarding/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        occupation: 'Student',
        income_stability: 'variable',
        monthly_target: toKobo(30000),
        active_accounts: 2,
        has_emergency_savings: false,
        goals: []
      })
    });

    console.log('✨ Seeding complete! Login with:');
    console.log('   Email: demo@ecoquest.app');
    console.log('   Password: password123');
    
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();
