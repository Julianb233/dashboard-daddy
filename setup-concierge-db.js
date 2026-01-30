const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://db.jrirksdiklqwsaatbhvg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaXJrc2RpbGx3c2FhdGJodmciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM3NzQzNDkyLCJleHAiOjIwNTMzMTk0OTJ9.qbw8g-zHQg_HDjm2ZklWa7cgx8A9SXYP3CkKfgvyA8Y'
);

async function createTables() {
  console.log('Setting up Concierge database tables...');

  try {
    // Create food_orders table
    console.log('Creating food_orders table...');
    await supabase.from('food_orders').select('id').limit(1);
  } catch (error) {
    if (error.code === '42P01') { // Table doesn't exist
      console.log('Table food_orders does not exist, creating...');
      // We'll need to use the SQL directly since the table doesn't exist yet
    }
  }

  // Since we can't execute arbitrary SQL without access to the SQL editor,
  // Let's create test data and see if we can access the database at all
  
  try {
    // Test connection
    const { data, error } = await supabase.from('tasks').select('id').limit(1);
    if (error) {
      console.error('Database connection error:', error);
      return;
    }
    console.log('✓ Connected to database successfully');

    // Try to create the tables using Supabase client
    console.log('Creating concierge tables...');
    
    // Note: Since we can't create tables directly via the JS client,
    // we need to run the SQL in the Supabase dashboard
    console.log(`
🎯 MANUAL SETUP REQUIRED:

Please copy and paste the SQL from 'create-food-orders-table.sql' into your Supabase SQL editor:

1. Go to https://supabase.com/dashboard/project/jrirksdiklqwsaatbhvg/sql
2. Create a new query
3. Copy the contents of 'create-food-orders-table.sql'
4. Run the query

Tables to be created:
- food_orders
- restaurant_favorites  
- restaurant_call_logs
- user_food_preferences

After running the SQL, the concierge system will be fully functional.
    `);

    // Test if the tables already exist by trying to insert sample data
    try {
      const testInsert = await supabase
        .from('user_food_preferences')
        .insert([{
          preference_type: 'test',
          preference_value: 'test',
          is_active: false
        }])
        .select();
        
      if (testInsert.data) {
        console.log('✓ Tables already exist and are working!');
        // Clean up test data
        await supabase
          .from('user_food_preferences')
          .delete()
          .eq('preference_type', 'test');
      }
    } catch (tableError) {
      console.log('ℹ️ Tables need to be created manually (see instructions above)');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();