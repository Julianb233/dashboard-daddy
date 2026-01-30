const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  const client = await pool.connect();
  try {
    // Update remaining fantasy names to real names
    await client.query(`UPDATE agent_army SET name = 'James Wilson' WHERE name = 'Architect'`);
    await client.query(`UPDATE agent_army SET name = 'Kevin Brown' WHERE name = 'Builder'`);
    await client.query(`UPDATE agent_army SET name = 'Olivia Scott' WHERE name = 'Socialite'`);
    await client.query(`UPDATE agent_army SET name = 'Nathan Reed' WHERE name = 'Writer'`);
    await client.query(`UPDATE agent_army SET name = 'Rachel Kim' WHERE name = 'Guardian'`);
    await client.query(`UPDATE agent_army SET name = 'Michael Torres' WHERE name = 'Optimizer'`);
    await client.query(`UPDATE agent_army SET name = 'Lisa Chang' WHERE name = 'Analyst'`);
    
    // Get final structure
    const result = await client.query('SELECT name, role, squad FROM agent_army ORDER BY role DESC, squad, name');
    console.log('📊 Final Team Structure:');
    console.log('========================');
    let currentSquad = '';
    result.rows.forEach(r => {
      if (r.role === 'commander') {
        console.log(`\n👑 COMMANDER: ${r.name}`);
      } else {
        if (r.squad !== currentSquad) {
          currentSquad = r.squad;
          console.log(`\n📁 ${r.squad}:`);
        }
        const icon = r.role === 'squad_leader' ? '  👤 HEAD:' : '    •';
        console.log(`${icon} ${r.name}`);
      }
    });
    
    console.log('\n✅ All names updated!');
  } finally {
    client.release();
    pool.end();
  }
}

fix().catch(console.error);
