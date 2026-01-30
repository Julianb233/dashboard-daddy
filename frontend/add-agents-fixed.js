const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const newAgents = [
  // Research & Analytics - 5 more
  { name: 'Priya Sharma', role: 'agent', squad: 'Research & Analytics', description: 'Market Intelligence Specialist', skills: ['Consumer Research', 'Focus Groups', 'Survey Design', 'Behavioral Analytics', 'Market Segmentation'] },
  { name: 'Daniel Foster', role: 'agent', squad: 'Research & Analytics', description: 'Financial Analyst - ROI modeling', skills: ['Financial Modeling', 'ROI Analysis', 'Budget Forecasting', 'Risk Assessment', 'Excel/VBA'] },
  { name: 'Jasmine Lee', role: 'agent', squad: 'Research & Analytics', description: 'Competitive Intelligence Analyst', skills: ['Competitor Tracking', 'SWOT Analysis', 'Patent Research', 'Industry Mapping', 'Benchmarking'] },
  { name: 'Ryan Martinez', role: 'agent', squad: 'Research & Analytics', description: 'Data Engineer - ETL specialist', skills: ['Apache Spark', 'Airflow', 'dbt', 'Snowflake', 'Data Pipelines'] },
  { name: 'Aisha Patel', role: 'agent', squad: 'Research & Analytics', description: 'Insights Strategist', skills: ['Strategic Planning', 'Insight Translation', 'Stakeholder Communication', 'Decision Frameworks', 'Presentation Design'] },

  // Engineering - 5 more
  { name: 'Tyler Jenkins', role: 'agent', squad: 'Engineering', description: 'DevOps Engineer - CI/CD', skills: ['GitHub Actions', 'Terraform', 'AWS/GCP', 'Monitoring', 'Security'] },
  { name: 'Sophia Wang', role: 'agent', squad: 'Engineering', description: 'Mobile Developer - iOS & Android', skills: ['React Native', 'Swift', 'Kotlin', 'App Store Optimization', 'Push Notifications'] },
  { name: 'Marcus Thompson', role: 'agent', squad: 'Engineering', description: 'AI/ML Engineer', skills: ['PyTorch', 'TensorFlow', 'LLM Fine-tuning', 'MLOps', 'Vector Databases'] },
  { name: 'Emma Rodriguez', role: 'agent', squad: 'Engineering', description: 'Security Engineer', skills: ['Penetration Testing', 'SOC2', 'OAuth/OIDC', 'Encryption', 'Vulnerability Assessment'] },
  { name: 'Chris Nakamura', role: 'agent', squad: 'Engineering', description: 'Platform Engineer - Scalability', skills: ['Load Balancing', 'Caching', 'Redis', 'Database Optimization', 'CDN'] },

  // Marketing & Comms - 5 more
  { name: 'Jordan Hayes', role: 'agent', squad: 'Marketing & Comms', description: 'Performance Marketer - Paid ads', skills: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Attribution', 'ROAS Optimization'] },
  { name: 'Bella Johnson', role: 'agent', squad: 'Marketing & Comms', description: 'PR & Communications Manager', skills: ['Press Releases', 'Media Relations', 'Crisis Management', 'Thought Leadership', 'Public Speaking'] },
  { name: 'Adrian Cole', role: 'agent', squad: 'Marketing & Comms', description: 'Video Producer - YouTube', skills: ['Video Editing', 'Premiere Pro', 'YouTube Strategy', 'Thumbnails', 'Shorts/Reels'] },
  { name: 'Mia Zhang', role: 'agent', squad: 'Marketing & Comms', description: 'Email Marketing Specialist', skills: ['Klaviyo', 'Mailchimp', 'Segmentation', 'A/B Testing', 'Automation Flows'] },
  { name: 'Lucas Rivera', role: 'agent', squad: 'Marketing & Comms', description: 'Partnership Manager', skills: ['Affiliate Programs', 'Influencer Deals', 'Co-marketing', 'Revenue Share', 'Contract Negotiation'] },

  // Operations - 5 more
  { name: 'Nicole Adams', role: 'agent', squad: 'Operations', description: 'Customer Success Manager', skills: ['Onboarding', 'Churn Prevention', 'NPS Management', 'Account Management', 'Upselling'] },
  { name: 'Derek Okonkwo', role: 'agent', squad: 'Operations', description: 'HR & People Ops Manager', skills: ['Recruiting', 'Performance Reviews', 'Culture Building', 'Compensation', 'Employee Experience'] },
  { name: 'Samantha Liu', role: 'agent', squad: 'Operations', description: 'Legal & Compliance Specialist', skills: ['Contract Review', 'GDPR/CCPA', 'Terms of Service', 'IP Protection', 'Regulatory Compliance'] },
  { name: 'Brandon Pierce', role: 'agent', squad: 'Operations', description: 'Finance & Accounting Manager', skills: ['Bookkeeping', 'QuickBooks', 'Payroll', 'Tax Planning', 'Cash Flow Management'] },
  { name: 'Olivia Bennett', role: 'agent', squad: 'Operations', description: 'Executive Assistant', skills: ['Calendar Management', 'Travel Booking', 'Meeting Prep', 'Inbox Zero', 'Priority Management'] },

  // NEW: App Development Department
  { name: 'Victoria Sterling', role: 'squad_leader', squad: 'App Development', description: 'CTO - 20 years building scalable products', skills: ['System Design', 'Technical Leadership', 'Architecture Reviews', 'Team Scaling', 'Strategic Planning'] },
  { name: 'Jake Morrison', role: 'agent', squad: 'App Development', description: 'Senior Full-Stack Developer', skills: ['Next.js', 'Node.js', 'PostgreSQL', 'REST/GraphQL', 'WebSockets'] },
  { name: 'Zoe Chen', role: 'agent', squad: 'App Development', description: 'Frontend Architect - React wizard', skills: ['React', 'TypeScript', 'State Management', 'Performance Optimization', 'Design Systems'] },
  { name: 'Noah Williams', role: 'agent', squad: 'App Development', description: 'Backend Developer - API specialist', skills: ['Supabase', 'Prisma', 'REST APIs', 'Caching Strategies', 'Query Optimization'] },
  { name: 'Chloe Park', role: 'agent', squad: 'App Development', description: 'UI Developer - Tailwind expert', skills: ['Tailwind CSS', 'Framer Motion', 'CSS Grid', 'Responsive Design', 'Micro-interactions'] },
  { name: 'Ethan Brown', role: 'agent', squad: 'App Development', description: 'Integration Developer', skills: ['Third-party APIs', 'Webhooks', 'OAuth Flows', 'Rate Limiting', 'Error Handling'] },

  // NEW: QA & Debugging Department - THE TOUGH STICKLERS
  { name: 'Amanda "The Crusher" Kane', role: 'squad_leader', squad: 'QA & Debugging', description: 'QA Director - 15 years breaking software. Nothing gets past her.', skills: ['Test Strategy', 'Quality Standards', 'Team Leadership', 'Process Design', 'Zero Tolerance'] },
  { name: 'Victor "Eagle Eye" Reyes', role: 'agent', squad: 'QA & Debugging', description: 'Senior QA Engineer - Finds bugs others miss', skills: ['Manual Testing', 'Edge Cases', 'Regression Testing', 'Bug Documentation', 'Reproduction Steps'] },
  { name: 'Diana "Pixel Perfect" Wu', role: 'agent', squad: 'QA & Debugging', description: 'UI/UX QA - 1px off? She notices.', skills: ['Visual Regression', 'Cross-browser Testing', 'Mobile Testing', 'Accessibility Audits', 'Design Compliance'] },
  { name: 'Marcus "The Skeptic" Hall', role: 'agent', squad: 'QA & Debugging', description: 'Performance QA - Milliseconds matter', skills: ['Load Testing', 'Lighthouse Audits', 'Core Web Vitals', 'Memory Profiling', 'Network Analysis'] },
  { name: 'Tanya "Break It" Volkov', role: 'agent', squad: 'QA & Debugging', description: 'Security QA - Tries to hack everything', skills: ['Security Testing', 'SQL Injection', 'XSS Testing', 'Auth Bypass', 'Penetration Testing'] },
  { name: 'James "No Excuses" Chen', role: 'agent', squad: 'QA & Debugging', description: 'Automation QA Engineer', skills: ['Playwright', 'Cypress', 'Jest', 'CI/CD Integration', 'Test Coverage'] },
  { name: 'Samira "The Perfectionist" Abbas', role: 'agent', squad: 'QA & Debugging', description: 'UX Auditor - User experience advocate', skills: ['Usability Testing', 'User Flows', 'Heuristic Evaluation', 'A/B Analysis', 'Conversion Optimization'] }
];

async function addAgents() {
  const client = await pool.connect();
  try {
    let added = 0;
    for (const agent of newAgents) {
      await client.query(
        `INSERT INTO agent_army (name, role, squad, description, skills, current_task, status, performance_score)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', FLOOR(RANDOM() * 10 + 90))`,
        [agent.name, agent.role, agent.squad, agent.description, agent.skills, 'Standing by']
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
    
    const total = await client.query(`SELECT COUNT(*) FROM agent_army`);
    console.log(`\n🎯 Total agent army: ${total.rows[0].count} agents`);
    
  } finally {
    client.release();
    pool.end();
  }
}

addAgents().catch(console.error);
