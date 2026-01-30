const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const agentProfiles = [
  // Research & Analytics
  { 
    name: 'Marcus Chen', 
    role: 'squad_leader',
    description: 'Chief Research Officer - 15 years in market intelligence',
    skills: ['Market Research', 'Competitive Analysis', 'Data Visualization', 'Trend Forecasting', 'Industry Reports'],
    current_task: 'Analyzing Q1 market trends'
  },
  { 
    name: 'Alex Turner', 
    description: 'Senior Data Scientist - ML/AI specialist',
    skills: ['Machine Learning', 'Python', 'Statistical Analysis', 'Predictive Modeling', 'A/B Testing'],
    current_task: 'Building lead scoring model'
  },
  { 
    name: 'Lisa Chang', 
    description: 'Business Intelligence Analyst - Dashboard expert',
    skills: ['SQL', 'Tableau', 'Power BI', 'KPI Tracking', 'Financial Analysis'],
    current_task: 'Creating executive dashboard'
  },
  
  // Engineering
  { 
    name: 'Sarah Mitchell', 
    role: 'squad_leader',
    description: 'VP of Engineering - Full-stack architect',
    skills: ['System Architecture', 'Node.js', 'React', 'AWS', 'Team Leadership'],
    current_task: 'Reviewing infrastructure plans'
  },
  { 
    name: 'James Wilson', 
    description: 'Senior Backend Engineer - API & database specialist',
    skills: ['PostgreSQL', 'GraphQL', 'Microservices', 'Docker', 'Kubernetes'],
    current_task: 'Optimizing database queries'
  },
  { 
    name: 'Kevin Brown', 
    description: 'Frontend Developer - UI/UX implementation',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Accessibility'],
    current_task: 'Building new dashboard components'
  },
  
  // Marketing & Comms
  { 
    name: 'David Park', 
    role: 'squad_leader',
    description: 'CMO - Growth marketing strategist',
    skills: ['Growth Hacking', 'Brand Strategy', 'Content Marketing', 'SEO/SEM', 'Analytics'],
    current_task: 'Planning Q2 campaign'
  },
  { 
    name: 'Olivia Scott', 
    description: 'Social Media Manager - Community builder',
    skills: ['Social Media Strategy', 'Community Management', 'Influencer Outreach', 'Content Creation', 'Engagement'],
    current_task: 'Managing Twitter engagement'
  },
  { 
    name: 'Nathan Reed', 
    description: 'Content Strategist - Copywriting expert',
    skills: ['Copywriting', 'Email Marketing', 'Blog Writing', 'Video Scripts', 'Brand Voice'],
    current_task: 'Writing email sequence'
  },
  
  // Operations
  { 
    name: 'Elena Rodriguez', 
    role: 'squad_leader',
    description: 'COO - Process optimization expert',
    skills: ['Process Automation', 'Project Management', 'Vendor Relations', 'Budget Management', 'Team Ops'],
    current_task: 'Streamlining workflows'
  },
  { 
    name: 'Rachel Kim', 
    description: 'Security Specialist - Compliance & protection',
    skills: ['Cybersecurity', 'Compliance', 'Risk Assessment', 'Incident Response', 'Access Control'],
    current_task: 'Security audit review'
  },
  { 
    name: 'Michael Torres', 
    description: 'Automation Engineer - Workflow specialist',
    skills: ['n8n', 'Zapier', 'Make.com', 'API Integration', 'Process Design'],
    current_task: 'Building client onboarding flow'
  }
];

async function updateAgents() {
  const client = await pool.connect();
  try {
    for (const agent of agentProfiles) {
      const result = await client.query(
        `UPDATE agent_army SET 
          description = $1,
          skills = $2,
          current_task = $3,
          performance_score = FLOOR(RANDOM() * 10 + 90)
        WHERE name = $4
        RETURNING name, skills`,
        [agent.description, agent.skills, agent.current_task, agent.name]
      );
      if (result.rows.length > 0) {
        console.log(`✅ ${result.rows[0].name}: ${result.rows[0].skills.slice(0,3).join(', ')}...`);
      }
    }
    
    // Update Bubba with commander skills
    await client.query(`UPDATE agent_army SET 
      description = 'Supreme Commander - AI Life OS Orchestrator. 10+ years equivalent experience.',
      skills = ARRAY['Strategic Planning', 'Multi-Agent Coordination', 'Decision Making', 'Resource Allocation', 'Crisis Management', 'Client Relations'],
      current_task = 'Overseeing all department operations'
    WHERE name = 'Bubba'`);
    console.log('✅ Bubba: Strategic Planning, Multi-Agent Coordination, Decision Making...');
    
    console.log('\n🎯 All agents updated with professional profiles and skills!');
  } finally {
    client.release();
    pool.end();
  }
}

updateAgents().catch(console.error);
