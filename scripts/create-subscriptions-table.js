const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createSubscriptionsTable() {
  try {
    console.log('Creating subscriptions table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL, -- AI, Hosting, Tools, etc
        monthly_cost DECIMAL(10, 2) NOT NULL,
        billing_cycle VARCHAR(50) DEFAULT 'monthly', -- monthly, yearly, one-time
        next_renewal DATE,
        usage_limit INTEGER,
        current_usage INTEGER DEFAULT 0,
        usage_unit VARCHAR(50), -- API calls, GB, users, etc
        status VARCHAR(50) DEFAULT 'active', -- active, cancelled, trial, expired
        notes TEXT,
        url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create index for faster queries
      CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_next_renewal ON subscriptions(next_renewal);
    `;

    await pool.query(createTableQuery);
    console.log('✅ Subscriptions table created successfully');

    // Insert initial subscriptions
    console.log('Inserting initial subscriptions...');
    
    const insertQuery = `
      INSERT INTO subscriptions (name, provider, category, monthly_cost, billing_cycle, next_renewal, usage_limit, usage_unit, status, notes, url) 
      VALUES 
        ('Claude API', 'Anthropic', 'AI', 20.00, 'monthly', '2025-02-28', 1000000, 'tokens', 'active', 'AI Assistant API', 'https://console.anthropic.com'),
        ('GPT-4 API', 'OpenAI', 'AI', 25.00, 'monthly', '2025-03-15', 500000, 'tokens', 'active', 'OpenAI API access', 'https://platform.openai.com'),
        ('Voice Generation', 'ElevenLabs', 'AI', 22.00, 'monthly', '2025-02-20', 100000, 'characters', 'active', 'Voice cloning and TTS', 'https://elevenlabs.io'),
        ('Database & Auth', 'Supabase', 'Hosting', 25.00, 'monthly', '2025-03-01', 10000000, 'rows', 'active', 'Postgres database with auth', 'https://supabase.com'),
        ('Frontend Hosting', 'Vercel', 'Hosting', 20.00, 'monthly', '2025-02-25', 100, 'deployments', 'active', 'Next.js hosting platform', 'https://vercel.com'),
        ('CDN & DNS', 'Cloudflare', 'Hosting', 20.00, 'monthly', '2025-03-10', 100000000, 'requests', 'active', 'CDN, DNS, and security', 'https://cloudflare.com'),
        ('Project Management', 'Linear', 'Tools', 8.00, 'monthly', '2025-02-27', 10, 'users', 'active', 'Issue tracking and project management', 'https://linear.app'),
        ('Knowledge Base', 'Notion', 'Tools', 10.00, 'monthly', '2025-03-05', 5, 'users', 'active', 'Documentation and knowledge management', 'https://notion.so');
    `;

    await pool.query(insertQuery);
    console.log('✅ Initial subscriptions inserted successfully');

    // Query to verify data
    const result = await pool.query('SELECT * FROM subscriptions ORDER BY category, name');
    console.log(`\n📊 Total subscriptions: ${result.rows.length}`);
    
    result.rows.forEach(sub => {
      console.log(`- ${sub.name} (${sub.provider}) - $${sub.monthly_cost}/mo - ${sub.status}`);
    });

  } catch (error) {
    console.error('❌ Error creating subscriptions table:', error);
  } finally {
    await pool.end();
  }
}

createSubscriptionsTable();