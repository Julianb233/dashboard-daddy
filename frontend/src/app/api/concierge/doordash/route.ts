import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// DoorDash API configuration
const DOORDASH_API_URL = 'https://openapi.doordash.com';

interface DoorDashOrder {
  order_id: string;
  restaurant_name: string;
  items: any[];
  total_amount: number;
  status: string;
  ordered_at: string;
  estimated_delivery?: string;
}

// Create JWT for DoorDash API authentication
function createDoorDashJWT() {
  const payload = {
    iss: process.env.DOORDASH_DEVELOPER_ID!,
    aud: 'doordash',
    kid: process.env.DOORDASH_KEY_ID!,
    exp: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, process.env.DOORDASH_SIGNING_SECRET!, { 
    algorithm: 'HS256',
    header: { kid: process.env.DOORDASH_KEY_ID! }
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'history':
        return await getOrderHistory();
      case 'favorites':
        return await getFavorites();
      case 'suggestions':
        return await getSuggestions();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('DoorDash API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reorder':
        return await reorderPreviousOrder(body.order_id);
      case 'create_order':
        return await createNewOrder(body);
      case 'check_delivery_options':
        return await checkDeliveryOptions(body.address);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('DoorDash API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function getOrderHistory() {
  try {
    // First check our database for stored orders
    const { data: dbOrders, error } = await supabase
      .from('food_orders')
      .select('*')
      .eq('platform', 'doordash')
      .order('ordered_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // If we have DoorDash credentials, also fetch from their API
    if (process.env.DOORDASH_DEVELOPER_ID) {
      try {
        const token = createDoorDashJWT();
        const response = await fetch(`${DOORDASH_API_URL}/developer/v1/deliveries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const apiOrders = await response.json();
          // Merge and deduplicate orders
          return NextResponse.json({
            success: true,
            orders: mergeOrders(dbOrders, apiOrders),
            source: 'mixed'
          });
        }
      } catch (apiError) {
        console.error('DoorDash API fetch error:', apiError);
        // Fall back to database only
      }
    }

    return NextResponse.json({
      success: true,
      orders: dbOrders,
      source: 'database'
    });
  } catch (error) {
    throw error;
  }
}

async function getFavorites() {
  try {
    const { data: favorites, error } = await supabase
      .from('restaurant_favorites')
      .select('*')
      .order('order_count', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      favorites
    });
  } catch (error) {
    throw error;
  }
}

async function getSuggestions() {
  try {
    const currentHour = new Date().getHours();
    const timeOfDay = getTimeOfDay(currentHour);
    
    // Get user preferences
    const { data: preferences, error: prefError } = await supabase
      .from('user_food_preferences')
      .select('*')
      .eq('is_active', true);

    if (prefError) throw prefError;

    // Get recent orders to avoid repetition
    const { data: recentOrders, error: ordersError } = await supabase
      .from('food_orders')
      .select('restaurant_name')
      .gte('ordered_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('ordered_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Get favorites
    const { data: favorites, error: favError } = await supabase
      .from('restaurant_favorites')
      .select('*')
      .order('order_count', { ascending: false })
      .limit(10);

    if (favError) throw favError;

    // Generate intelligent suggestions
    const suggestions = generateSuggestions({
      timeOfDay,
      preferences,
      recentOrders,
      favorites
    });

    return NextResponse.json({
      success: true,
      suggestions,
      context: {
        timeOfDay,
        recentOrdersCount: recentOrders.length
      }
    });
  } catch (error) {
    throw error;
  }
}

async function reorderPreviousOrder(orderId: string) {
  try {
    // Get the original order
    const { data: order, error } = await supabase
      .from('food_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create a new order with the same items
    const newOrder = {
      ...order,
      order_id: `reorder_${Date.now()}`,
      status: 'pending',
      ordered_at: new Date().toISOString(),
      actual_delivery: null,
      estimated_delivery: null
    };

    const { data: newOrderData, error: insertError } = await supabase
      .from('food_orders')
      .insert([newOrder])
      .select()
      .single();

    if (insertError) throw insertError;

    // If we have DoorDash credentials, place the actual order
    if (process.env.DOORDASH_DEVELOPER_ID) {
      try {
        const token = createDoorDashJWT();
        // Place order via DoorDash API
        // Note: This would require specific implementation based on DoorDash's delivery API
        console.log('Would place DoorDash order for:', newOrder);
      } catch (apiError) {
        console.error('DoorDash order placement error:', apiError);
      }
    }

    return NextResponse.json({
      success: true,
      order: newOrderData,
      message: 'Reorder created successfully'
    });
  } catch (error) {
    throw error;
  }
}

async function createNewOrder(orderData: any) {
  try {
    const newOrder = {
      order_id: `new_${Date.now()}`,
      platform: 'doordash',
      restaurant_name: orderData.restaurant_name,
      restaurant_phone: orderData.restaurant_phone || null,
      restaurant_address: orderData.restaurant_address || null,
      items: orderData.items,
      total_amount: orderData.total_amount,
      status: 'pending',
      delivery_address: orderData.delivery_address,
      delivery_instructions: orderData.delivery_instructions || null,
      metadata: orderData.metadata || {}
    };

    const { data: order, error } = await supabase
      .from('food_orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) throw error;

    // Update restaurant favorites
    await updateRestaurantFavorites(orderData.restaurant_name, orderData.items);

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    throw error;
  }
}

async function checkDeliveryOptions(address: string) {
  try {
    // This would integrate with DoorDash's delivery area API
    // For now, return mock data
    return NextResponse.json({
      success: true,
      deliveryAvailable: true,
      estimatedDeliveryTime: 30,
      deliveryFee: 2.99,
      minimumOrder: 15.00
    });
  } catch (error) {
    throw error;
  }
}

// Helper functions
function getTimeOfDay(hour: number): string {
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'afternoon';
  return 'dinner';
}

function mergeOrders(dbOrders: any[], apiOrders: any[]): any[] {
  // Simple merge - in production, implement proper deduplication
  return [...dbOrders, ...apiOrders];
}

function generateSuggestions(context: any) {
  const { timeOfDay, preferences, recentOrders, favorites } = context;
  
  // Get dietary restrictions
  const dietaryRestrictions = preferences
    .filter((p: any) => p.preference_type === 'dietary')
    .map((p: any) => p.preference_value);

  // Get cuisine preferences for this time of day
  const timePreferences = preferences
    .filter((p: any) => 
      p.preference_type === 'time_of_day' && 
      p.preference_value === timeOfDay
    );

  // Filter favorites that haven't been ordered recently
  const recentRestaurants = recentOrders.map((o: any) => o.restaurant_name);
  const availableFavorites = favorites.filter((f: any) => 
    !recentRestaurants.includes(f.restaurant_name)
  );

  // Generate suggestions based on context
  const suggestions = availableFavorites.slice(0, 5).map((fav: any) => ({
    restaurant_name: fav.restaurant_name,
    cuisine_type: fav.cuisine_type,
    favorite_items: fav.favorite_items,
    estimated_delivery: '25-35 min',
    reason: getRecommendationReason(fav, timeOfDay, preferences),
    one_click_reorder: true
  }));

  return suggestions;
}

function getRecommendationReason(restaurant: any, timeOfDay: string, preferences: any[]): string {
  const reasons = [];
  
  if (restaurant.order_count > 10) {
    reasons.push('frequent favorite');
  }
  
  if (restaurant.average_rating > 4.5) {
    reasons.push('highly rated');
  }

  if (timeOfDay === 'breakfast' && restaurant.cuisine_type === 'american') {
    reasons.push('perfect for breakfast');
  }

  return reasons.join(', ') || 'recommended';
}

async function updateRestaurantFavorites(restaurantName: string, items: any[]) {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('restaurant_favorites')
      .select('*')
      .eq('restaurant_name', restaurantName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existing) {
      // Update existing favorite
      const { error: updateError } = await supabase
        .from('restaurant_favorites')
        .update({
          order_count: existing.order_count + 1,
          last_ordered: new Date().toISOString(),
          favorite_items: mergeFavoriteItems(existing.favorite_items, items)
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new favorite
      const { error: insertError } = await supabase
        .from('restaurant_favorites')
        .insert([{
          restaurant_name: restaurantName,
          order_count: 1,
          last_ordered: new Date().toISOString(),
          favorite_items: items.slice(0, 3) // Store top 3 items
        }]);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating restaurant favorites:', error);
  }
}

function mergeFavoriteItems(existing: any[], newItems: any[]): any[] {
  // Simple merge - keep most frequently ordered items
  const merged = [...existing];
  
  newItems.forEach(newItem => {
    const existingIndex = merged.findIndex(item => item.item === newItem.item);
    if (existingIndex >= 0) {
      merged[existingIndex].count = (merged[existingIndex].count || 1) + 1;
    } else if (merged.length < 5) {
      merged.push({ ...newItem, count: 1 });
    }
  });

  return merged.sort((a, b) => (b.count || 1) - (a.count || 1));
}