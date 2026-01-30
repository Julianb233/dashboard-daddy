const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const advisors = [
  { 
    name: 'Dan Martell', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'SaaS Coach - Author of "Buy Back Your Time". Expert in scaling, delegation, and building businesses that run without you.',
    skills: ['Time Management', 'Delegation', 'SaaS Scaling', 'Playbook Creation', 'CEO Coaching'],
    expertise: 'Business Systems & Time Freedom'
  },
  { 
    name: 'Alex Hormozi', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'Author of "$100M Offers" & "$100M Leads". Master of offers, pricing, and customer acquisition.',
    skills: ['Offer Creation', 'Pricing Strategy', 'Lead Generation', 'Value Stacking', 'Grand Slam Offers'],
    expertise: 'Offers & Customer Acquisition'
  },
  { 
    name: 'Tony Robbins', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'Peak performance coach. Author of "Awaken the Giant Within". Master of state, strategy, and story.',
    skills: ['Peak Performance', 'NLP', 'State Management', 'Goal Setting', 'Personal Development'],
    expertise: 'Mindset & Performance'
  },
  { 
    name: 'Gino Wickman', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'Creator of EOS (Entrepreneurial Operating System). Author of "Traction". Expert in business operations.',
    skills: ['EOS Implementation', 'Vision/Traction', 'Meeting Cadence', 'Accountability', 'Organizational Health'],
    expertise: 'Business Operations & Traction'
  },
  { 
    name: 'Gary Keller', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'Author of "The ONE Thing". Co-founder of Keller Williams. Expert in focus and priority management.',
    skills: ['Priority Management', 'Focus', 'Goal Setting', 'Time Blocking', 'Extraordinary Results'],
    expertise: 'Focus & Prioritization'
  },
  { 
    name: 'Neil Patel', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'Digital marketing legend. Co-founder of Crazy Egg, Hello Bar, KISSmetrics. SEO and growth expert.',
    skills: ['SEO', 'Content Marketing', 'Growth Hacking', 'Analytics', 'Digital Strategy'],
    expertise: 'Digital Marketing & Growth'
  },
  { 
    name: 'Scout "The Seeker" Maxwell', 
    role: 'advisor', 
    squad: 'Board of Advisors',
    description: 'Wildcard Advisor Scout - Constantly researching emerging thought leaders, new frameworks, and best practices. Keeps all advisors updated.',
    skills: ['Trend Research', 'Advisor Training', 'Knowledge Synthesis', 'Best Practice Curation', 'Cross-Domain Insights'],
    expertise: 'Advisor Development & Emerging Wisdom'
  }
];

async function addAdvisors() {
  const client = await pool.connect();
  try {
    for (const advisor of advisors) {
      await client.query(
        `INSERT INTO agent_army (name, role, squad, description, skills, current_task, status, performance_score)
         VALUES ($1, $2, $3, $4, $5, $6, 'active', 99)`,
        [advisor.name, advisor.role, advisor.squad, advisor.description, advisor.skills, `Advising on ${advisor.expertise}`]
      );
      console.log(`📚 ${advisor.name} - ${advisor.expertise}`);
    }
    console.log('\n✅ Board of Advisors assembled!');
  } finally {
    client.release();
    pool.end();
  }
}

addAdvisors().catch(console.error);
