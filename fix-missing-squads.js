const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jrirksdiklqwsaatbhvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaXJrc2Rpa2xxd3NhYXRiaHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI5NjYsImV4cCI6MjA2NDU4ODk2Nn0.mb1VQ9eOiRTyOMAu5f9OTYh6V7ialfkzr8DPylvA4vk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMissingSquads() {
  console.log('🔧 Fixing missing squads...');
  
  // Get commander ID
  const { data: commander } = await supabase
    .from('agent_army')
    .select('id')
    .eq('role', 'commander')
    .single();
  
  if (!commander) {
    console.error('❌ No commander found');
    return;
  }
  
  console.log('✅ Found commander:', commander.id);
  
  // Check existing squad leaders
  const { data: existingLeaders } = await supabase
    .from('agent_army')
    .select('squad')
    .eq('role', 'squad_leader');
  
  const existingSquads = existingLeaders?.map(l => l.squad) || [];
  console.log('Existing squads:', existingSquads);
  
  // Squad leaders to add
  const missingSquadLeaders = [
    {
      name: 'Alpha',
      role: 'squad_leader',
      squad: 'Research',
      parent_id: commander.id,
      skills: ['Data Analysis', 'Research Methodology', 'Report Generation', 'Information Synthesis'],
      status: 'active',
      current_task: 'Market Research Initiative',
      description: 'Research Squad Leader - Data analysis and competitive intelligence',
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
      description: 'Development Squad Leader - All coding and software projects',
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
      description: 'Communications Squad Leader - External and internal communications',
      performance_score: 92,
      missions_completed: 76
    }
  ].filter(leader => !existingSquads.includes(leader.squad));
  
  if (missingSquadLeaders.length === 0) {
    console.log('✅ All squad leaders exist');
    return;
  }
  
  console.log(`Adding ${missingSquadLeaders.length} missing squad leaders...`);
  
  // Insert missing squad leaders
  const { data: newLeaders, error: leaderError } = await supabase
    .from('agent_army')
    .insert(missingSquadLeaders)
    .select();
  
  if (leaderError) {
    console.error('❌ Error adding squad leaders:', leaderError);
    return;
  }
  
  console.log('✅ Squad leaders added:', newLeaders.map(l => l.name));
  
  // Create leader map for agents
  const { data: allLeaders } = await supabase
    .from('agent_army')
    .select('id, squad')
    .eq('role', 'squad_leader');
  
  const leaderMap = {};
  allLeaders.forEach(l => { leaderMap[l.squad] = l.id; });
  
  // Add agents for each squad
  const agents = [
    // Research Squad
    { name: 'Scout', squad: 'Research', skills: ['Web Scraping', 'Competitive Analysis', 'Trend Identification'], current_task: 'Competitor Analysis', performance_score: 91, missions_completed: 45 },
    { name: 'Analyst', squad: 'Research', skills: ['Data Mining', 'Statistical Analysis', 'Report Writing'], current_task: 'Q1 Performance Report', performance_score: 89, missions_completed: 38 },
    { name: 'Oracle', squad: 'Research', skills: ['Predictive Analytics', 'Market Forecasting', 'Pattern Recognition'], current_task: 'Market Trend Prediction', performance_score: 93, missions_completed: 52 },
    // Development Squad
    { name: 'Forge', squad: 'Development', skills: ['Frontend Development', 'React/Next.js', 'UI/UX Design'], current_task: 'Agent Army UI Development', performance_score: 95, missions_completed: 67 },
    { name: 'Builder', squad: 'Development', skills: ['Backend Development', 'Database Design', 'API Development'], current_task: 'Database Optimization', performance_score: 94, missions_completed: 71 },
    { name: 'Tester', squad: 'Development', skills: ['Quality Assurance', 'Test Automation', 'Bug Detection'], current_task: 'Agent Army Testing', performance_score: 92, missions_completed: 59 },
    // Communications Squad
    { name: 'Herald', squad: 'Communications', skills: ['Content Writing', 'Social Media', 'Press Relations'], current_task: 'Blog Post Creation', performance_score: 90, missions_completed: 43 },
    { name: 'Diplomat', squad: 'Communications', skills: ['Customer Support', 'Client Relations', 'Conflict Resolution'], current_task: 'Standby for Customer Issues', performance_score: 88, missions_completed: 31 },
    { name: 'Broadcaster', squad: 'Communications', skills: ['Email Marketing', 'Newsletter Management', 'Campaign Automation'], current_task: 'Weekly Newsletter', performance_score: 91, missions_completed: 48 },
  ].map(agent => ({
    ...agent,
    role: 'agent',
    parent_id: leaderMap[agent.squad],
    status: 'active',
    description: `${agent.squad} agent - ${agent.skills[0]}`
  }));
  
  // Check which agents already exist
  const { data: existingAgents } = await supabase
    .from('agent_army')
    .select('name')
    .eq('role', 'agent');
  
  const existingNames = existingAgents?.map(a => a.name) || [];
  const newAgents = agents.filter(a => !existingNames.includes(a.name));
  
  if (newAgents.length > 0) {
    const { error: agentError } = await supabase
      .from('agent_army')
      .insert(newAgents);
    
    if (agentError) {
      console.error('❌ Error adding agents:', agentError);
    } else {
      console.log(`✅ Added ${newAgents.length} new agents`);
    }
  }
  
  // Verify final count
  const { count } = await supabase
    .from('agent_army')
    .select('*', { count: 'exact' });
  
  console.log(`\n🎉 Done! Total agents: ${count}`);
}

fixMissingSquads();
