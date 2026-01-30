# Personal Concierge Food Ordering System - Setup Guide

## 🎯 Overview

I've built a comprehensive personal concierge system for Dashboard Daddy that handles food ordering through multiple channels:

### ✅ Completed Features:

1. **DoorDash Integration** (`/api/concierge/doordash`)
   - Order history tracking
   - Favorite restaurant management
   - AI-powered suggestions based on time of day, weather, and preferences
   - One-click reordering
   - New order creation

2. **Restaurant Calling via Vapi** (`/api/concierge/restaurant-call`)
   - AI assistant makes calls for you
   - Check hours, wait times, make reservations
   - Transcript analysis and structured data extraction
   - Call history and summaries

3. **Dashboard UI** (`/concierge`)
   - Beautiful overview page with tabs
   - Recent orders and call history
   - "I'm Hungry" quick suggestions
   - Favorite restaurants management
   - Interactive buttons for quick actions

4. **Telegram Integration** (`/api/concierge/telegram`)
   - Detects "I'm hungry" messages
   - Responds with personalized suggestions and quick order buttons
   - Order confirmations and call summaries
   - Inline keyboard with interactive options

5. **Database Schema**
   - `food_orders` - Complete order tracking
   - `restaurant_favorites` - Learning your preferences
   - `restaurant_call_logs` - Vapi call history
   - `user_food_preferences` - Dietary restrictions, time preferences

## 🚀 Setup Instructions

### 1. Database Setup

**Run this SQL in your Supabase dashboard** (https://supabase.com/dashboard/project/jrirksdiklqwsaatbhvg/sql):

```sql
-- Copy the entire contents of 'create-food-orders-table.sql' and run it
```

### 2. Environment Variables

Add these to your `.env.local`:

```bash
# DoorDash API (get from https://developer.doordash.com/portal)
DOORDASH_DEVELOPER_ID=your_developer_id
DOORDASH_KEY_ID=your_key_id
DOORDASH_SIGNING_SECRET=your_signing_secret

# Vapi AI (already configured)
VAPI_API_KEY=your_vapi_key  # Already in ~/.config/vapi/api_key
VAPI_ASSISTANT_ID=811c7837-c7a0-420e-8c4d-b7c18386b698
VAPI_PHONE_NUMBER_ID=e2ddfd0b-82b0-4ec9-812c-dbd24bd8f008

# Dashboard URL
DASHBOARD_URL=https://dashboard-daddy.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://db.jrirksdiklqwsaatbhvg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. DoorDash API Setup

**Option A: Official API (Recommended)**
1. Go to https://developer.doordash.com/portal
2. Sign up for DoorDash for Work / Drive API
3. Get your credentials: Developer ID, Key ID, Signing Secret
4. Add them to your environment variables

**Option B: Browser Automation Fallback**
If DoorDash API is not available, the system will fall back to browser automation via Browserbase for order scraping.

### 4. Install Dependencies

```bash
cd /home/dev/dashboard-daddy/frontend
npm install jsonwebtoken @supabase/supabase-js
```

### 5. Test the System

1. **Visit the Dashboard**: Navigate to `/concierge` in Dashboard Daddy
2. **Test Telegram Integration**: Send "I'm hungry" to your Telegram bot
3. **Test Restaurant Calling**: Use the "Call Restaurant" button in the dashboard
4. **Test Quick Ordering**: Click quick order buttons in the "I'm Hungry" section

## 🎯 How It Works

### "I'm Hungry" Mode

When you message "I'm hungry" (or similar phrases) in Telegram:

1. **AI Detection**: System detects hunger-related messages
2. **Context Analysis**: Considers time of day, recent orders, weather
3. **Suggestion Generation**: AI creates 3-5 personalized options
4. **Interactive Response**: Telegram shows buttons for quick ordering
5. **Learning**: System learns from your choices to improve suggestions

### Restaurant Calling

When you need to call a restaurant:

1. **Vapi Integration**: AI assistant calls on your behalf
2. **Structured Conversations**: Pre-configured prompts for different purposes
3. **Information Extraction**: Parses responses for hours, wait times, availability
4. **Summary Delivery**: Sends structured summary via Telegram

### Smart Suggestions

The AI considers:

- **Time patterns**: Different cuisines for breakfast/lunch/dinner
- **Order history**: Avoids recent repeats, suggests favorites
- **Weather**: Hot weather = salads, cold weather = comfort food
- **Dietary preferences**: Respects restrictions and preferences
- **Mood detection**: Urgent hunger vs casual browsing

## 📱 Telegram Commands

The system responds to these message patterns:

- "I'm hungry" → Quick suggestions with order buttons
- "What should I eat" → Personalized recommendations
- "Order food" → Opens ordering interface
- "Call [restaurant]" → Initiates Vapi call

## 🔧 API Endpoints

### DoorDash Integration
- `GET /api/concierge/doordash?action=history` - Order history
- `GET /api/concierge/doordash?action=favorites` - Favorite restaurants  
- `GET /api/concierge/doordash?action=suggestions` - AI suggestions
- `POST /api/concierge/doordash` - Create/reorder food

### Restaurant Calling
- `POST /api/concierge/restaurant-call` - Make AI call
- `GET /api/concierge/restaurant-call?action=history` - Call logs

### Telegram Integration
- `POST /api/concierge/telegram` - Handle hungry mode, confirmations

## 🎛️ Agent Configuration

The concierge agent is configured in `~/clawd/agents/concierge/config.json` with:

- **Capabilities**: Food ordering, restaurant calling, preference learning
- **Integrations**: DoorDash, Vapi, Supabase, Telegram
- **AI Features**: Suggestion engine, call intelligence, learning algorithms
- **Triggers**: Telegram patterns, scheduled meals (optional)
- **Security**: Rate limiting, data retention policies

## 🔄 Next Steps

1. **Run the database setup SQL**
2. **Get DoorDash API credentials** (or use browser automation)
3. **Test Telegram integration** with "I'm hungry" message
4. **Customize preferences** in the database
5. **Train the system** by using it regularly

## 🤖 Integration with Bubba

This system integrates with my (Bubba's) main agent capabilities:

- **Telegram monitoring**: I watch for "hungry" messages and activate concierge mode
- **Proactive suggestions**: During heartbeats, I can suggest meals based on time
- **Learning loop**: I track what works and improve suggestions over time
- **Calendar integration**: Can suggest meals before meetings or events

The concierge system is now ready to make your food ordering experience seamless and intelligent! 🍽️✨

---

## 📞 Support

If you need help with setup or encounter issues:

1. Check the database connection first
2. Verify API credentials are correct
3. Test individual API endpoints
4. Check logs in the browser console for errors

Everything is designed to gracefully degrade - if DoorDash API isn't available, it uses database-only mode. If Vapi calls fail, it still logs the attempt.