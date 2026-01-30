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
      delay_reason, // '1h', '4h', 'tomorrow', 'custom'
      custom_time,
      original_trigger
    } = body;

    if (!person_id || !message || !delay_reason) {
      return NextResponse.json(
        { error: 'person_id, message, and delay_reason are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    // Get person details
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

    // Calculate delay time
    let delayedTime: Date;
    const now = new Date();

    switch (delay_reason) {
      case '1h':
        delayedTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
        break;
      case '4h':
        delayedTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours
        break;
      case 'tomorrow':
        delayedTime = new Date(now);
        delayedTime.setDate(delayedTime.getDate() + 1);
        delayedTime.setHours(9, 0, 0, 0); // 9 AM tomorrow
        break;
      case 'custom':
        if (!custom_time) {
          client.release();
          return NextResponse.json(
            { error: 'custom_time is required when delay_reason is custom' },
            { status: 400 }
          );
        }
        delayedTime = new Date(custom_time);
        break;
      default:
        client.release();
        return NextResponse.json(
          { error: 'Invalid delay_reason. Must be 1h, 4h, tomorrow, or custom' },
          { status: 400 }
        );
    }

    // Add to outreach queue with delayed time
    const queueResult = await client.query(`
      INSERT INTO outreach_queue 
      (user_id, person_id, message, scheduled_time, original_trigger, status, delay_reason)
      VALUES (
        (SELECT id FROM profiles WHERE id = $1),
        $2, $3, $4, $5, 'pending', $6
      )
      RETURNING *
    `, [
      '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual auth
      person_id,
      message,
      delayedTime,
      JSON.stringify(original_trigger),
      delay_reason
    ]);

    // Add to history
    await client.query(`
      INSERT INTO outreach_history 
      (user_id, person_id, action, message, scheduled_time, delay_reason)
      VALUES (
        (SELECT id FROM profiles WHERE id = $1),
        $2, 'delay', $3, $4, $5
      )
    `, [
      '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual auth
      person_id,
      message,
      delayedTime,
      delay_reason
    ]);

    client.release();

    return NextResponse.json({
      success: true,
      message: `Message delayed for ${delay_reason}`,
      queue_id: queueResult.rows[0].id,
      scheduled_time: delayedTime,
      person_name: person.name,
      delay_reason: delay_reason
    });

  } catch (error) {
    console.error('Error delaying outreach:', error);
    return NextResponse.json({ 
      error: 'Failed to delay outreach' 
    }, { status: 500 });
  }
}