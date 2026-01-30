import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  try {
    // Try to insert a test record first to see if table exists
    const { error: testError } = await supabase.from('approvals').select('id').limit(1);
    
    if (testError && testError.code === '42P01') {
      console.log('Approvals table does not exist. Please create it in Supabase SQL editor with:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.approvals (
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
INSERT INTO public.approvals (title, description, requester, priority) VALUES
('Deploy Dashboard to Production', 'Ready to deploy the new dashboard features', 'Julian', 'high'),
('Linear Project Budget Approval', 'Need approval for additional Linear seats', 'Bubba', 'medium'),  
('API Rate Limit Increase', 'Request higher rate limits for Clawdbot', 'System', 'low');
      `);
    } else if (testError) {
      console.error('Other error:', testError);
    } else {
      console.log('✅ Approvals table already exists!');
      
      // Insert sample data if it doesn't exist
      const { data: existing } = await supabase.from('approvals').select('id');
      if (!existing || existing.length === 0) {
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
          console.log('✅ Sample data inserted!');
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

createTable();