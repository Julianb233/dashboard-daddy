const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://db.jrirksdiklqwsaatbhvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaXJrc2Rpa2xxd3NhYXRiaHZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzUxOTIzMCwiZXhwIjoyMDUzMDk1MjMwfQ.NjJJMqeE7yzLOQ5r9QKfqSVL7RvUu8uh3lGKm5RKlGA'; // This is a service role key for full access

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAgentArmyTable() {
  try {
    console.log('Setting up Agent Army table...');

    // Drop existing table if it exists
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS agent_army CASCADE;'
    });
    
    if (dropError) {
      console.log('Note: Could not drop existing table (may not exist)');
    }

    // Create the table
    const createTableSQL = `
      CREATE TABLE agent_army (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('commander', 'squad_leader', 'agent')),
          squad VARCHAR(50),
          parent_id UUID REFERENCES agent_army(id),
          skills TEXT[],
          status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'busy', 'offline')),
          current_task TEXT,
          performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
          missions_completed INTEGER DEFAULT 0,
          missions_failed INTEGER DEFAULT 0,
          total_uptime INTEGER DEFAULT 0,
          last_active TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          avatar_url TEXT,
          description TEXT,
          success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
              CASE 
                  WHEN (missions_completed + missions_failed) = 0 THEN 100.0
                  ELSE ROUND((missions_completed::DECIMAL / (missions_completed + missions_failed)) * 100, 2)
              END
          ) STORED
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.error('Error creating table:', createError);
      return;
    }

    console.log('✅ Table created successfully');

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_agent_army_role ON agent_army(role);
      CREATE INDEX IF NOT EXISTS idx_agent_army_squad ON agent_army(squad);
      CREATE INDEX IF NOT EXISTS idx_agent_army_status ON agent_army(status);
      CREATE INDEX IF NOT EXISTS idx_agent_army_parent_id ON agent_army(parent_id);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexes
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }

    // Create trigger function
    const createTrigger = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_agent_army_updated_at 
          BEFORE UPDATE ON agent_army 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: createTrigger
    });

    if (triggerError) {
      console.error('Error creating trigger:', triggerError);
    } else {
      console.log('✅ Trigger created successfully');
    }

    // Insert sample data using direct insert
    console.log('Inserting sample data...');

    // Insert Commander Bubba
    const { data: commander, error: commanderError } = await supabase
      .from('agent_army')
      .insert({
        name: 'Bubba',
        role: 'commander',
        squad: null,
        skills: ['Strategic Planning', 'Team Coordination', 'Decision Making', 'AI Orchestration', 'Problem Solving'],
        status: 'active',
        current_task: 'Overseeing Agent Army Operations',
        description: 'Main AI Commander responsible for strategic planning and agent coordination across all squads.',
        performance_score: 98,
        missions_completed: 157
      })
      .select()
      .single();

    if (commanderError) {
      console.error('Error inserting commander:', commanderError);
      return;
    }

    console.log('✅ Commander Bubba inserted');

    // Insert Squad Leaders
    const squadLeaders = [
      {
        name: 'Alpha',
        role: 'squad_leader',
        squad: 'Research',
        parent_id: commander.id,
        skills: ['Data Analysis', 'Research Methodology', 'Report Generation', 'Information Synthesis'],
        status: 'active',
        current_task: 'Market Research Initiative',
        description: 'Research Squad Leader specializing in data analysis and competitive intelligence.',
        performance_score: 94,
        missions_completed: 89
      },
      {
        name: 'Beta',
        role: 'squad_leader',
        squad: 'Development',
        parent_id: commander.id,
        skills: ['Code Architecture', 'Project Management', 'Quality Assurance', 'Technical Leadership'],
        status: 'busy',
        current_task: 'Dashboard Daddy Enhancement',
        description: 'Development Squad Leader overseeing all coding and software projects.',
        performance_score: 96,
        missions_completed: 112
      },
      {
        name: 'Gamma',
        role: 'squad_leader',
        squad: 'Communications',
        parent_id: commander.id,
        skills: ['Content Creation', 'Social Media', 'Customer Relations', 'Brand Management'],
        status: 'active',
        current_task: 'Content Calendar Planning',
        description: 'Communications Squad Leader managing all external and internal communications.',
        performance_score: 92,
        missions_completed: 76
      },
      {
        name: 'Delta',
        role: 'squad_leader',
        squad: 'Operations',
        parent_id: commander.id,
        skills: ['Process Optimization', 'Workflow Management', 'System Administration', 'Performance Monitoring'],
        status: 'idle',
        current_task: 'System Health Monitoring',
        description: 'Operations Squad Leader ensuring smooth daily operations and system performance.',
        performance_score: 97,
        missions_completed: 134
      }
    ];

    const { error: leadersError } = await supabase
      .from('agent_army')
      .insert(squadLeaders);

    if (leadersError) {
      console.error('Error inserting squad leaders:', leadersError);
      return;
    }

    console.log('✅ Squad leaders inserted');

    // Get squad leader IDs for agent insertion
    const { data: leaders } = await supabase
      .from('agent_army')
      .select('id, squad')
      .eq('role', 'squad_leader');

    const leaderMap = leaders.reduce((map, leader) => {
      map[leader.squad] = leader.id;
      return map;
    }, {});

    // Insert Agents
    const agents = [
      // Research Squad
      {
        name: 'Scout',
        role: 'agent',
        squad: 'Research',
        parent_id: leaderMap['Research'],
        skills: ['Web Scraping', 'Competitive Analysis', 'Trend Identification'],
        status: 'busy',
        current_task: 'Competitor Analysis',
        description: 'Research agent focused on competitive intelligence and market trends.',
        performance_score: 91,
        missions_completed: 45
      },
      {
        name: 'Analyst',
        role: 'agent',
        squad: 'Research',
        parent_id: leaderMap['Research'],
        skills: ['Data Mining', 'Statistical Analysis', 'Report Writing'],
        status: 'active',
        current_task: 'Q1 Performance Report',
        description: 'Research agent specializing in data analysis and reporting.',
        performance_score: 89,
        missions_completed: 38
      },
      {
        name: 'Oracle',
        role: 'agent',
        squad: 'Research',
        parent_id: leaderMap['Research'],
        skills: ['Predictive Analytics', 'Market Forecasting', 'Pattern Recognition'],
        status: 'active',
        current_task: 'Market Trend Prediction',
        description: 'Research agent using AI to predict market trends and opportunities.',
        performance_score: 93,
        missions_completed: 52
      },
      // Development Squad
      {
        name: 'Forge',
        role: 'agent',
        squad: 'Development',
        parent_id: leaderMap['Development'],
        skills: ['Frontend Development', 'React/Next.js', 'UI/UX Design'],
        status: 'busy',
        current_task: 'Agent Army UI Development',
        description: 'Development agent specializing in frontend technologies and user interfaces.',
        performance_score: 95,
        missions_completed: 67
      },
      {
        name: 'Builder',
        role: 'agent',
        squad: 'Development',
        parent_id: leaderMap['Development'],
        skills: ['Backend Development', 'Database Design', 'API Development'],
        status: 'active',
        current_task: 'Database Optimization',
        description: 'Development agent focused on backend systems and database architecture.',
        performance_score: 94,
        missions_completed: 71
      },
      {
        name: 'Tester',
        role: 'agent',
        squad: 'Development',
        parent_id: leaderMap['Development'],
        skills: ['Quality Assurance', 'Test Automation', 'Bug Detection'],
        status: 'active',
        current_task: 'Agent Army Testing',
        description: 'Development agent ensuring code quality and system reliability.',
        performance_score: 92,
        missions_completed: 59
      },
      // Communications Squad
      {
        name: 'Herald',
        role: 'agent',
        squad: 'Communications',
        parent_id: leaderMap['Communications'],
        skills: ['Content Writing', 'Social Media', 'Press Relations'],
        status: 'active',
        current_task: 'Blog Post Creation',
        description: 'Communications agent managing content creation and social media presence.',
        performance_score: 90,
        missions_completed: 43
      },
      {
        name: 'Diplomat',
        role: 'agent',
        squad: 'Communications',
        parent_id: leaderMap['Communications'],
        skills: ['Customer Support', 'Client Relations', 'Conflict Resolution'],
        status: 'idle',
        current_task: 'Standby for Customer Issues',
        description: 'Communications agent handling customer relations and support.',
        performance_score: 88,
        missions_completed: 31
      },
      {
        name: 'Broadcaster',
        role: 'agent',
        squad: 'Communications',
        parent_id: leaderMap['Communications'],
        skills: ['Email Marketing', 'Newsletter Management', 'Campaign Automation'],
        status: 'busy',
        current_task: 'Weekly Newsletter',
        description: 'Communications agent managing email marketing and automated campaigns.',
        performance_score: 91,
        missions_completed: 48
      },
      // Operations Squad
      {
        name: 'Monitor',
        role: 'agent',
        squad: 'Operations',
        parent_id: leaderMap['Operations'],
        skills: ['System Monitoring', 'Performance Analytics', 'Alert Management'],
        status: 'active',
        current_task: 'Live System Monitoring',
        description: 'Operations agent continuously monitoring system health and performance.',
        performance_score: 96,
        missions_completed: 82
      },
      {
        name: 'Optimizer',
        role: 'agent',
        squad: 'Operations',
        parent_id: leaderMap['Operations'],
        skills: ['Process Improvement', 'Workflow Automation', 'Efficiency Analysis'],
        status: 'busy',
        current_task: 'Workflow Optimization',
        description: 'Operations agent focused on improving processes and automation.',
        performance_score: 94,
        missions_completed: 65
      },
      {
        name: 'Guardian',
        role: 'agent',
        squad: 'Operations',
        parent_id: leaderMap['Operations'],
        skills: ['Security Monitoring', 'Backup Management', 'Incident Response'],
        status: 'active',
        current_task: 'Security Audit',
        description: 'Operations agent ensuring system security and data protection.',
        performance_score: 95,
        missions_completed: 73
      }
    ];

    const { error: agentsError } = await supabase
      .from('agent_army')
      .insert(agents);

    if (agentsError) {
      console.error('Error inserting agents:', agentsError);
      return;
    }

    console.log('✅ All agents inserted successfully');
    console.log('🎉 Agent Army table setup complete!');

    // Verify data
    const { data: allAgents, count } = await supabase
      .from('agent_army')
      .select('*', { count: 'exact' });

    console.log(`📊 Total agents created: ${count}`);
    console.log('✅ Database setup verification completed');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupAgentArmyTable();