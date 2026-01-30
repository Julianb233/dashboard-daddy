import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    const { id: personId } = params;
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify person belongs to user
    const { data: person } = await supabase
      .from('people')
      .select('id')
      .eq('id', personId)
      .eq('user_id', user.id)
      .single();
    
    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }
    
    const { data: contactHistory, error, count } = await supabase
      .from('contact_history')
      .select('*', { count: 'exact' })
      .eq('person_id', personId)
      .order('contact_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching contact history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({
      contactHistory,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    const { id: personId } = params;
    const body = await request.json();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify person belongs to user
    const { data: person } = await supabase
      .from('people')
      .select('id')
      .eq('id', personId)
      .eq('user_id', user.id)
      .single();
    
    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      );
    }
    
    // Validate required fields
    if (!body.contactType) {
      return NextResponse.json(
        { error: 'Contact type is required' },
        { status: 400 }
      );
    }
    
    // Prepare contact history data
    const contactData = {
      person_id: personId,
      contact_type: body.contactType,
      subject: body.subject || null,
      notes: body.notes || null,
      outcome: body.outcome || null,
      next_action: body.nextAction || null,
      contact_date: body.contactDate || new Date().toISOString()
    };
    
    const { data: contactHistory, error } = await supabase
      .from('contact_history')
      .insert(contactData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating contact history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Update person's last_contacted timestamp
    await supabase
      .from('people')
      .update({ last_contacted: contactData.contact_date })
      .eq('id', personId)
      .eq('user_id', user.id);
    
    return NextResponse.json(contactHistory, { status: 201 });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}