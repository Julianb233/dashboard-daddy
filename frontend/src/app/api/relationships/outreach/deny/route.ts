import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Direct PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      person_id, 
      message,
      reason = 'User declined to send'
    } = body;

    if (!person_id || !message) {
      return NextResponse.json(
        { error: 'person_id and message are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Get person details
    const personResult = await client.query(
      'SELECT name FROM people WHERE id = $1',
      [person_id]
    );

    if (personResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }

    const person = personResult.rows[0];

    // Add to history (no queue entry needed for denied messages)
    await client.query(`
      INSERT INTO outreach_history 
      (user_id, person_id, action, message, created_at)
      VALUES (
        (SELECT id FROM profiles WHERE id = $1),
        $2, 'deny', $3, NOW()
      )
    `, [
      '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual auth
      person_id,
      `DENIED: ${message} (Reason: ${reason})`
    ]);

    // Optionally update person's next_follow_up to push it out further
    // This prevents the same person from appearing in outreach again soon
    await client.query(`
      UPDATE people 
      SET next_follow_up = CASE 
        WHEN next_follow_up IS NULL THEN NOW() + INTERVAL '7 days'
        ELSE next_follow_up + INTERVAL '7 days'
      END
      WHERE id = $1
    `, [person_id]);

    client.release();

    return NextResponse.json({
      success: true,
      message: 'Outreach denied and logged',
      person_name: person.name,
      action_taken: 'Follow-up date extended by 7 days'
    });

  } catch (error) {
    console.error('Error denying outreach:', error);
    return NextResponse.json({ 
      error: 'Failed to deny outreach' 
    }, { status: 500 });
  }
}