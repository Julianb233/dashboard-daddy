import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Direct PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: NextRequest) {
  try {
    // Generate triggers directly instead of using the triggers endpoint
    const client = await pool.connect();
    
    // Get all active people with their contact dates
    const result = await client.query(`
      SELECT * FROM people 
      WHERE status = 'active' 
      ORDER BY last_contacted ASC NULLS FIRST 
      LIMIT 20
    `);
    
    const people = result.rows;
    client.release();

    const now = new Date();
    const triggers: any[] = [];

    for (const person of people) {
      const name = person.name;
      
      // Calculate days since contact
      const daysSinceContact = person.last_contacted 
        ? Math.floor((now.getTime() - new Date(person.last_contacted).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Generate triggers based on priority and contact history
      let triggerAdded = false;

      // Critical priority relationships - need frequent contact
      if (person.priority === 'critical' && !triggerAdded) {
        if (daysSinceContact === null) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.priority,
            role: person.relationship_type,
            trigger_type: 'no_contact_warning',
            priority: 'urgent',
            reason: `Never contacted ${name} (critical priority)`,
            suggested_action: 'Schedule a call or meeting',
            days_since: null,
            last_contact_type: null
          });
          triggerAdded = true;
        } else if (daysSinceContact > 7) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.priority,
            role: person.relationship_type,
            trigger_type: 'relationship_cooling',
            priority: 'urgent',
            reason: `${daysSinceContact} days since contact with ${name} (critical priority)`,
            suggested_action: 'Reach out today - critical relationship needs attention',
            days_since: daysSinceContact,
            last_contact_type: 'unknown'
          });
          triggerAdded = true;
        }
      }

      // High priority relationships  
      if (person.priority === 'high' && !triggerAdded) {
        if (daysSinceContact === null) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.priority,
            role: person.relationship_type,
            trigger_type: 'no_contact_warning',
            priority: 'high',
            reason: `Never contacted ${name} (high priority)`,
            suggested_action: 'Schedule initial touchpoint',
            days_since: null,
            last_contact_type: null
          });
          triggerAdded = true;
        } else if (daysSinceContact > 14) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.priority,
            role: person.relationship_type,
            trigger_type: 'relationship_cooling',
            priority: 'high',
            reason: `${daysSinceContact} days since contact with ${name}`,
            suggested_action: 'Time for a meaningful touchpoint',
            days_since: daysSinceContact,
            last_contact_type: 'unknown'
          });
          triggerAdded = true;
        }
      }

      // Family and friends need regular contact
      if ((person.relationship_type === 'family' || person.relationship_type === 'friend') && daysSinceContact && daysSinceContact > 21 && !triggerAdded) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.priority,
          role: person.relationship_type,
          trigger_type: 'check_in_needed',
          priority: 'high',
          reason: `Haven't connected with ${person.relationship_type} ${name} in ${daysSinceContact} days`,
          suggested_action: 'Send a personal message or plan to meet up',
          days_since: daysSinceContact,
          last_contact_type: 'unknown'
        });
        triggerAdded = true;
      }

      // Medium priority contacts that have never been contacted
      if (person.priority === 'medium' && daysSinceContact === null && !triggerAdded) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.priority,
          role: person.relationship_type,
          trigger_type: 'no_contact_warning',
          priority: 'medium',
          reason: `Never reached out to ${name} - good time to connect`,
          suggested_action: 'Send initial greeting',
          days_since: null,
          last_contact_type: null
        });
        triggerAdded = true;
      }

      // Medium priority contacts that haven't been contacted in a while  
      if (person.priority === 'medium' && daysSinceContact && daysSinceContact > 30 && !triggerAdded) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.priority,
          role: person.relationship_type,
          trigger_type: 'check_in_needed',
          priority: 'medium',
          reason: `It's been ${daysSinceContact} days since you contacted ${name}`,
          suggested_action: 'Send a quick check-in message',
          days_since: daysSinceContact,
          last_contact_type: 'unknown'
        });
        triggerAdded = true;
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    triggers.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

    // Get the top 5 most important triggers
    const topTriggers = triggers.slice(0, 5);

    // Generate personalized message drafts for each
    const outreaches = await Promise.all(
      topTriggers.map(async (trigger: any) => {
        // Get additional person details
        try {
          const client = await pool.connect();
          const result = await client.query('SELECT * FROM people WHERE id = $1', [trigger.person_id]);
          client.release();
          
          if (result.rows.length === 0) {
            console.error('Person not found:', trigger.person_id);
            return null;
          }
          
          const person = result.rows[0];

        const messageDraft = generatePersonalizedMessage(trigger, person);
        
        return {
          id: `outreach-${trigger.person_id}`,
          person_id: trigger.person_id,
          person_name: trigger.person_name,
          phone: person.phone,
          circle: trigger.circle || person.priority || 'medium',
          role: trigger.role || person.relationship_type,
          trigger_type: trigger.trigger_type,
          priority: trigger.priority,
          reason: trigger.reason,
          message_draft: messageDraft,
          contact_info: {
            phone: person.phone,
            email: person.email
          },
          last_contact: {
            type: trigger.last_contact_type,
            days_ago: trigger.days_since
          }
        };
        } catch (error) {
          console.error('Error fetching person:', error);
          return null;
        }
      })
    );

    // Filter out any null results
    const validOutreaches = outreaches.filter(Boolean);

    return NextResponse.json({
      outreaches: validOutreaches,
      summary: {
        total: validOutreaches.length,
        urgent: validOutreaches.filter(o => o.priority === 'urgent').length,
        high: validOutreaches.filter(o => o.priority === 'high').length
      },
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating outreaches:', error);
    return NextResponse.json({ 
      error: 'Failed to generate outreaches', 
      outreaches: [] 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { person_id, message, contact_method = 'text' } = body;

    if (!person_id || !message) {
      return NextResponse.json(
        { error: 'person_id and message are required' },
        { status: 400 }
      );
    }

    // Get person details
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM people WHERE id = $1', [person_id]);
    
    if (result.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }
    
    const person = result.rows[0];

    if (contact_method === 'text' && person.phone) {
      // Send via iMessage using Mac Mini SSH
      const success = await sendIMessage(person.phone, message);
      
      if (success) {
        // Update last contact date
        await client.query(
          'UPDATE people SET last_contacted = $1 WHERE id = $2',
          [new Date().toISOString(), person_id]
        );

        // Add to contact history
        await client.query(
          'INSERT INTO contact_history (person_id, contact_type, subject, notes, outcome, contact_date) VALUES ($1, $2, $3, $4, $5, $6)',
          [person_id, 'text', 'Daily Outreach', message, 'successful', new Date().toISOString()]
        );

        client.release();

        return NextResponse.json({
          success: true,
          message: 'Message sent successfully',
          sent_to: person.phone
        });
      } else {
        client.release();
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }
    }

    client.release();
    return NextResponse.json(
      { error: 'Unsupported contact method or missing contact info' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error sending outreach:', error);
    return NextResponse.json({ 
      error: 'Failed to send outreach' 
    }, { status: 500 });
  }
}

function generatePersonalizedMessage(trigger: any, person: any): string {
  const fullName = person.name || trigger.person_name || 'there';
  const name = fullName.split(' ')[0];
  // Handle edge cases like "Dr. Name" or "Contact Name"
  const firstName = name.includes('Dr.') || name.includes('Contact') ? 
    (fullName.split(' ')[1] || name) : name;
  
  // Generate message based on trigger type
  switch (trigger.trigger_type) {
    case 'birthday_upcoming':
      if (trigger.days_until === 0) {
        return `🎉 Happy Birthday, ${firstName}! Hope you have an amazing day celebrating. What's the plan for today?`;
      } else {
        return `Hey ${firstName}! I saw your birthday is coming up in ${trigger.days_until} days. Any fun plans? 🎂`;
      }

    case 'relationship_cooling':
      const relationshipType = trigger.role || trigger.relationship_type;
      if (relationshipType === 'family') {
        return `Hi ${firstName}! I've been thinking about you and the family. It's been way too long since we caught up. How's everyone doing?`;
      } else if (relationshipType === 'friend') {
        return `${firstName}! I realized it's been way too long since we connected. Miss our conversations - can we catch up soon?`;
      } else if (relationshipType === 'client') {
        return `Hi ${firstName}! I wanted to check in and see how things are going with your projects. Any updates or new challenges I can help with?`;
      } else if (relationshipType === 'partner') {
        return `Hi ${firstName}! Been thinking about our partnership and wanted to share some updates. How have things been on your end?`;
      } else if (relationshipType === 'mentor') {
        return `Hi ${firstName}! I've been thinking about our conversations and wanted to check in. How have things been going for you? Any updates to share?`;
      } else {
        return `Hi ${firstName}! Been thinking about you and wanted to reconnect. How have you been? Would love to hear what's new.`;
      }

    case 'check_in_needed':
      const checkInRole = trigger.role || trigger.relationship_type;
      if (checkInRole === 'family') {
        return `Hey ${firstName}! Just wanted to check in and see how you and everyone are doing. Miss seeing you!`;
      } else if (checkInRole === 'friend') {
        return `Hey ${firstName}! Just wanted to check in and see how you're doing. What's been keeping you busy lately?`;
      } else if (checkInRole === 'client') {
        return `Hi ${firstName}! Checking in to see how your projects are going. Is there anything I can help you with or any updates you'd like to share?`;
      } else if (checkInRole === 'prospect') {
        return `Hi ${firstName}! I wanted to follow up and see if there's anything new I can help you with. How has business been?`;
      } else if (checkInRole === 'partner') {
        return `Hi ${firstName}! Just checking in on our partnership. Any new opportunities or updates to share?`;
      } else if (checkInRole === 'mentor') {
        return `Hi ${firstName}! Just wanted to check in and see how you're doing. Would love to hear what you've been working on lately.`;
      } else {
        return `Hey ${firstName}! Just wanted to check in and see how you're doing. What's been keeping you busy lately?`;
      }

    case 'no_contact_warning':
      const circle = trigger.circle || 'medium';
      if (circle === 'inner' || trigger.priority === 'urgent') {
        return `${firstName}! I can't believe we haven't connected yet. I'd really love to get to know you better - are you free for coffee sometime this week?`;
      } else {
        return `Hi ${firstName}! I don't think we've had a chance to properly connect yet. Would love to schedule some time to chat - are you available for a quick call?`;
      }

    case 'follow_up_due':
      return `Hi ${firstName}! Following up on our last conversation - I wanted to ${trigger.suggested_action.toLowerCase()}. How does your schedule look this week?`;

    default:
      // Generic fallback based on relationship type
      const defaultRole = trigger.role || trigger.relationship_type;
      if (defaultRole === 'family') {
        return `Hi ${firstName}! Hope you're doing well. Just wanted to reach out and see how you and the family are doing. Love you!`;
      } else if (defaultRole === 'friend') {
        return `Hey ${firstName}! Hope you're having a great day. Just wanted to reach out and see how things are going. What's new with you?`;
      } else if (defaultRole === 'client') {
        return `Hi ${firstName}! Hope your projects are going well. Just wanted to check in and see if there's anything I can help you with.`;
      } else if (defaultRole === 'mentor') {
        return `Hi ${firstName}! Hope you're doing well. Just wanted to reach out and see how you've been. What's new in your world?`;
      } else {
        return `Hi ${firstName}! Hope you're having a great day. Just wanted to reach out and see how things are going. What's new with you?`;
      }
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