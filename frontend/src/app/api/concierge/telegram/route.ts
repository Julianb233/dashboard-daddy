import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TelegramMessage {
  text: string;
  user_id: string;
  chat_id: string;
}

interface HungryResponse {
  suggestions: any[];
  quick_actions: any[];
  context: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'hungry_mode':
        return await handleHungryMode(body.message);
      case 'order_confirmation':
        return await sendOrderConfirmation(body.order_data);
      case 'call_summary':
        return await sendCallSummary(body.call_data);
      case 'quick_order':
        return await handleQuickOrder(body);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Telegram integration error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function handleHungryMode(message: TelegramMessage): Promise<NextResponse> {
  try {
    // Detect if this is a hungry message
    if (!isHungryMessage(message.text)) {
      return NextResponse.json({ 
        triggered: false,
        message: 'Not a hungry mode trigger'
      });
    }

    // Generate personalized suggestions
    const suggestions = await generateHungrySuggestions();

    // Create Telegram response with inline buttons
    const telegramResponse = {
      triggered: true,
      response_type: 'interactive',
      message: {
        text: "🍽️ **I'm Hungry Mode Activated!**\n\nHere are some personalized suggestions based on your preferences and the time of day:",
        reply_markup: {
          inline_keyboard: [
            // Quick suggestion buttons (2 per row)
            ...suggestions.slice(0, 4).reduce((rows: any[][], suggestion: any, index: number) => {
              if (index % 2 === 0) {
                rows.push([]);
              }
              rows[rows.length - 1].push({
                text: `🍕 ${suggestion.restaurant_name}`,
                callback_data: `quick_order:${suggestion.restaurant_name}`
              });
              return rows;
            }, []),
            // Additional actions
            [
              {
                text: "📱 Open Full Menu",
                url: `${process.env.DASHBOARD_URL}/concierge`
              },
              {
                text: "📞 Call Restaurant",
                callback_data: "call_restaurant"
              }
            ],
            [
              {
                text: "🔄 More Suggestions", 
                callback_data: "refresh_suggestions"
              }
            ]
          ]
        }
      },
      suggestions: suggestions,
      context: {
        time_of_day: getTimeOfDay(),
        mood: detectMoodFromMessage(message.text),
        weather_consideration: await getWeatherContext()
      }
    };

    // Log the hungry mode activation
    await logHungryModeActivation(message, suggestions);

    return NextResponse.json(telegramResponse);

  } catch (error) {
    console.error('Error handling hungry mode:', error);
    return NextResponse.json({ error: 'Failed to process hungry mode' }, { status: 500 });
  }
}

async function generateHungrySuggestions(): Promise<any[]> {
  try {
    const currentHour = new Date().getHours();
    const timeOfDay = getTimeOfDay(currentHour);

    // Get user preferences
    const { data: preferences } = await supabase
      .from('user_food_preferences')
      .select('*')
      .eq('is_active', true);

    // Get recent orders (last 3 days to avoid repetition)
    const { data: recentOrders } = await supabase
      .from('food_orders')
      .select('restaurant_name')
      .gte('ordered_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    // Get favorites
    const { data: favorites } = await supabase
      .from('restaurant_favorites')
      .select('*')
      .order('order_count', { ascending: false })
      .limit(8);

    // Filter out recently ordered restaurants
    const recentRestaurants = recentOrders?.map(o => o.restaurant_name) || [];
    const availableFavorites = favorites?.filter(f => 
      !recentRestaurants.includes(f.restaurant_name)
    ) || [];

    // Generate intelligent suggestions
    const suggestions = availableFavorites.slice(0, 5).map((favorite, index) => ({
      restaurant_name: favorite.restaurant_name,
      cuisine_type: favorite.cuisine_type,
      favorite_items: favorite.favorite_items?.slice(0, 2) || [],
      estimated_delivery: getEstimatedDelivery(favorite.restaurant_name),
      reason: getRecommendationReason(favorite, timeOfDay, preferences || []),
      quick_order_available: true,
      emoji: getCuisineEmoji(favorite.cuisine_type),
      priority: index + 1
    }));

    // Add time-based suggestions if we don't have enough favorites
    if (suggestions.length < 3) {
      const timeBasedSuggestions = getTimeBasedSuggestions(timeOfDay);
      suggestions.push(...timeBasedSuggestions.slice(0, 3 - suggestions.length));
    }

    return suggestions;

  } catch (error) {
    console.error('Error generating suggestions:', error);
    // Return default suggestions
    return getDefaultSuggestions();
  }
}

async function handleQuickOrder(orderData: any): Promise<NextResponse> {
  try {
    const { restaurant_name, user_id } = orderData;

    // Get restaurant details
    const { data: restaurant } = await supabase
      .from('restaurant_favorites')
      .select('*')
      .eq('restaurant_name', restaurant_name)
      .single();

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Create a quick order with favorite items
    const quickOrder = {
      order_id: `quick_${Date.now()}`,
      platform: 'quick_order',
      restaurant_name: restaurant.restaurant_name,
      restaurant_phone: restaurant.restaurant_phone,
      items: restaurant.favorite_items || [],
      total_amount: estimateOrderTotal(restaurant.favorite_items),
      status: 'pending',
      delivery_address: 'Default address', // Would get from user preferences
      metadata: {
        source: 'telegram_quick_order',
        user_id: user_id
      }
    };

    const { data: order, error } = await supabase
      .from('food_orders')
      .insert([quickOrder])
      .select()
      .single();

    if (error) throw error;

    // Send confirmation message
    const confirmationText = `✅ **Quick Order Placed!**\n\n` +
      `🏪 **${restaurant_name}**\n` +
      `💰 **Total:** $${quickOrder.total_amount.toFixed(2)}\n` +
      `⏰ **Estimated Delivery:** ${getEstimatedDelivery(restaurant_name)}\n\n` +
      `📱 Track your order: ${process.env.DASHBOARD_URL}/concierge`;

    return NextResponse.json({
      success: true,
      order: order,
      telegram_response: {
        text: confirmationText,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📍 Track Order",
                url: `${process.env.DASHBOARD_URL}/concierge`
              },
              {
                text: "🔄 Order Again",
                callback_data: `reorder:${order.order_id}`
              }
            ]
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error handling quick order:', error);
    return NextResponse.json({ error: 'Failed to place quick order' }, { status: 500 });
  }
}

async function sendOrderConfirmation(orderData: any): Promise<NextResponse> {
  try {
    const message = `✅ **Order Confirmed!**\n\n` +
      `🏪 **${orderData.restaurant_name}**\n` +
      `💰 **Total:** $${orderData.total_amount.toFixed(2)}\n` +
      `📍 **Platform:** ${orderData.platform}\n` +
      `⏰ **Estimated Delivery:** ${orderData.estimated_delivery || '30-45 min'}\n\n` +
      `📱 Track: ${process.env.DASHBOARD_URL}/concierge`;

    return NextResponse.json({
      success: true,
      telegram_response: {
        text: message,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📍 Track Order",
                url: `${process.env.DASHBOARD_URL}/concierge`
              }
            ]
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 });
  }
}

async function sendCallSummary(callData: any): Promise<NextResponse> {
  try {
    const message = `📞 **Restaurant Call Complete**\n\n` +
      `🏪 **${callData.restaurant_name}**\n` +
      `🎯 **Purpose:** ${callData.call_purpose}\n` +
      `✅ **Status:** ${callData.call_status}\n\n` +
      `📝 **Summary:**\n${callData.call_summary || 'Call completed successfully'}\n\n` +
      `📱 View Details: ${process.env.DASHBOARD_URL}/concierge`;

    return NextResponse.json({
      success: true,
      telegram_response: {
        text: message,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📱 View Full Details",
                url: `${process.env.DASHBOARD_URL}/concierge`
              },
              {
                text: "📞 Call Again",
                callback_data: `call:${callData.restaurant_name}`
              }
            ]
          ]
        }
      }
    });

  } catch (error) {
    console.error('Error sending call summary:', error);
    return NextResponse.json({ error: 'Failed to send call summary' }, { status: 500 });
  }
}

