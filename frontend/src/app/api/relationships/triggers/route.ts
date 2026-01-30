import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Direct PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM people 
      WHERE is_active = true
      ORDER BY last_contact_date ASC NULLS FIRST
    `);
    client.release();
    
    const people = result.rows;
    const now = new Date();
    const triggers: any[] = [];

    for (const person of people) {
      const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
      
      // Calculate days since various contacts
      const daysSinceContact = person.last_contact_date 
        ? Math.floor((now.getTime() - new Date(person.last_contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const daysSinceCall = person.last_call_date
        ? Math.floor((now.getTime() - new Date(person.last_call_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const daysSinceText = person.last_text_date
        ? Math.floor((now.getTime() - new Date(person.last_text_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const daysSinceMeeting = person.last_meeting_date
        ? Math.floor((now.getTime() - new Date(person.last_meeting_date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Inner circle - high priority
      if (person.circle === 'inner') {
        if (daysSinceContact === null) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.circle,
            role: person.relationship_role,
            trigger_type: 'no_contact_warning',
            priority: 'urgent',
            reason: `Never contacted ${name} (inner circle)`,
            suggested_action: 'Schedule a call or coffee',
            days_since: null,
            last_contact_type: null
          });
        } else if (daysSinceContact > 14) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.circle,
            role: person.relationship_role,
            trigger_type: 'relationship_cooling',
            priority: 'urgent',
            reason: `${daysSinceContact} days since contact with ${name} (inner circle)`,
            suggested_action: 'Reach out today - inner circle needs regular contact',
            days_since: daysSinceContact,
            last_contact_type: getLastContactType(person)
          });
        } else if (daysSinceContact > 7) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.circle,
            role: person.relationship_role,
            trigger_type: 'check_in_needed',
            priority: 'high',
            reason: `${daysSinceContact} days since contact with ${name}`,
            suggested_action: 'Quick check-in recommended',
            days_since: daysSinceContact,
            last_contact_type: getLastContactType(person)
          });
        }
      }

      // Key contacts
      if (person.circle === 'key') {
        if (daysSinceContact === null) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.circle,
            role: person.relationship_role,
            trigger_type: 'no_contact_warning',
            priority: 'high',
            reason: `Never contacted ${name} (key contact)`,
            suggested_action: 'Schedule initial touchpoint',
            days_since: null,
            last_contact_type: null
          });
        } else if (daysSinceContact > 30) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.circle,
            role: person.relationship_role,
            trigger_type: 'relationship_cooling',
            priority: 'high',
            reason: `${daysSinceContact} days since contact with ${name}`,
            suggested_action: 'Time for a meaningful touchpoint',
            days_since: daysSinceContact,
            last_contact_type: getLastContactType(person)
          });
        }
      }

      // Mentors need regular contact
      if (person.relationship_role === 'mentor' && daysSinceContact && daysSinceContact > 21) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.circle,
          role: person.relationship_role,
          trigger_type: 'check_in_needed',
          priority: 'high',
          reason: `Haven't connected with mentor ${name} in ${daysSinceContact} days`,
          suggested_action: 'Share an update or ask for guidance',
          days_since: daysSinceContact,
          last_contact_type: getLastContactType(person)
        });
      }

      // Disciples need encouragement
      if (person.relationship_role === 'disciple' && daysSinceContact && daysSinceContact > 7) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.circle,
          role: person.relationship_role,
          trigger_type: 'check_in_needed',
          priority: 'high',
          reason: `Disciple ${name} may need encouragement (${daysSinceContact} days)`,
          suggested_action: 'Send encouragement or check on prayer requests',
          days_since: daysSinceContact,
          last_contact_type: getLastContactType(person)
        });
      }

      // Pending action items
      if (person.pending_action_items && person.pending_action_items.length > 0) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.circle,
          role: person.relationship_role,
          trigger_type: 'action_item_pending',
          priority: 'medium',
          reason: `${person.pending_action_items.length} pending action items with ${name}`,
          suggested_action: person.pending_action_items[0],
          days_since: daysSinceContact,
          action_items: person.pending_action_items
        });
      }

      // Birthday check (if within 7 days)
      if (person.birthday) {
        const bday = new Date(person.birthday);
        const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        if (thisYearBday < now) {
          thisYearBday.setFullYear(now.getFullYear() + 1);
        }
        const daysUntilBirthday = Math.floor((thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilBirthday <= 7 && daysUntilBirthday >= 0) {
          triggers.push({
            person_id: person.id,
            person_name: name,
            circle: person.circle,
            role: person.relationship_role,
            trigger_type: 'birthday_upcoming',
            priority: daysUntilBirthday <= 1 ? 'urgent' : 'high',
            reason: daysUntilBirthday === 0 
              ? `Today is ${name}'s birthday!` 
              : `${name}'s birthday is in ${daysUntilBirthday} days`,
            suggested_action: 'Send birthday wishes',
            days_until: daysUntilBirthday
          });
        }
      }

      // Quality declining (if we have history)
      if (person.last_interaction_quality && person.last_interaction_quality < 5) {
        triggers.push({
          person_id: person.id,
          person_name: name,
          circle: person.circle,
          role: person.relationship_role,
          trigger_type: 'quality_declining',
          priority: 'medium',
          reason: `Last interaction with ${name} was rated ${person.last_interaction_quality}/10`,
          suggested_action: 'Consider a more meaningful touchpoint',
          quality_score: person.last_interaction_quality
        });
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    triggers.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);

    return NextResponse.json({
      triggers,
      summary: {
        total: triggers.length,
        urgent: triggers.filter(t => t.priority === 'urgent').length,
        high: triggers.filter(t => t.priority === 'high').length,
        medium: triggers.filter(t => t.priority === 'medium').length
      },
      generated_at: now.toISOString()
    });

  } catch (error) {
    console.error('Error generating triggers:', error);
    return NextResponse.json({ error: 'Failed to generate triggers', triggers: [] }, { status: 500 });
  }
}

function getLastContactType(person: any): string | null {
  const contacts = [
    { type: 'call', date: person.last_call_date },
    { type: 'text', date: person.last_text_date },
    { type: 'meeting', date: person.last_meeting_date },
    { type: 'email', date: person.last_email_date },
  ].filter(c => c.date);

  if (contacts.length === 0) return null;

  contacts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return contacts[0].type;
}
