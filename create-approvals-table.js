const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './frontend/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createApprovalsTable() {
  try {
    // Use Supabase's RPC to execute raw SQL
    const { data, error } = await supabase.rpc('create_approvals_table', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS approvals (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          requester VARCHAR(100),
          status VARCHAR(50) DEFAULT 'pending',
          priority VARCHAR(20) DEFAULT 'medium',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          metadata JSONB
        );
      `
    });

    if (error) {
      console.error('Error creating table:', error);
      
      // Try alternative approach - create via insert and handle error
      const testInsert = await supabase.from('approvals').insert({
        title: 'Test Approval',
        description: 'Test approval item',
        requester: 'System'
      });
      
      if (testInsert.error && testInsert.error.code === '42P01') {
        console.log('\nTable does not exist. Please create it manually in Supabase SQL editor:');
        console.log(`
CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requester VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Insert sample data
INSERT INTO approvals (title, description, requester, priority) VALUES
('Deploy Dashboard to Production', 'Ready to deploy the new dashboard features', 'Julian', 'high'),
('Linear Project Budget Approval', 'Need approval for additional Linear seats', 'Bubba', 'medium'),
('API Rate Limit Increase', 'Request higher rate limits for Clawdbot', 'System', 'low');
        `);
        return;
      }
    }

    // Insert sample data
    const { error: insertError } = await supabase.from('approvals').insert([
      {
        title: 'Deploy Dashboard to Production',
        description: 'Ready to deploy the new dashboard features',
        requester: 'Julian',
        priority: 'high'
      },
      {
        title: 'Linear Project Budget Approval', 
        description: 'Need approval for additional Linear seats',
        requester: 'Bubba',
        priority: 'medium'
      },
      {
        title: 'API Rate Limit Increase',
        description: 'Request higher rate limits for Clawdbot',
        requester: 'System',
        priority: 'low'
      }
    ]);

    if (insertError) {
      console.error('Error inserting sample data:', insertError);
    } else {
      console.log('✅ Approvals table created and sample data inserted!');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

createApprovalsTable();