import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

export interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: string;
  monthly_cost: number;
  billing_cycle: string;
  next_renewal: string;
  usage_limit?: number;
  current_usage?: number;
  usage_unit?: string;
  status: string;
  notes?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

// GET /api/subscriptions
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT * FROM subscriptions 
      ORDER BY category, name
    `);
    
    return NextResponse.json({
      subscriptions: result.rows,
      total_count: result.rows.length,
      total_monthly_cost: result.rows.reduce((sum, sub) => sum + parseFloat(sub.monthly_cost), 0)
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}

// POST /api/subscriptions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      provider,
      category,
      monthly_cost,
      billing_cycle = 'monthly',
      next_renewal,
      usage_limit,
      current_usage = 0,
      usage_unit,
      status = 'active',
      notes,
      url
    } = body;

    const result = await pool.query(`
      INSERT INTO subscriptions (
        name, provider, category, monthly_cost, billing_cycle, next_renewal,
        usage_limit, current_usage, usage_unit, status, notes, url
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      name, provider, category, monthly_cost, billing_cycle, next_renewal,
      usage_limit, current_usage, usage_unit, status, notes, url
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}

// PUT /api/subscriptions (bulk update)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(updateData)];

    const result = await pool.query(`
      UPDATE subscriptions 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}

// DELETE /api/subscriptions
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 });
    }

    const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}