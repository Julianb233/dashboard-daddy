import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface EntertainmentContact {
  id: string;
  name: string;
  company: string;
  title: string;
  category: 'casting_director' | 'talent_agent' | 'movie_director' | 'commercial_director' | 'creative_director' | 'producer' | 'ad_agency';
  tier: 1 | 2 | 3; // 1 = top tier, 3 = entry level
  email?: string;
  phone?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  recent_projects?: string[];
  brands_represented?: string[];
  budget_range?: string;
  submission_process?: string;
  notes?: string;
  tags: string[];
  status: 'research' | 'contacted' | 'responded' | 'meeting' | 'relationship' | 'inactive';
  last_contacted?: string;
  next_follow_up?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  potential_value?: number;
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
    const category = searchParams.get('category');
    const tier = searchParams.get('tier');
    const status = searchParams.get('status');
    
    let query = supabase
      .from('entertainment_contacts')
      .select('*', { count: 'exact' })
      .order('tier', { ascending: true })
      .order('priority', { ascending: false });
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,title.ilike.%${search}%`);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (tier && tier !== 'all') {
      query = query.eq('tier', parseInt(tier));
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data: contacts, error, count } = await query;
    
    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({
          contacts: [],
          total: 0,
          page,
          limit,
          tableExists: false,
          message: 'Table not yet created'
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      contacts: contacts || [],
      total: count || 0,
      page,
      limit,
      tableExists: true
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.company) {
      return NextResponse.json(
        { error: 'Name and company are required' },
        { status: 400 }
      );
    }
    
    const newContact = {
      name: body.name,
      company: body.company,
      title: body.title || null,
      category: body.category || 'casting_director',
      tier: body.tier || 2,
      email: body.email || null,
      phone: body.phone || null,
      linkedin: body.linkedin || null,
      instagram: body.instagram || null,
      website: body.website || null,
      recent_projects: body.recent_projects || [],
      brands_represented: body.brands_represented || [],
      budget_range: body.budget_range || null,
      submission_process: body.submission_process || null,
      notes: body.notes || null,
      tags: body.tags || [],
      status: body.status || 'research',
      priority: body.priority || 'medium',
      potential_value: body.potential_value || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: contact, error } = await supabase
      .from('entertainment_contacts')
      .insert(newContact)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contact:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}