// Helper functions
function isHungryMessage(text: string): boolean {
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

  return hungryPatterns.some(pattern => pattern.test(text));
}

function getTimeOfDay(hour?: number): string {
  const currentHour = hour ?? new Date().getHours();
  if (currentHour < 11) return 'breakfast';
  if (currentHour < 15) return 'lunch';
  if (currentHour < 18) return 'afternoon';
  return 'dinner';
}

function detectMoodFromMessage(text: string): string {
  if (/really hungry|starving|famished/i.test(text)) return 'urgent';
  if (/light|salad|healthy/i.test(text)) return 'healthy';
  if (/comfort|cozy|warm/i.test(text)) return 'comfort';
  if (/quick|fast|asap/i.test(text)) return 'quick';
  return 'casual';
}

async function getWeatherContext(): Promise<string> {
  // This would integrate with a weather API
  // For now, return a placeholder
  return 'pleasant';
}

function getCuisineEmoji(cuisine: string): string {
  const emojiMap: Record<string, string> = {
    'italian': '🍕',
    'chinese': '🥡',
    'japanese': '🍱',
    'mexican': '🌮',
    'american': '🍔',
    'indian': '🍛',
    'thai': '🍜',
    'pizza': '🍕',
    'healthy': '🥗',
    'cafe': '☕'
  };

  return emojiMap[cuisine.toLowerCase()] || '🍽️';
}

