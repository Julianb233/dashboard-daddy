import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// GET /api/subscriptions/analytics
export async function GET() {
  try {
    // Get current month data
    const currentStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(monthly_cost) as total_cost,
        AVG(monthly_cost) as avg_cost,
        status
      FROM subscriptions 
      GROUP BY category, status
      ORDER BY category
    `);

    // Get total monthly spending
    const monthlyTotals = await pool.query(`
      SELECT SUM(monthly_cost) as total_monthly
      FROM subscriptions 
      WHERE status = 'active'
    `);

    // Get usage statistics
    const usageStats = await pool.query(`
      SELECT 
        name,
        provider,
        category,
        usage_limit,
        current_usage,
        usage_unit,
        CASE 
          WHEN usage_limit > 0 THEN (current_usage::float / usage_limit::float * 100)
          ELSE 0 
        END as usage_percentage
      FROM subscriptions 
      WHERE usage_limit IS NOT NULL 
        AND usage_limit > 0
        AND status = 'active'
      ORDER BY usage_percentage DESC
    `);

    // Get renewals by month for the next 12 months
    const renewals = await pool.query(`
      SELECT 
        DATE_TRUNC('month', next_renewal) as month,
        COUNT(*) as renewal_count,
        SUM(monthly_cost) as renewal_cost
      FROM subscriptions 
      WHERE next_renewal >= CURRENT_DATE 
        AND next_renewal <= CURRENT_DATE + INTERVAL '12 months'
        AND status = 'active'
      GROUP BY DATE_TRUNC('month', next_renewal)
      ORDER BY month
    `);

    // Simulate historical data for year-over-year comparison
    const historicalData = [];
    const currentDate = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = month.toISOString().substring(0, 7);
      
      // Simulate growth pattern
      const baseAmount = monthlyTotals.rows[0]?.total_monthly || 0;
      const growthFactor = 1 + (i * 0.05); // 5% growth per month
      const monthlyAmount = Math.round((baseAmount / growthFactor) * 100) / 100;
      
      historicalData.push({
        month: monthStr,
        total_cost: monthlyAmount,
        new_subscriptions: Math.floor(Math.random() * 3),
        cancelled_subscriptions: Math.floor(Math.random() * 2)
      });
    }

    // Category breakdown for pie chart
    const categoryBreakdown = await pool.query(`
      SELECT 
        category,
        COUNT(*) as subscription_count,
        SUM(monthly_cost) as total_cost,
        ROUND(
          (SUM(monthly_cost) / (
            SELECT SUM(monthly_cost) FROM subscriptions WHERE status = 'active'
          ) * 100)::numeric, 2
        ) as percentage
      FROM subscriptions 
      WHERE status = 'active'
      GROUP BY category
      ORDER BY total_cost DESC
    `);

    // Cost optimization suggestions
    const optimizations = [];
    
    // Check for high-usage services
    const highUsageServices = usageStats.rows.filter(service => service.usage_percentage > 80);
    if (highUsageServices.length > 0) {
      optimizations.push({
        type: 'warning',
        title: 'High Usage Alert',
        description: `${highUsageServices.length} service(s) are using over 80% of their limits`,
        action: 'Consider upgrading plans or optimizing usage'
      });
    }

    // Check for unused or low-usage services
    const lowUsageServices = usageStats.rows.filter(service => service.usage_percentage < 20 && service.usage_percentage > 0);
    if (lowUsageServices.length > 0) {
      optimizations.push({
        type: 'info',
        title: 'Low Usage Detected',
        description: `${lowUsageServices.length} service(s) are using less than 20% of their limits`,
        action: 'Consider downgrading plans to save costs'
      });
    }

    // Check for expensive services
    const expensiveServices = await pool.query(`
      SELECT name, provider, monthly_cost 
      FROM subscriptions 
      WHERE monthly_cost > 50 AND status = 'active'
      ORDER BY monthly_cost DESC
    `);
    
    if (expensiveServices.rows.length > 0) {
      optimizations.push({
        type: 'cost',
        title: 'High-Cost Services',
        description: `${expensiveServices.rows.length} service(s) cost over $50/month`,
        action: 'Review if these services provide sufficient value'
      });
    }

    return NextResponse.json({
      monthly_totals: monthlyTotals.rows[0],
      category_stats: currentStats.rows,
      usage_stats: usageStats.rows,
      renewal_schedule: renewals.rows,
      historical_data: historicalData,
      category_breakdown: categoryBreakdown.rows,
      optimizations,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}