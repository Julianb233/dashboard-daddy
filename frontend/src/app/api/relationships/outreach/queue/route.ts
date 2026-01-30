import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Direct PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// GET - View pending queue
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();

    // Get all pending messages with person details
    const result = await client.query(`
      SELECT 
        oq.*,
        p.name as person_name,
        p.phone,
        p.email,
        p.timezone,
        p.relationship_type,
        p.priority
      FROM outreach_queue oq
      JOIN people p ON oq.person_id = p.id
      WHERE oq.status = 'pending'
      ORDER BY oq.scheduled_time ASC
    `);

    const queueItems = result.rows.map(item => ({
      id: item.id,
      person_id: item.person_id,
      person_name: item.person_name,
      message: item.message,
      scheduled_time: item.scheduled_time,
      delay_reason: item.delay_reason,
      contact_info: {
        phone: item.phone,
        email: item.email
      },
      person_details: {
        timezone: item.timezone,
        relationship_type: item.relationship_type,
        priority: item.priority
      },
      created_at: item.created_at,
      retry_count: item.retry_count
    }));

    client.release();

    return NextResponse.json({
      success: true,
      queue: queueItems,
      total: queueItems.length,
      pending_today: queueItems.filter(item => {
        const scheduleDate = new Date(item.scheduled_time);
        const today = new Date();
        return scheduleDate.toDateString() === today.toDateString();
      }).length
    });

  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch queue' 
    }, { status: 500 });
  }
}

// PUT - Update queue item (edit message, reschedule)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      queue_id,
      message,
      scheduled_time,
      action // 'update', 'cancel', 'send_now'
    } = body;

    if (!queue_id || !action) {
      return NextResponse.json(
        { error: 'queue_id and action are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    if (action === 'update') {
      if (!message || !scheduled_time) {
        client.release();
        return NextResponse.json(
          { error: 'message and scheduled_time are required for updates' },
          { status: 400 }
        );
      }

      // Update the queue item
      const result = await client.query(`
        UPDATE outreach_queue 
        SET message = $1, scheduled_time = $2
        WHERE id = $3 AND status = 'pending'
        RETURNING *
      `, [message, scheduled_time, queue_id]);

      if (result.rows.length === 0) {
        client.release();
        return NextResponse.json(
          { error: 'Queue item not found or already processed' },
          { status: 404 }
        );
      }

      client.release();
      return NextResponse.json({
        success: true,
        message: 'Queue item updated successfully',
        item: result.rows[0]
      });

    } else if (action === 'cancel') {
      // Cancel the queue item
      const result = await client.query(`
        UPDATE outreach_queue 
        SET status = 'cancelled', cancelled_at = NOW()
        WHERE id = $1 AND status = 'pending'
        RETURNING *
      `, [queue_id]);

      if (result.rows.length === 0) {
        client.release();
        return NextResponse.json(
          { error: 'Queue item not found or already processed' },
          { status: 404 }
        );
      }

      // Add to history
      await client.query(`
        INSERT INTO outreach_history 
        (user_id, person_id, action, message)
        VALUES (
          (SELECT id FROM profiles WHERE id = $1),
          $2, 'cancel', $3
        )
      `, [
        '00000000-0000-0000-0000-000000000000', // TODO: Replace with actual auth
        result.rows[0].person_id,
        `Cancelled queued message: ${result.rows[0].message}`
      ]);

      client.release();
      return NextResponse.json({
        success: true,
        message: 'Queue item cancelled successfully'
      });

    } else if (action === 'send_now') {
      // Send immediately
      const queueResult = await client.query(`
        SELECT oq.*, p.name as person_name, p.phone 
        FROM outreach_queue oq
        JOIN people p ON oq.person_id = p.id
        WHERE oq.id = $1 AND oq.status = 'pending'
      `, [queue_id]);

      if (queueResult.rows.length === 0) {
        client.release();
        return NextResponse.json(
          { error: 'Queue item not found or already processed' },
          { status: 404 }
        );
      }

      const queueItem = queueResult.rows[0];

      // Send the message
      const success = await sendIMessage(queueItem.phone, queueItem.message);

      if (success) {
        // Update queue status
        await client.query(`
          UPDATE outreach_queue 
          SET status = 'sent', sent_at = NOW()
          WHERE id = $1
        `, [queue_id]);

        // Update person's last contact
        await client.query(
          'UPDATE people SET last_contacted = NOW() WHERE id = $1',
          [queueItem.person_id]
        );

        // Add to contact history
        await client.query(
          'INSERT INTO contact_history (person_id, contact_type, subject, notes, outcome, contact_date) VALUES ($1, $2, $3, $4, $5, NOW())',
          [queueItem.person_id, 'text', 'Queue Send (Manual)', queueItem.message, 'successful']
        );

        client.release();
        return NextResponse.json({
          success: true,
          message: 'Message sent successfully',
          sent_to: queueItem.phone
        });
      } else {
        // Increment retry count
        await client.query(`
          UPDATE outreach_queue 
          SET retry_count = retry_count + 1
          WHERE id = $1
        `, [queue_id]);

        client.release();
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }
    }

    client.release();
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating queue:', error);
    return NextResponse.json({ 
      error: 'Failed to update queue' 
    }, { status: 500 });
  }
}

async function sendIMessage(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Use Mac Mini SSH to send iMessage
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Clean up phone number (remove any formatting)
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    
    // AppleScript to send iMessage
    const appleScript = `
      tell application "Messages"
        set targetService to (service 1 whose service type = iMessage)
        set targetBuddy to participant "${cleanPhone}" of targetService
        send "${message.replace(/"/g, '\\"')}" to targetBuddy
      end tell
    `;

    // Execute via SSH to Mac Mini
    const sshCommand = `ssh thewizzard@100.108.83.124 'osascript -e "${appleScript.replace(/"/g, '\\"')}"'`;
    
    await execAsync(sshCommand);
    console.log(`iMessage sent to ${phoneNumber}: ${message}`);
    return true;

  } catch (error) {
    console.error('Failed to send iMessage:', error);
    return false;
  }
}