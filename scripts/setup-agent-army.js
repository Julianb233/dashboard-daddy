const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres'
});

async function setup() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.agent_army (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('commander', 'squad_leader', 'agent')),
        squad TEXT CHECK (squad IN ('Research', 'Development', 'Communications', 'Operations')),
        parent_id UUID REFERENCES public.agent_army(id) ON DELETE SET NULL,
        skills TEXT[] DEFAULT '{}',
        status TEXT DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'busy', 'offline')),
        current_task TEXT,
        performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
        missions_completed INTEGER DEFAULT 0,
        missions_failed INTEGER DEFAULT 0,
        total_uptime INTEGER DEFAULT 0,
        last_active TIMESTAMPTZ DEFAULT NOW(),
        avatar_url TEXT,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table created');

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_army_role ON public.agent_army(role);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_army_squad ON public.agent_army(squad);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_army_status ON public.agent_army(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_agent_army_parent ON public.agent_army(parent_id);`);
    console.log('Indexes created');

    // Enable RLS
    await client.query(`ALTER TABLE public.agent_army ENABLE ROW LEVEL SECURITY;`);
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agent_army' AND policyname = 'Allow all for agent_army') THEN
          CREATE POLICY "Allow all for agent_army" ON public.agent_army FOR ALL USING (true);
        END IF;
      END
      $$;
    `);
    console.log('RLS configured');

    // Create trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_agent_army_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_agent_army_updated_at ON public.agent_army;
      CREATE TRIGGER trigger_update_agent_army_updated_at
        BEFORE UPDATE ON public.agent_army
        FOR EACH ROW
        EXECUTE FUNCTION update_agent_army_updated_at();
    `);
    console.log('Trigger created');

    // Check if we need to seed data
    const countResult = await client.query('SELECT COUNT(*) FROM agent_army');
    if (parseInt(countResult.rows[0].count) === 0) {
      console.log('Seeding initial data...');
      
      // Seed Commander (Bubba)
      const commanderResult = await client.query(`
        INSERT INTO agent_army (name, role, skills, status, current_task, performance_score, missions_completed, description)
        VALUES (
          'Bubba',
          'commander',
          ARRAY['Strategic Planning', 'Resource Allocation', 'Decision Making', 'Team Leadership', 'Performance Monitoring'],
          'active',
          'Coordinating all agent operations',
          98,
          247,
          'Supreme Commander of the Agent Army. Orchestrates all operations and ensures mission success.'
        ) RETURNING id;
      `);
      const commanderId = commanderResult.rows[0].id;
      console.log('Commander created:', commanderId);

      // Seed Squad Leaders
      const leaders = [
        { name: 'Atlas', squad: 'Research', skills: ['Data Analysis', 'Market Research', 'Statistical Analysis', 'Report Writing'], score: 94, missions: 89, desc: 'Research Squad Leader. Specializes in data gathering and analysis.' },
        { name: 'Forge', squad: 'Development', skills: ['Frontend Development', 'Backend Development', 'API Development', 'DevOps'], score: 96, missions: 112, desc: 'Development Squad Leader. Builds and maintains technical infrastructure.' },
        { name: 'Herald', squad: 'Communications', skills: ['Content Writing', 'Social Media', 'Email Marketing', 'Public Relations'], score: 91, missions: 76, desc: 'Communications Squad Leader. Manages all external communications.' },
        { name: 'Sentinel', squad: 'Operations', skills: ['Process Optimization', 'Workflow Management', 'Security Monitoring', 'System Administration'], score: 93, missions: 98, desc: 'Operations Squad Leader. Ensures smooth daily operations.' }
      ];

      const leaderIds = {};
      for (const leader of leaders) {
        const result = await client.query(`
          INSERT INTO agent_army (name, role, squad, parent_id, skills, status, performance_score, missions_completed, description)
          VALUES ($1, 'squad_leader', $2, $3, $4, 'active', $5, $6, $7)
          RETURNING id;
        `, [leader.name, leader.squad, commanderId, leader.skills, leader.score, leader.missions, leader.desc]);
        leaderIds[leader.squad] = result.rows[0].id;
      }
      console.log('Squad leaders created');

      // Seed some agents
      const agents = [
        { name: 'Scout', squad: 'Research', skills: ['Web Scraping', 'Data Collection'], status: 'active', task: 'Scraping competitor websites', score: 88, missions: 45 },
        { name: 'Analyst', squad: 'Research', skills: ['Statistical Analysis', 'Report Writing'], status: 'busy', task: 'Generating Q4 report', score: 92, missions: 67 },
        { name: 'Builder', squad: 'Development', skills: ['Frontend Development', 'React', 'TypeScript'], status: 'active', task: 'Building dashboard components', score: 95, missions: 78 },
        { name: 'Architect', squad: 'Development', skills: ['System Design', 'API Development', 'Database Design'], status: 'active', task: 'Designing new API endpoints', score: 97, missions: 89 },
        { name: 'Writer', squad: 'Communications', skills: ['Content Writing', 'SEO', 'Blog Posts'], status: 'idle', task: null, score: 85, missions: 34 },
        { name: 'Socialite', squad: 'Communications', skills: ['Social Media', 'Community Management'], status: 'active', task: 'Managing Twitter engagement', score: 87, missions: 56 },
        { name: 'Guardian', squad: 'Operations', skills: ['Security Monitoring', 'Incident Response'], status: 'active', task: 'Monitoring system health', score: 94, missions: 112 },
        { name: 'Optimizer', squad: 'Operations', skills: ['Process Optimization', 'Automation'], status: 'busy', task: 'Automating deployment pipeline', score: 91, missions: 67 }
      ];

      for (const agent of agents) {
        await client.query(`
          INSERT INTO agent_army (name, role, squad, parent_id, skills, status, current_task, performance_score, missions_completed)
          VALUES ($1, 'agent', $2, $3, $4, $5, $6, $7, $8);
        `, [agent.name, agent.squad, leaderIds[agent.squad], agent.skills, agent.status, agent.task, agent.score, agent.missions]);
      }
      console.log('Agents created');
    } else {
      console.log('Data already exists, skipping seed');
    }

    console.log('\n✅ Setup complete!');
    
    // Show summary
    const summary = await client.query(`
      SELECT role, COUNT(*) as count 
      FROM agent_army 
      GROUP BY role 
      ORDER BY CASE role WHEN 'commander' THEN 1 WHEN 'squad_leader' THEN 2 ELSE 3 END
    `);
    console.log('\nAgent Army Summary:');
    summary.rows.forEach(row => console.log(`  ${row.role}: ${row.count}`));

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

setup();
