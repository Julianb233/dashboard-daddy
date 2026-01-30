# Telegram Concierge Integration

## How to integrate the Personal Concierge with Bubba's Telegram

### 1. Add to Bubba's message processing

When Bubba receives a message in Telegram, add this check before other processing:

```javascript
// In Bubba's Telegram message handler
async function processMessage(message) {
  const text = message.text?.toLowerCase() || '';
  
  // Check for hungry mode triggers
  const hungryPatterns = [
    /i'?m hungry/i,
    /what should i eat/i,
    /food suggestions?/i,
    /order food/i,
    /hungry mode/i,
    /i want food/i,
    /let's eat/i,
    /dinner time/i,
    /lunch time/i,
    /breakfast/i,
    /feed me/i
  ];
  
  if (hungryPatterns.some(pattern => pattern.test(text))) {
    return await handleHungryMode(message);
  }
  
  // Continue with other message processing...
}

async function handleHungryMode(message) {
  try {
    // Call the concierge API
    const response = await fetch('http://localhost:3000/api/concierge/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'hungry_mode',
        message: {
          text: message.text,
          user_id: message.from.id.toString(),
          chat_id: message.chat.id.toString()
        }
      })
    });
    
    const data = await response.json();
    
    if (data.triggered) {
      // Send the AI-generated response with inline buttons
      await telegram.sendMessage(message.chat.id, data.response.message.text, {
        reply_markup: data.response.message.reply_markup,
        parse_mode: 'Markdown'
      });
      
      return true; // Message handled by concierge
    }
    
  } catch (error) {
    console.error('Concierge integration error:', error);
    // Fall back to regular processing
  }
  
  return false; // Continue with regular processing
}
```

### 2. Handle callback queries (button presses)

```javascript
// Handle inline button presses
telegram.on('callback_query', async (query) => {
  const data = query.data;
  
  if (data.startsWith('quick_order:')) {
    const restaurant = data.replace('quick_order:', '');
    
    const response = await fetch('http://localhost:3000/api/concierge/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'quick_order',
        restaurant_name: restaurant,
        user_id: query.from.id.toString()
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      await telegram.editMessageText(
        result.telegram_response.text,
        {
          chat_id: query.message.chat.id,
          message_id: query.message.message_id,
          reply_markup: result.telegram_response.reply_markup,
          parse_mode: 'Markdown'
        }
      );
    }
    
    await telegram.answerCallbackQuery(query.id, {
      text: `Ordering from ${restaurant}...`
    });
  }
  
  if (data === 'refresh_suggestions') {
    // Regenerate suggestions
    const response = await handleHungryMode(query.message);
  }
  
  if (data === 'call_restaurant') {
    await telegram.sendMessage(query.message.chat.id, 
      "🔗 Use the dashboard to call restaurants: https://dashboard-daddy.com/concierge"
    );
  }
});
```

### 3. Proactive meal suggestions (optional)

Add to Bubba's heartbeat or cron jobs:

```javascript
// In heartbeat or scheduled task
async function checkMealSuggestions() {
  const now = new Date();
  const hour = now.getHours();
  
  // Suggest meals at typical meal times
  if ([8, 12, 18].includes(hour) && now.getMinutes() === 0) {
    const mealType = hour === 8 ? 'breakfast' : hour === 12 ? 'lunch' : 'dinner';
    
    await telegram.sendMessage(JULIAN_CHAT_ID, 
      `🍽️ It's ${mealType} time! Say "I'm hungry" for personalized suggestions.`
    );
  }
}
```

### 4. Order confirmations and call summaries

When the Dashboard Daddy concierge completes actions, it can notify via these endpoints:

```javascript
// Send order confirmation
async function notifyOrderPlaced(orderData) {
  const response = await fetch('http://localhost:3000/api/concierge/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'order_confirmation',
      order_data: orderData
    })
  });
  
  const result = await response.json();
  
  await telegram.sendMessage(JULIAN_CHAT_ID, 
    result.telegram_response.text,
    { reply_markup: result.telegram_response.reply_markup }
  );
}

// Send restaurant call summary
async function notifyCallComplete(callData) {
  const response = await fetch('http://localhost:3000/api/concierge/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'call_summary',
      call_data: callData
    })
  });
  
  const result = await response.json();
  
  await telegram.sendMessage(JULIAN_CHAT_ID, 
    result.telegram_response.text,
    { reply_markup: result.telegram_response.reply_markup }
  );
}
```

### 5. Environment setup

Make sure these variables are available to both Bubba and Dashboard Daddy:

```bash
# In both systems
TELEGRAM_BOT_TOKEN=your_bot_token
JULIAN_CHAT_ID=6844843110
DASHBOARD_URL=https://dashboard-daddy.com
```

## Example conversation flow:

```
Julian: "I'm hungry"

Bubba: 🍽️ I'm Hungry Mode Activated!

Here are some personalized suggestions based on your preferences and the time of day:

[🍕 Tony's Pizza] [🍱 Sushi Zen]
[🥗 Green Garden] [🌮 Taco Palace]

📱 Open Full Menu | 📞 Call Restaurant

🔄 More Suggestions

Julian: *clicks "🍕 Tony's Pizza"*

Bubba: ✅ Quick Order Placed!

🏪 Tony's Pizza
💰 Total: $18.99
⏰ Estimated Delivery: 25-35 min

📍 Track Order | 🔄 Order Again
```

This integration makes the concierge system seamlessly part of Bubba's Telegram interface, providing a natural food ordering experience through chat.