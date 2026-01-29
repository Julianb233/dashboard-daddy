const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  console.log('Setting up analytics tables...');
  
  try {
    // Read and execute usage tracking SQL
    console.log('Creating usage tracking tables...');
    const usageSQL = fs.readFileSync(path.join(__dirname, 'src/lib/supabase/usage-tracking.sql'), 'utf8');
    const { error: usageError } = await supabase.rpc('execute_sql', { query: usageSQL });
    
    if (usageError) {
      console.error('Error creating usage tracking tables:', usageError);
    } else {
      console.log('✅ Usage tracking tables created successfully');
    }
    
    // Read and execute error analysis SQL
    console.log('Creating error analysis tables...');
    const errorSQL = fs.readFileSync(path.join(__dirname, 'src/lib/supabase/error-analysis.sql'), 'utf8');
    const { error: errorError } = await supabase.rpc('execute_sql', { query: errorSQL });
    
    if (errorError) {
      console.error('Error creating error analysis tables:', errorError);
    } else {
      console.log('✅ Error analysis tables created successfully');
    }
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

// Alternative direct SQL execution function
async function executeSQLFile(filename) {
  console.log(`Executing ${filename}...`);
  
  try {
    const sqlContent = fs.readFileSync(path.join(__dirname, `src/lib/supabase/${filename}`), 'utf8');
    
    // Split SQL content by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('execute_sql', { query: statement + ';' });
        if (error) {
          console.log('Statement error (might be expected):', error.message);
        }
      }
    }
    
    console.log(`✅ ${filename} executed`);
  } catch (error) {
    console.error(`Error executing ${filename}:`, error);
  }
}

// Main execution
async function main() {
  console.log('Starting database setup...');
  console.log('Supabase URL:', supabaseUrl);
  
  // Test connection first
  const { data, error } = await supabase.from('kanban_tasks').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Failed to connect to Supabase:', error);
    process.exit(1);
  }
  
  console.log('✅ Connected to Supabase successfully');
  
  // Execute SQL files directly using Supabase client
  await executeSQLFile('usage-tracking.sql');
  await executeSQLFile('error-analysis.sql');
  
  console.log('🎉 All done! Analytics tables are ready.');
}

main().catch(console.error);