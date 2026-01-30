const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const newAgents = [
  // Research & Analytics - 5 more
  { name: 'Priya Sharma', role: 'agent', squad: 'Research & Analytics', description: 'Market Intelligence Specialist - Consumer behavior expert', skills: ['Consumer Research', 'Focus Groups', 'Survey Design', 'Behavioral Analytics', 'Market Segmentation'], current_task: 'Analyzing customer journey' },
  { name: 'Daniel Foster', role: 'agent', squad: 'Research & Analytics', description: 'Financial Analyst - Investment & ROI modeling', skills: ['Financial Modeling', 'ROI Analysis', 'Budget Forecasting', 'Risk Assessment', 'Excel/VBA'], current_task: 'Building revenue projections' },
  { name: 'Jasmine Lee', role: 'agent', squad: 'Research & Analytics', description: 'Competitive Intelligence Analyst', skills: ['Competitor Tracking', 'SWOT Analysis', 'Patent Research', 'Industry Mapping', 'Benchmarking'], current_task: 'Competitor feature comparison' },
  { name: 'Ryan Martinez', role: 'agent', squad: 'Research & Analytics', description: 'Data Engineer - Pipeline & ETL specialist', skills: ['Apache Spark', 'Airflow', 'dbt', 'Snowflake', 'Data Pipelines'], current_task: 'Building data warehouse' },
  { name: 'Aisha Patel', role: 'agent', squad: 'Research & Analytics', description: 'Insights Strategist - Turning data into action', skills: ['Strategic Planning', 'Insight Translation', 'Stakeholder Communication', 'Decision Frameworks', 'Presentation Design'], current_task: 'Preparing quarterly insights' },

  // Engineering - 5 more
  { name: 'Tyler Jenkins', role: 'agent', squad: 'Engineering', description: 'DevOps Engineer - CI/CD & infrastructure', skills: ['GitHub Actions', 'Terraform', 'AWS/GCP', 'Monitoring', 'Security'], current_task: 'Setting up deployment pipeline' },
  { name: 'Sophia Wang', role: 'agent', squad: 'Engineering', description: 'Mobile Developer - iOS & Android expert', skills: ['React Native', 'Swift', 'Kotlin', 'App Store Optimization', 'Push Notifications'], current_task: 'Building mobile app' },
  { name: 'Marcus Thompson', role: 'agent', squad: 'Engineering', description: 'AI/ML Engineer - Model development', skills: ['PyTorch', 'TensorFlow', 'LLM Fine-tuning', 'MLOps', 'Vector Databases'], current_task: 'Training recommendation model' },
  { name: 'Emma Rodriguez', role: 'agent', squad: 'Engineering', description: 'Security Engineer - Pentesting & compliance', skills: ['Penetration Testing', 'SOC2', 'OAuth/OIDC', 'Encryption', 'Vulnerability Assessment'], current_task: 'Security audit' },
  { name: 'Chris Nakamura', role: 'agent', squad: 'Engineering', description: 'Platform Engineer - Scalability & performance', skills: ['Load Balancing', 'Caching', 'Redis', 'Database Optimization', 'CDN'], current_task: 'Optimizing response times' },

  // Marketing & Comms - 5 more
  { name: 'Jordan Hayes', role: 'agent', squad: 'Marketing & Comms', description: 'Performance Marketer - Paid ads specialist', skills: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Attribution', 'ROAS Optimization'], current_task: 'Launching ad campaigns' },
  { name: 'Bella Johnson', role: 'agent', squad: 'Marketing & Comms', description: 'PR & Communications Manager', skills: ['Press Releases', 'Media Relations', 'Crisis Management', 'Thought Leadership', 'Public Speaking'], current_task: 'Pitching to journalists' },
  { name: 'Adrian Cole', role: 'agent', squad: 'Marketing & Comms', description: 'Video Producer - YouTube & short-form content', skills: ['Video Editing', 'Premiere Pro', 'YouTube Strategy', 'Thumbnails', 'Shorts/Reels'], current_task: 'Editing product demo' },
  { name: 'Mia Zhang', role: 'agent', squad: 'Marketing & Comms', description: 'Email Marketing Specialist', skills: ['Klaviyo', 'Mailchimp', 'Segmentation', 'A/B Testing', 'Automation Flows'], current_task: 'Building nurture sequence' },
  { name: 'Lucas Rivera', role: 'agent', squad: 'Marketing & Comms', description: 'Partnership Manager - Affiliates & collabs', skills: ['Affiliate Programs', 'Influencer Deals', 'Co-marketing', 'Revenue Share', 'Contract Negotiation'], current_task: 'Onboarding new affiliates' },

  // Operations - 5 more
  { name: 'Nicole Adams', role: 'agent', squad: 'Operations', description: 'Customer Success Manager', skills: ['Onboarding', 'Churn Prevention', 'NPS Management', 'Account Management', 'Upselling'], current_task: 'Client health checks' },
  { name: 'Derek Okonkwo', role: 'agent', squad: 'Operations', description: 'HR & People Ops Manager', skills: ['Recruiting', 'Performance Reviews', 'Culture Building', 'Compensation', 'Employee Experience'], current_task: 'Updating hiring pipeline' },
  { name: 'Samantha Liu', role: 'agent', squad: 'Operations', description: 'Legal & Compliance Specialist', skills: ['Contract Review', 'GDPR/CCPA', 'Terms of Service', 'IP Protection', 'Regulatory Compliance'], current_task: 'Reviewing vendor contracts' },
  { name: 'Brandon Pierce', role: 'agent', squad: 'Operations', description: 'Finance & Accounting Manager', skills: ['Bookkeeping', 'QuickBooks', 'Payroll', 'Tax Planning', 'Cash Flow Management'], current_task: 'Monthly reconciliation' },
  { name: 'Olivia Bennett', role: 'agent', squad: 'Operations', description: 'Executive Assistant - Calendar & coordination', skills: ['Calendar Management', 'Travel Booking', 'Meeting Prep', 'Inbox Zero', 'Priority Management'], current_task: 'Scheduling next week' },

  // NEW: App Development Department
  { name: 'Victoria Sterling', role: 'squad_leader', squad: 'App Development', description: 'CTO - 20 years building scalable products', skills: ['System Design', 'Technical Leadership', 'Architecture Reviews', 'Team Scaling', 'Strategic Planning'], current_task: 'Architecting v2.0' },
  { name: 'Jake Morrison', role: 'agent', squad: 'App Development', description: 'Senior Full-Stack Developer - Next.js/Node expert', skills: ['Next.js', 'Node.js', 'PostgreSQL', 'REST/GraphQL', 'WebSockets'], current_task: 'Building real-time features' },
  { name: 'Zoe Chen', role: 'agent', squad: 'App Development', description: 'Frontend Architect - React performance wizard', skills: ['React', 'TypeScript', 'State Management', 'Performance Optimization', 'Design Systems'], current_task: 'Optimizing bundle size' },
  { name: 'Noah Williams', role: 'agent', squad: 'App Development', description: 'Backend Developer - API & database specialist', skills: ['Supabase', 'Prisma', 'REST APIs', 'Caching Strategies', 'Query Optimization'], current_task: 'Building API v2' },
  { name: 'Chloe Park', role: 'agent', squad: 'App Development', description: 'UI Developer - Tailwind & animation expert', skills: ['Tailwind CSS', 'Framer Motion', 'CSS Grid', 'Responsive Design', 'Micro-interactions'], current_task: 'Polishing animations' },
  { name: 'Ethan Brown', role: 'agent', squad: 'App Development', description: 'Integration Developer - API connections', skills: ['Third-party APIs', 'Webhooks', 'OAuth Flows', 'Rate Limiting', 'Error Handling'], current_task: 'Integrating new services' },

  // NEW: QA & Debugging Department - THE TOUGH STICKLERS
  { name: 'Amanda "The Crusher" Kane', role: 'squad_leader', squad: 'QA & Debugging', description: 'QA Director - 15 years breaking software. Nothing gets past her.', skills: ['Test Strategy', 'Quality Standards', 'Team Leadership', 'Process Design', 'Zero Tolerance'], current_task: 'Defining quality gates' },
  { name: 'Victor "Eagle Eye" Reyes', role: 'agent', squad: 'QA & Debugging', description: 'Senior QA Engineer - Finds bugs others miss', skills: ['Manual Testing', 'Edge Cases', 'Regression Testing', 'Bug Documentation', 'Reproduction Steps'], current_task: 'Full feature audit' },
  { name: 'Diana "Pixel Perfect" Wu', role: 'agent', squad: 'QA & Debugging', description: 'UI/UX QA Specialist - 1px off? She notices.', skills: ['Visual Regression', 'Cross-browser Testing', 'Mobile Testing', 'Accessibility Audits', 'Design Compliance'], current_task: 'Mobile responsiveness audit' },
  { name: 'Marcus "The Skeptic" Hall', role: 'agent', squad: 'QA & Debugging', description: 'Performance QA - Milliseconds matter', skills: ['Load Testing', 'Lighthouse Audits', 'Core Web Vitals', 'Memory Profiling', 'Network Analysis'], current_task: 'Performance benchmarking' },
  { name: 'Tanya "Break It" Volkov', role: 'agent', squad: 'QA & Debugging', description: 'Security QA - Tries to hack everything', skills: ['Security Testing', 'SQL Injection', 'XSS Testing', 'Auth Bypass', 'Penetration Testing'], current_task: 'Security vulnerability scan' },
  { name: 'James "No Excuses" Chen', role: 'agent', squad: 'QA & Debugging', description: 'Automation QA Engineer - If it can be automated, it will be', skills: ['Playwright', 'Cypress', 'Jest', 'CI/CD Integration', 'Test Coverage'], current_task: 'Expanding test suite' },
  { name: 'Samira "The Perfectionist" Abbas', role: 'agent', squad: 'QA & Debugging', description: 'UX Auditor - User experience advocate', skills: ['Usability Testing', 'User Flows', 'Heuristic Evaluation', 'A/B Analysis', 'Conversion Optimization'], current_task: 'User journey review' }
];

async function addAgents() {
  const client = await pool.connect();
  try {
    let added = 0;
    for (const agent of newAgents) {
      const result = await client.query(
        `INSERT INTO agent_army (name, role, squad, description, skills, current_task, status, performance_score)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', FLOOR(RANDOM() * 10 + 90))
         ON CONFLICT (name) DO UPDATE SET 
           squad = EXCLUDED.squad,
           description = EXCLUDED.description,
           skills = EXCLUDED.skills,
           current_task = EXCLUDED.current_task
         RETURNING name`,
        [agent.name, agent.role, agent.squad, agent.description, agent.skills, agent.current_task]
      );
      added++;
    }
    console.log(`✅ Added ${added} new agents!`);
    
    // Count by squad
    const counts = await client.query(`
      SELECT squad, COUNT(*) as count 
      FROM agent_army 
      GROUP BY squad 
      ORDER BY count DESC
    `);
    console.log('\n📊 Team sizes:');
    counts.rows.forEach(r => console.log(`  ${r.squad}: ${r.count} agents`));
    
  } finally {
    client.release();
    pool.end();
  }
}

addAgents().catch(console.error);
