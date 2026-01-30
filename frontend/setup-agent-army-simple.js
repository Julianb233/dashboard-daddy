const { createClient } = require('@supabase/supabase-js');

// Use the proper Supabase URL and anon key (not service role to avoid SSL issues)
const supabaseUrl = 'https://jrirksdiklqwsaatbhvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaXJrc2Rpa2xxd3NhYXRiaHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1MTkyMzAsImV4cCI6MjA1MzA5NTIzMH0.8CkiPlmZhcUJ4NSKW9xWWWG7IfCrGItWQ6qHtmwKV8Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSampleData() {
  try {
    console.log('Inserting sample data to Agent Army table...');

    // Insert Commander Bubba
    console.log('Inserting Commander Bubba...');
    const { data: commander, error: commanderError } = await supabase
      .from('agent_army')
      .insert({
        name: 'Bubba',
        role: 'commander',
        squad: null,
        parent_id: null,
        skills: ['Strategic Planning', 'Team Coordination', 'Decision Making', 'AI Orchestration', 'Problem Solving'],
        status: 'active',
        current_task: 'Overseeing Agent Army Operations',
        description: 'Main AI Commander responsible for strategic planning and agent coordination across all squads.',
        performance_score: 98,
        missions_completed: 157,
        missions_failed: 8,
        total_uptime: 5400 // 90 hours
      })
      .select()
      .single();

    if (commanderError) {
      console.error('Error inserting commander:', commanderError);
      return;
    }

    console.log('✅ Commander Bubba inserted');

    // Insert Squad Leaders
    console.log('Inserting Squad Leaders...');
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
        missions_completed: 89,
        missions_failed: 6,
        total_uptime: 4320 // 72 hours
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
        missions_completed: 112,
        missions_failed: 4,
        total_uptime: 4800 // 80 hours
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
        missions_completed: 76,
        missions_failed: 7,
        total_uptime: 3960 // 66 hours
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
        missions_completed: 134,
        missions_failed: 4,
        total_uptime: 5100 // 85 hours
      }
    ];

    const { data: insertedLeaders, error: leadersError } = await supabase
      .from('agent_army')
      .insert(squadLeaders)
      .select();

    if (leadersError) {
      console.error('Error inserting squad leaders:', leadersError);
      return;
    }

    console.log('✅ Squad leaders inserted');

    // Create leader map for parent_id assignment
    const leaderMap = {};
    insertedLeaders.forEach(leader => {
      leaderMap[leader.squad] = leader.id;
    });

    // Insert Agents
    console.log('Inserting Agents...');
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
        missions_completed: 45,
        missions_failed: 3,
        total_uptime: 2400 // 40 hours
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
        missions_completed: 38,
        missions_failed: 4,
        total_uptime: 2100 // 35 hours
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
        missions_completed: 52,
        missions_failed: 3,
        total_uptime: 2700 // 45 hours
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
        missions_completed: 67,
        missions_failed: 2,
        total_uptime: 3300 // 55 hours
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
        missions_completed: 71,
        missions_failed: 3,
        total_uptime: 3600 // 60 hours
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
        missions_completed: 59,
        missions_failed: 4,
        total_uptime: 3000 // 50 hours
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
        missions_completed: 43,
        missions_failed: 5,
        total_uptime: 2280 // 38 hours
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
        missions_completed: 31,
        missions_failed: 4,
        total_uptime: 1980 // 33 hours
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
        missions_completed: 48,
        missions_failed: 4,
        total_uptime: 2640 // 44 hours
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
        missions_completed: 82,
        missions_failed: 3,
        total_uptime: 4200 // 70 hours
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
        missions_completed: 65,
        missions_failed: 3,
        total_uptime: 3780 // 63 hours
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
        missions_completed: 73,
        missions_failed: 2,
        total_uptime: 3900 // 65 hours
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

    // Verify data
    const { data: allAgents, count } = await supabase
      .from('agent_army')
      .select('*', { count: 'exact' });

    console.log(`📊 Total agents created: ${count}`);
    console.log('🎉 Agent Army data insertion complete!');

    // Show sample data
    console.log('\n📋 Sample of created agents:');
    allAgents?.slice(0, 5).forEach(agent => {
      console.log(`- ${agent.name} (${agent.role}) - ${agent.squad || 'No Squad'} - ${agent.status}`);
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertSampleData();