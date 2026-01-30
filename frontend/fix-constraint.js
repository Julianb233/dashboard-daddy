const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const client = await pool.connect();
  try {
    // Drop old constraint
    await client.query(`ALTER TABLE agent_army DROP CONSTRAINT IF EXISTS agent_army_squad_check`);
    
    // Add new constraint with department names
    await client.query(`ALTER TABLE agent_army ADD CONSTRAINT agent_army_squad_check 
      CHECK (squad IS NULL OR squad IN ('Research & Analytics', 'Engineering', 'Marketing & Comms', 'Operations'))`);
    
    // Now update the data
    await client.query(`UPDATE agent_army SET squad = 'Research & Analytics' WHERE squad = 'Research'`);
    await client.query(`UPDATE agent_army SET squad = 'Engineering' WHERE squad = 'Development'`);
    await client.query(`UPDATE agent_army SET squad = 'Marketing & Comms' WHERE squad = 'Communications'`);
    
    // Update squad leaders to real names
    await client.query(`UPDATE agent_army SET name = 'Marcus Chen', description = 'Head of Research & Analytics' WHERE name = 'Atlas'`);
    await client.query(`UPDATE agent_army SET name = 'Sarah Mitchell', description = 'Head of Engineering' WHERE name = 'Forge'`);
    await client.query(`UPDATE agent_army SET name = 'David Park', description = 'Head of Marketing & Communications' WHERE name = 'Herald'`);
    await client.query(`UPDATE agent_army SET name = 'Elena Rodriguez', description = 'Head of Operations' WHERE name = 'Sentinel'`);
    
    // Update agents to real names
    await client.query(`UPDATE agent_army SET name = 'Alex Turner' WHERE name = 'Scout'`);
    await client.query(`UPDATE agent_army SET name = 'Jordan Lee' WHERE name = 'Cipher'`);
    await client.query(`UPDATE agent_army SET name = 'Maya Johnson' WHERE name = 'Pixel'`);
    await client.query(`UPDATE agent_army SET name = 'Chris Williams' WHERE name = 'Logic'`);
    await client.query(`UPDATE agent_army SET name = 'Emma Davis' WHERE name = 'Echo'`);
    await client.query(`UPDATE agent_army SET name = 'Ryan Thompson' WHERE name = 'Pulse'`);
    await client.query(`UPDATE agent_army SET name = 'Sofia Martinez' WHERE name = 'Warden'`);
    await client.query(`UPDATE agent_army SET name = 'Jake Anderson' WHERE name = 'Shield'`);
    
    // Get updated data
    const result = await client.query('SELECT name, role, squad FROM agent_army ORDER BY role DESC, squad, name');
    console.log('Updated Team Structure:');
    console.log('========================');
    result.rows.forEach(r => {
      const dept = r.squad || '(Commander)';
      console.log(`  ${r.name} - ${r.role} - ${dept}`);
    });
    
    console.log('\n✅ Updated to departments & professional names!');
  } finally {
    client.release();
    pool.end();
  }
}

fix().catch(console.error);
