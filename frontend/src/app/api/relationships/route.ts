import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use anon key for server-side access (service role key was invalid)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search');
    const circle = searchParams.get('circle');
    const relationshipRole = searchParams.get('role');
    const relationshipType = searchParams.get('type');
    
    // Build query
    let query = supabase
      .from('people')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('last_contact_date', { ascending: false, nullsFirst: false });
    
    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    if (circle && circle !== 'all') {
      query = query.eq('circle', circle);
    }
    
    if (relationshipRole && relationshipRole !== 'all') {
      query = query.eq('relationship_role', relationshipRole);
    }
    
    if (relationshipType && relationshipType !== 'all') {
      query = query.eq('relationship_type', relationshipType);
    }
    
    // Pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: relationships, error, count } = await query;
    
    if (error) {
      console.error('Error fetching relationships:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      relationships: relationships || [],
      people: relationships || [],  // Alias for UI compatibility
      total: count || 0,
      page,
      limit
    });
  } catch (error) {
    console.error('Error fetching relationships:', error);
    return NextResponse.json({ error: 'Failed to fetch relationships' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.first_name && !body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Parse name if only full name provided
    let firstName = body.first_name;
    let lastName = body.last_name;
    if (!firstName && body.name) {
      const parts = body.name.trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || null;
    }
    
    const newPerson = {
      first_name: firstName,
      last_name: lastName,
      nickname: body.nickname || null,
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      job_title: body.job_title || body.title || null,
      circle: body.circle || 'outer',
      relationship_role: body.relationship_role || body.role || 'acquaintance',
      relationship_type: body.relationship_type || 'contact',
      relationship_strength: body.relationship_strength || null,
      priority: body.priority || 'medium',
      status: body.status || 'active',
      notes: body.notes || null,
      tags: body.tags || [],
      how_we_met: body.how_we_met || null,
      birthday: body.birthday || null,
      interests: body.interests || [],
      source: body.source || 'dashboard',
      is_active: true
    };
    
    const { data: person, error } = await supabase
      .from('people')
      .insert(newPerson)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating person:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(person);
  } catch (error) {
    console.error('Error creating relationship:', error);
    return NextResponse.json({ error: 'Failed to create relationship' }, { status: 500 });
  }
}
