const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const client = await pool.connect();
  try {
    // Drop constraint first
    await client.query(`ALTER TABLE agent_army DROP CONSTRAINT IF EXISTS agent_army_squad_check`);
    console.log('Dropped constraint');
    
    // Update squads to departments
    await client.query(`UPDATE agent_army SET squad = 'Research & Analytics' WHERE squad = 'Research'`);
    await client.query(`UPDATE agent_army SET squad = 'Engineering' WHERE squad = 'Development'`);
    await client.query(`UPDATE agent_army SET squad = 'Marketing & Comms' WHERE squad = 'Communications'`);
    console.log('Updated department names');
    
    // Update squad leaders to real names
    await client.query(`UPDATE agent_army SET name = 'Marcus Chen', description = 'Head of Research & Analytics' WHERE name = 'Atlas'`);
    await client.query(`UPDATE agent_army SET name = 'Sarah Mitchell', description = 'Head of Engineering' WHERE name = 'Forge'`);
    await client.query(`UPDATE agent_army SET name = 'David Park', description = 'Head of Marketing & Communications' WHERE name = 'Herald'`);
    await client.query(`UPDATE agent_army SET name = 'Elena Rodriguez', description = 'Head of Operations' WHERE name = 'Sentinel'`);
    console.log('Updated department heads');
    
    // Update agents to real names
    await client.query(`UPDATE agent_army SET name = 'Alex Turner' WHERE name = 'Scout'`);
    await client.query(`UPDATE agent_army SET name = 'Jordan Lee' WHERE name = 'Cipher'`);
    await client.query(`UPDATE agent_army SET name = 'Maya Johnson' WHERE name = 'Pixel'`);
    await client.query(`UPDATE agent_army SET name = 'Chris Williams' WHERE name = 'Logic'`);
    await client.query(`UPDATE agent_army SET name = 'Emma Davis' WHERE name = 'Echo'`);
    await client.query(`UPDATE agent_army SET name = 'Ryan Thompson' WHERE name = 'Pulse'`);
    await client.query(`UPDATE agent_army SET name = 'Sofia Martinez' WHERE name = 'Warden'`);
    await client.query(`UPDATE agent_army SET name = 'Jake Anderson' WHERE name = 'Shield'`);
    console.log('Updated team member names');
    
    // Get updated data
    const result = await client.query('SELECT name, role, squad FROM agent_army ORDER BY role DESC, squad, name');
    console.log('\n📊 Updated Team Structure:');
    console.log('==========================');
    let currentSquad = '';
    result.rows.forEach(r => {
      if (r.role === 'commander') {
        console.log(`\n👑 COMMANDER: ${r.name}`);
      } else {
        if (r.squad !== currentSquad) {
          currentSquad = r.squad;
          console.log(`\n📁 ${r.squad}:`);
        }
        const icon = r.role === 'squad_leader' ? '  👤' : '    •';
        console.log(`${icon} ${r.name} (${r.role})`);
      }
    });
    
    console.log('\n✅ Team updated with professional names!');
  } finally {
    client.release();
    pool.end();
  }
}

fix().catch(console.error);
