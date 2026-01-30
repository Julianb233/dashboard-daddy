import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface MarketingLead {
  id: string;
  brand_name: string;
  instagram_handle: string;
  contact_name?: string;
  contact_email?: string;
  website?: string;
  brand_description?: string;
  price_point: 'budget' | 'mid-range' | 'premium' | 'luxury';
  brand_aesthetic?: string;
  potential_revenue: number;
  status: 'discovered' | 'followed' | 'dmed' | 'replied' | 'negotiating' | 'booked' | 'completed' | 'rejected';
  notes?: string;
  tags: string[];
  followers_count?: number;
  engagement_rate?: number;
  last_contacted?: string;
  next_follow_up?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const pricePoint = searchParams.get('pricePoint');
    const priority = searchParams.get('priority');
    
    let query = supabase
      .from('marketing_leads')
      .select('*', { count: 'exact' })
      .order('potential_revenue', { ascending: false });
    
    if (search) {
      query = query.or(`brand_name.ilike.%${search}%,instagram_handle.ilike.%${search}%,contact_name.ilike.%${search}%`);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (pricePoint && pricePoint !== 'all') {
      query = query.eq('price_point', pricePoint);
    }
    
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data: leads, error, count } = await query;
    
    if (error) {
      // If table doesn't exist, return empty array with mock data option
      if (error.code === '42P01') {
        return NextResponse.json({
          leads: [],
          total: 0,
          page,
          limit,
          tableExists: false,
          message: 'Table not yet created - using mock data'
        });
      }
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      page,
      limit,
      tableExists: true
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.brand_name || !body.instagram_handle) {
      return NextResponse.json(
        { error: 'Brand name and Instagram handle are required' },
        { status: 400 }
      );
    }
    
    const newLead = {
      brand_name: body.brand_name,
      instagram_handle: body.instagram_handle.replace('@', ''),
      contact_name: body.contact_name || null,
      contact_email: body.contact_email || null,
      website: body.website || null,
      brand_description: body.brand_description || null,
      price_point: body.price_point || 'mid-range',
      brand_aesthetic: body.brand_aesthetic || null,
      potential_revenue: body.potential_revenue || 1000,
      status: body.status || 'discovered',
      notes: body.notes || null,
      tags: body.tags || [],
      followers_count: body.followers_count || null,
      engagement_rate: body.engagement_rate || null,
      priority: body.priority || 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: lead, error } = await supabase
      .from('marketing_leads')
      .insert(newLead)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