function getEstimatedDelivery(restaurantName: string): string {
  // This would integrate with real delivery time APIs
  // For now, return estimates based on restaurant type
  const estimates = ['20-30 min', '25-35 min', '30-45 min'];
  return estimates[Math.floor(Math.random() * estimates.length)];
}

function getRecommendationReason(restaurant: any, timeOfDay: string, preferences: any[]): string {
  const reasons = [];
  
  if (restaurant.order_count > 5) {
    reasons.push('frequent favorite');
  }
  
  if (restaurant.average_rating > 4.5) {
    reasons.push('highly rated');
  }

  // Time-based reasons
  if (timeOfDay === 'breakfast' && restaurant.cuisine_type?.includes('cafe')) {
    reasons.push('perfect for breakfast');
  } else if (timeOfDay === 'lunch' && restaurant.cuisine_type?.includes('fast')) {
    reasons.push('quick lunch option');
  } else if (timeOfDay === 'dinner' && restaurant.cuisine_type?.includes('comfort')) {
    reasons.push('great for dinner');
  }

  return reasons.slice(0, 2).join(', ') || 'recommended for you';
}

function getTimeBasedSuggestions(timeOfDay: string): any[] {
  const suggestions: Record<string, any[]> = {
    breakfast: [
      {
        restaurant_name: 'Local Coffee Shop',
        cuisine_type: 'cafe',
        favorite_items: [{ item: 'Coffee & Bagel' }],
        estimated_delivery: '15-25 min',
        reason: 'perfect morning start',
        emoji: '☕'
      }
    ],
    lunch: [
      {
        restaurant_name: 'Quick Lunch Spot',
        cuisine_type: 'fast casual',
        favorite_items: [{ item: 'Sandwich & Salad' }],
        estimated_delivery: '20-30 min',
        reason: 'fast lunch option',
        emoji: '🥪'
      }
    ],
    dinner: [
      {
        restaurant_name: 'Cozy Dinner Place',
        cuisine_type: 'comfort food',
        favorite_items: [{ item: 'Pasta & Garlic Bread' }],
        estimated_delivery: '30-45 min',
        reason: 'perfect for dinner',
        emoji: '🍝'
      }
    ]
  };

  return suggestions[timeOfDay] || [];
}

function getDefaultSuggestions(): any[] {
  return [
    {
      restaurant_name: 'Tony\'s Pizza',
      cuisine_type: 'italian',
      favorite_items: [{ item: 'Margherita Pizza' }],
      estimated_delivery: '25-35 min',
      reason: 'always a good choice',
      emoji: '🍕'
    },
    {
      restaurant_name: 'Healthy Bites',
      cuisine_type: 'healthy',
      favorite_items: [{ item: 'Buddha Bowl' }],
      estimated_delivery: '20-30 min',
      reason: 'fresh and nutritious',
      emoji: '🥗'
    }
  ];
}

function estimateOrderTotal(items: any[]): number {
  // Simple estimation - would use real pricing in production
  const basePrice = 15.99;
  const itemMultiplier = (items?.length || 1) * 1.5;
  return Math.round((basePrice * itemMultiplier + 3.99) * 100) / 100; // Add delivery fee
}

async function logHungryModeActivation(message: TelegramMessage, suggestions: any[]): Promise<void> {
  try {
    // Log this interaction for analytics and improvement
    await supabase.from('agent_activity_log').insert([
      {
        agent_id: 'concierge',
        activity_type: 'hungry_mode_activated',
        status: 'completed',
        details: {
          message_text: message.text,
          suggestions_count: suggestions.length,
          user_id: message.user_id,
          chat_id: message.chat_id,
          time_of_day: getTimeOfDay(),
          suggestions: suggestions.map(s => s.restaurant_name)
        },
        timestamp: new Date().toISOString()
      }
    ]);
  } catch (error) {
    console.error('Error logging hungry mode activation:', error);
    // Don't fail the main request for logging errors
  }
}