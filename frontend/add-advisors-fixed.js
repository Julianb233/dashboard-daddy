const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const advisors = [
  { name: 'Dan Martell', description: 'SaaS Coach - Author of "Buy Back Your Time". Expert in scaling, delegation, and building businesses that run without you.', skills: ['Time Management', 'Delegation', 'SaaS Scaling', 'Playbook Creation', 'CEO Coaching'], expertise: 'Business Systems' },
  { name: 'Alex Hormozi', description: 'Author of "$100M Offers" & "$100M Leads". Master of offers, pricing, and customer acquisition.', skills: ['Offer Creation', 'Pricing Strategy', 'Lead Generation', 'Value Stacking', 'Grand Slam Offers'], expertise: 'Offers & Acquisition' },
  { name: 'Tony Robbins', description: 'Peak performance coach. Author of "Awaken the Giant Within". Master of state, strategy, and story.', skills: ['Peak Performance', 'NLP', 'State Management', 'Goal Setting', 'Personal Development'], expertise: 'Mindset & Performance' },
  { name: 'Gino Wickman', description: 'Creator of EOS. Author of "Traction". Expert in business operations and accountability.', skills: ['EOS Implementation', 'Vision/Traction', 'Meeting Cadence', 'Accountability', 'Organizational Health'], expertise: 'Operations & Traction' },
  { name: 'Gary Keller', description: 'Author of "The ONE Thing". Co-founder of Keller Williams. Expert in focus and priority management.', skills: ['Priority Management', 'Focus', 'Goal Setting', 'Time Blocking', 'Extraordinary Results'], expertise: 'Focus & Priorities' },
  { name: 'Neil Patel', description: 'Digital marketing legend. Co-founder of Crazy Egg, Hello Bar, KISSmetrics. SEO and growth expert.', skills: ['SEO', 'Content Marketing', 'Growth Hacking', 'Analytics', 'Digital Strategy'], expertise: 'Marketing & Growth' },
  { name: 'Scout Maxwell', description: 'Wildcard Advisor Scout - Researches emerging thought leaders and keeps all advisors updated on new frameworks.', skills: ['Trend Research', 'Advisor Training', 'Knowledge Synthesis', 'Best Practice Curation', 'Cross-Domain Insights'], expertise: 'Emerging Wisdom' }
];

const lifeCoaches = [
  { name: 'Flex Armstrong', description: 'Personal Fitness Coach - Former Olympic trainer. Pushes you to be your physical best.', skills: ['Workout Programming', 'Nutrition Planning', 'Recovery', 'Goal Setting', 'Accountability'], expertise: 'Personal Fitness', cron: '6:00 AM' },
  { name: 'Maya Heartwell', description: 'Relationship Coach - 20 years helping couples thrive. Expert in communication and connection.', skills: ['Communication', 'Conflict Resolution', 'Intimacy Building', 'Love Languages', 'Date Planning'], expertise: 'Relationship Health', cron: '7:00 PM' },
  { name: 'Zen Parker', description: 'Hobby & Joy Coach - Life is more than work. Expert in work-life balance and passion pursuit.', skills: ['Time for Fun', 'Hobby Discovery', 'Creative Expression', 'Adventure Planning', 'Joy Cultivation'], expertise: 'Hobbies & Joy', cron: '5:00 PM Saturdays' },
  { name: 'Sterling Goldsworth', description: 'Wealth & Finance Coach - CFP, built multiple 7-figure portfolios. Expert in wealth building.', skills: ['Investment Strategy', 'Tax Optimization', 'Budgeting', 'Passive Income', 'Financial Independence'], expertise: 'Wealth & Finances', cron: '9:00 AM Mondays' },
  { name: 'Grace Giverton', description: 'Philanthropy Coach - Former nonprofit CEO. Expert in meaningful giving and impact.', skills: ['Charitable Planning', 'Impact Measurement', 'Volunteer Strategy', 'Legacy Building', 'Community Engagement'], expertise: 'Philanthropy & Giving', cron: '10:00 AM Sundays' }
];

async function addAll() {
  const client = await pool.connect();
  try {
    // Add advisors
    console.log('📚 BOARD OF ADVISORS:');
    for (const advisor of advisors) {
      await client.query(
        `INSERT INTO agent_army (name, role, squad, description, skills, current_task, status, performance_score)
         VALUES ($1, 'squad_leader', 'Board of Advisors', $2, $3, $4, 'active', 99)`,
        [advisor.name, advisor.description, advisor.skills, `Advising on ${advisor.expertise}`]
      );
      console.log(`  ✅ ${advisor.name} - ${advisor.expertise}`);
    }
    
    // Add life coaches
    console.log('\n🏃 LIFE COACH SQUAD:');
    for (const coach of lifeCoaches) {
      await client.query(
        `INSERT INTO agent_army (name, role, squad, description, skills, current_task, status, performance_score)
         VALUES ($1, 'squad_leader', 'Life Coaches', $2, $3, $4, 'active', 98)`,
        [coach.name, coach.description, coach.skills, `${coach.expertise} guidance (${coach.cron})`]
      );
      console.log(`  ✅ ${coach.name} - ${coach.expertise} @ ${coach.cron}`);
    }
    
    // Get final count
    const total = await client.query(`SELECT COUNT(*) FROM agent_army`);
    console.log(`\n🎯 Total agent army: ${total.rows[0].count} agents`);
    
  } finally {
    client.release();
    pool.end();
  }
}

addAll().catch(console.error);
