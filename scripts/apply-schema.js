#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function applySchema() {
  const client = await pool.connect();
  
  try {
    console.log('📄 Reading outreach-queue-schema.sql...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'outreach-queue-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Applying schema to database...');
    
    // Execute the schema
    await client.query(schemaSQL);
    
    console.log('✅ Schema applied successfully!');
    
    // Test the new functions
    console.log('\n🧪 Testing new functions...');
    
    const testResult = await client.query(`
      SELECT calculate_optimal_send_time('America/Los_Angeles', 'client', 'high') as optimal_time
    `);
    
    console.log('📅 Test optimal time calculation:', testResult.rows[0].optimal_time);
    
    // Check if tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('outreach_queue', 'outreach_history')
    `);
    
    console.log('📋 Created tables:', tablesResult.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  applySchema().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { applySchema };