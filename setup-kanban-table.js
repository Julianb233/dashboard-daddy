const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: './dashboard/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupKanbanTable() {
  try {
    console.log('Setting up kanban_tasks table...');
    
    const sql = fs.readFileSync('./dashboard/lib/supabase/kanban-tasks.sql', 'utf8');
    
    // Note: The anon key might not have permission to run DDL statements
    // This might fail, in which case we'll need to run the SQL manually in Supabase dashboard
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error setting up table:', error);
      console.log('Please run the SQL manually in the Supabase dashboard:');
      console.log(sql);
    } else {
      console.log('Table setup successful!');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

setupKanbanTable();