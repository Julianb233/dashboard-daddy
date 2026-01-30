import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: people, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(people || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('contacts')
    .insert([{
      name: body.name,
      email: body.email,
      phone: body.phone,
      relationship_type: body.relationship_type,
      notes: body.notes,
      created_at: new Date().toISOString()
    }])
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data?.[0])
}
