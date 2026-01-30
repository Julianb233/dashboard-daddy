#!/usr/bin/env node

/**
 * Background job to process the outreach queue
 * Sends approved messages at their optimal scheduled times
 * 
 * Usage: node process-outreach-queue.js
 * Cron: */5 * * * * (every 5 minutes)
 */

const { Pool } = require('pg');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function sendIMessage(phoneNumber, message) {
  try {
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
    console.log(`✅ iMessage sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send iMessage to ${phoneNumber}:`, error.message);
    return false;
  }
}

async function processOutreachQueue() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Processing outreach queue...');
    
    // Get all pending messages that are due to be sent
    const result = await client.query(`
      SELECT 
        oq.*,
        p.name as person_name,
        p.phone,
        p.email
      FROM outreach_queue oq
      JOIN people p ON oq.person_id = p.id
      WHERE oq.status = 'pending'
      AND oq.scheduled_time <= NOW()
      ORDER BY oq.scheduled_time ASC
      LIMIT 10
    `);

    const dueMessages = result.rows;
    console.log(`📬 Found ${dueMessages.length} messages due to be sent`);

    if (dueMessages.length === 0) {
      console.log('✨ No messages due for sending');
      return;
    }

    for (const message of dueMessages) {
      console.log(`\n📤 Processing message for ${message.person_name}...`);
      
      // Check if person has a phone number
      if (!message.phone) {
        console.log(`⚠️  No phone number for ${message.person_name}, skipping`);
        
        // Mark as failed with reason
        await client.query(`
          UPDATE outreach_queue 
          SET status = 'cancelled', cancelled_at = NOW()
          WHERE id = $1
        `, [message.id]);
        
        continue;
      }

      // Try to send the message
      const success = await sendIMessage(message.phone, message.message);

      if (success) {
        // Mark as sent
        await client.query(`
          UPDATE outreach_queue 
          SET status = 'sent', sent_at = NOW()
          WHERE id = $1
        `, [message.id]);

        // Update person's last contact date
        await client.query(
          'UPDATE people SET last_contacted = NOW() WHERE id = $1',
          [message.person_id]
        );

        // Add to contact history
        await client.query(
          'INSERT INTO contact_history (person_id, contact_type, subject, notes, outcome, contact_date) VALUES ($1, $2, $3, $4, $5, NOW())',
          [message.person_id, 'text', 'Auto Outreach (Scheduled)', message.message, 'successful']
        );

        console.log(`✅ Successfully sent message to ${message.person_name}`);

      } else {
        // Increment retry count
        const retryCount = (message.retry_count || 0) + 1;
        
        if (retryCount >= 3) {
          // Max retries reached, mark as cancelled
          await client.query(`
            UPDATE outreach_queue 
            SET status = 'cancelled', cancelled_at = NOW(), retry_count = $2
            WHERE id = $1
          `, [message.id, retryCount]);
          
          console.log(`❌ Message to ${message.person_name} failed after ${retryCount} attempts, cancelled`);
        } else {
          // Reschedule for 15 minutes later
          const nextTry = new Date(Date.now() + 15 * 60 * 1000);
          
          await client.query(`
            UPDATE outreach_queue 
            SET scheduled_time = $2, retry_count = $3
            WHERE id = $1
          `, [message.id, nextTry, retryCount]);
          
          console.log(`🔄 Message to ${message.person_name} rescheduled for retry ${retryCount}/3 at ${nextTry.toLocaleTimeString()}`);
        }
      }

      // Small delay between messages to be polite
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Cleanup old processed messages
    const cleanupResult = await client.query('SELECT cleanup_old_outreach()');
    const deletedCount = cleanupResult.rows[0].cleanup_old_outreach;
    
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old outreach records`);
    }

  } catch (error) {
    console.error('❌ Error processing outreach queue:', error);
  } finally {
    client.release();
  }
}

async function getQueueStats() {
  const client = await pool.connect();
  
  try {
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_pending,
        COUNT(*) FILTER (WHERE scheduled_time <= NOW()) as due_now,
        COUNT(*) FILTER (WHERE scheduled_time > NOW() AND scheduled_time <= NOW() + INTERVAL '1 hour') as due_next_hour,
        COUNT(*) FILTER (WHERE scheduled_time > NOW() AND scheduled_time <= NOW() + INTERVAL '1 day') as due_today
      FROM outreach_queue 
      WHERE status = 'pending'
    `);

    return stats.rows[0];
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    console.log('\n🚀 Outreach Queue Processor Started');
    console.log('⏰ Time:', new Date().toLocaleString());
    
    // Get current queue stats
    const stats = await getQueueStats();
    console.log('📊 Queue Stats:', {
      total_pending: stats.total_pending,
      due_now: stats.due_now,
      due_next_hour: stats.due_next_hour,
      due_today: stats.due_today
    });

    // Process the queue
    await processOutreachQueue();
    
    console.log('✅ Outreach queue processing completed\n');
    
  } catch (error) {
    console.error('💥 Fatal error in queue processor:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processOutreachQueue, getQueueStats };