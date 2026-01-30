# Daily Outreach Approve/Deny/Delay Feature Implementation

## 🎯 Overview

Successfully implemented the Approve/Deny/Delay functionality for the Daily Outreach feature in Dashboard Daddy. This replaces the simple Send/Skip buttons with sophisticated outreach management.

## ✅ Completed Features

### 1. **Database Schema**
- ✅ `outreach_queue` table for storing approved messages
- ✅ `outreach_history` table for tracking all outreach actions
- ✅ Optimal send time calculation function
- ✅ Automatic cleanup functions
- ✅ Row-level security policies

### 2. **API Routes**
- ✅ `POST /api/relationships/outreach/approve` - Queue for optimal send time
- ✅ `POST /api/relationships/outreach/deny` - Skip and extend follow-up
- ✅ `POST /api/relationships/outreach/delay` - Remind me later (1h, 4h, tomorrow)
- ✅ `GET/PUT /api/relationships/outreach/queue` - Queue management

### 3. **Frontend Updates**
- ✅ Replaced Send/Skip with Approve/Deny/Delay buttons
- ✅ Delay dropdown with time options
- ✅ Outreach Queue modal for management
- ✅ Queue item editing and cancellation
- ✅ Send now override functionality

### 4. **Background Processing**
- ✅ `process-outreach-queue.js` script for automated sending
- ✅ Cron job setup script for every 5 minutes
- ✅ Retry logic with exponential backoff
- ✅ Comprehensive logging

### 5. **Smart Send Timing**
- ✅ Contact timezone inference from phone area codes
- ✅ Industry best practices (B2B: 9-11am, B2C: 6-8pm)
- ✅ Weekend/business hours awareness
- ✅ Priority-based timing adjustments

## 🚀 How It Works

### Approve Flow
1. User clicks **Approve** ✅
2. Message is stored in `outreach_queue` with calculated optimal send time
3. Background job processes queue every 5 minutes
4. Message is sent via iMessage at optimal time
5. Contact history is updated

### Deny Flow
1. User clicks **Deny** ❌
2. Action is logged to `outreach_history`
3. Person's `next_follow_up` is extended by 7 days
4. Person won't appear in suggestions for a week

### Delay Flow
1. User clicks **Delay** ⏰ and selects timeframe
2. Message is queued for the specified delay time
3. Options: 1 hour, 4 hours, tomorrow (9 AM)
4. Background job will process when time comes

### Queue Management
1. View all pending messages in queue
2. Edit message content before sending
3. Cancel queued messages
4. Send immediately with override
5. Visual indicators for overdue/due today

## 📊 Database Tables

### `outreach_queue`
```sql
id UUID PRIMARY KEY
user_id UUID (FK to profiles)
person_id UUID (FK to people)
message TEXT
status VARCHAR (pending/sent/cancelled)
scheduled_time TIMESTAMPTZ
original_trigger JSONB
delay_reason VARCHAR
created_at TIMESTAMPTZ
sent_at TIMESTAMPTZ
cancelled_at TIMESTAMPTZ
retry_count INTEGER
```

### `outreach_history`
```sql
id UUID PRIMARY KEY
user_id UUID (FK to profiles)
person_id UUID (FK to people)
action VARCHAR (approve/deny/delay/send/cancel)
message TEXT
scheduled_time TIMESTAMPTZ
delay_reason VARCHAR
created_at TIMESTAMPTZ
```

## 🤖 Background Job Setup

### Installation
```bash
cd /home/dev/dashboard-daddy
chmod +x scripts/setup-outreach-cron.sh
./scripts/setup-outreach-cron.sh
```

### Manual Testing
```bash
cd /home/dev/dashboard-daddy
node scripts/process-outreach-queue.js
```

### Monitoring
```bash
# View logs
tail -f /home/dev/dashboard-daddy/logs/outreach-queue.log

# Check cron status
crontab -l

# View queue stats
node -e "require('./scripts/process-outreach-queue.js').getQueueStats().then(console.log)"
```

## 🧠 Smart Send Time Algorithm

### B2B Contacts (clients, prospects, partners)
- **High Priority:** 9:00 AM in their timezone
- **Medium Priority:** 10:00 AM in their timezone
- **Avoids weekends:** Moves to Monday if scheduled for Sat/Sun

### Personal Contacts (family, friends)
- **Critical Priority:** 6:00 PM in their timezone
- **Normal Priority:** 7:00 PM in their timezone
- **Weekend-friendly:** No weekend restrictions

