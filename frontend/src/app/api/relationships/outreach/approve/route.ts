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
      original_trigger,
      custom_send_time 
    } = body;

    if (!person_id || !message) {
      return NextResponse.json(
        { error: 'person_id and message are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Get person details for timezone calculation
    const personResult = await client.query(
      'SELECT * FROM people WHERE id = $1',
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

    // Calculate optimal send time if not provided
    let scheduledTime;
    if (custom_send_time) {
      scheduledTime = new Date(custom_send_time);
    } else {
      // Use the database function to calculate optimal time
      const optimalTimeResult = await client.query(
        'SELECT calculate_optimal_send_time($1, $2, $3) as optimal_time',
        [
          person.timezone || 'America/Los_Angeles',
          person.relationship_type || 'contact',
          person.priority || 'medium'
        ]
      );
      scheduledTime = optimalTimeResult.rows[0].optimal_time;
    }

    // Add to outreach queue
    const queueResult = await client.query(`
      INSERT INTO outreach_queue 
      (user_id, person_id, message, scheduled_time, original_trigger, status)
      VALUES (
        (SELECT id FROM profiles WHERE id = $1),
        $2, $3, $4, $5, 'pending'
      )
      RETURNING *
    `, [
      '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual auth
      person_id,
      message,
      scheduledTime,
      JSON.stringify(original_trigger)
    ]);

    // Add to history
    await client.query(`
      INSERT INTO outreach_history 
      (user_id, person_id, action, message, scheduled_time)
      VALUES (
        (SELECT id FROM profiles WHERE id = $1),
        $2, 'approve', $3, $4
      )
    `, [
      '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual auth
      person_id,
      message,
      scheduledTime
    ]);

    client.release();

    return NextResponse.json({
      success: true,
      message: 'Message approved and queued for optimal send time',
      queue_id: queueResult.rows[0].id,
      scheduled_time: scheduledTime,
      person_name: person.name
    });

  } catch (error) {
    console.error('Error approving outreach:', error);
    return NextResponse.json({ 
      error: 'Failed to approve outreach' 
    }, { status: 500 });
  }
}