### Timezone Detection
- Automatically inferred from phone area codes
- Falls back to PST if unknown
- Covers all major US timezones

### Business Hours Logic
- If current time is after 8 PM or before 8 AM, schedules for next day
- Respects local business hours in recipient's timezone
- Smart scheduling avoids late-night/early morning sends

## 🔧 API Usage Examples

### Approve an Outreach
```javascript
const response = await fetch('/api/relationships/outreach/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    person_id: 'uuid-here',
    message: 'Hey John! Hope you're doing well...',
    original_trigger: { /* trigger data */ }
  })
});
```

### Delay an Outreach
```javascript
const response = await fetch('/api/relationships/outreach/delay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    person_id: 'uuid-here',
    message: 'Hey John! Hope you're doing well...',
    delay_reason: '4h', // or '1h', 'tomorrow', 'custom'
    original_trigger: { /* trigger data */ }
  })
});
```

### View Queue
```javascript
const response = await fetch('/api/relationships/outreach/queue');
const { queue, total, pending_today } = await response.json();
```

## 🎨 UI Components Added

### Action Buttons
- **Approve** (✅) - Green gradient button
- **Deny** (❌) - Red button with warning styling  
- **Delay** (⏰) - Yellow button with dropdown

### Delay Dropdown
- 1 hour option
- 4 hours option
- Tomorrow (9 AM) option
- Future: Custom time picker

### Queue Modal
- **Outreach Queue** button in header
- Grid view of pending messages
- Status indicators (overdue, due today, future)
- Action buttons: Cancel, Edit, Send Now

### Queue Item Display
- Person name and relationship type
- Scheduled send time with status coloring
- Message preview in styled box
- Contact info (phone number)
- Delay reason if applicable

## 📈 Benefits

### For Users
1. **No more pressure** - Can approve without immediate sending
2. **Smart timing** - Messages sent at optimal times
3. **Easy management** - Queue view for all pending messages
4. **Flexibility** - Delay options for different situations
5. **Better results** - Optimal timing increases response rates

### For Relationships
1. **Consistent follow-up** - Never miss important contacts
2. **Professional timing** - Business messages during business hours
3. **Personal touch** - Personal messages at appropriate times
4. **Reduces overwhelm** - Spread out communications naturally

### For Analytics
1. **Action tracking** - Complete history of all outreach decisions
2. **Success metrics** - Track which timing strategies work best
3. **Queue monitoring** - Visibility into pending communications
4. **Performance data** - Send success rates and retry patterns

## 🔮 Future Enhancements

### Phase 2 (Potential)
- [ ] Custom time picker for delays
- [ ] Email sending integration
- [ ] Response tracking and AI analysis
- [ ] A/B testing for send times
- [ ] Bulk approve/deny actions
- [ ] Message templates and personalization
- [ ] Integration with calendar for meeting-based timing
- [ ] Response rate analytics by send time
- [ ] Smart retry logic based on historical data
- [ ] Mobile app integration

### Phase 3 (Advanced)
- [ ] AI-powered message optimization
- [ ] Cross-platform messaging (SMS, WhatsApp, etc.)
- [ ] Sentiment analysis for timing
- [ ] Dynamic scheduling based on recipient activity
- [ ] Team collaboration features
- [ ] Advanced timezone detection (IP, social profiles)
- [ ] Integration with CRM systems

## 🛠️ Maintenance

### Regular Tasks
- Monitor queue processing logs
- Review send success rates
- Clean up old queue items (automatic)
- Update timezone mapping as needed

### Troubleshooting
- Check SSH access to Mac Mini for iMessage
- Verify database connectivity
- Monitor cron job execution
- Review error logs for failed sends

### Performance
- Queue processes up to 10 messages per run (5-minute intervals)
- Automatic retry with exponential backoff
- Row-level security ensures data isolation
- Efficient indexing for queue queries

---

## 🎉 Status: **COMPLETE** ✅

The Approve/Deny/Delay functionality is now fully implemented and ready for use. The system provides intelligent outreach management with optimal send timing, comprehensive queue management, and robust background processing.

### Files Modified/Created:
- ✅ `/frontend/src/app/relationships/page.tsx` - Updated UI
- ✅ `/supabase/outreach-queue-schema.sql` - Database schema
- ✅ `/scripts/process-outreach-queue.js` - Background processor
- ✅ `/scripts/apply-schema.js` - Schema deployment
- ✅ `/scripts/setup-outreach-cron.sh` - Cron setup
- ✅ API routes: `/api/relationships/outreach/{approve,deny,delay,queue}/route.ts`

**Ready for production use!** 🚀