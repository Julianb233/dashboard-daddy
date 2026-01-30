import { NextResponse } from 'next/server'

export const revalidate = 60 // Cache for 60 seconds

export async function GET() {
  try {
    // Try to fetch from Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://csauiadftnvojriizceu.supabase.co'
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

    if (supabaseKey) {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/communication_profiles?select=*&order=message_count.desc&limit=100`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      )

      if (response.ok) {
        const profiles = await response.json()
        
        // Calculate stats
        const stats = {
          total: profiles.length,
          analyzed: Math.round((profiles.filter((p: any) => p.disc_primary).length / profiles.length) * 100),
          disc: {
            D: profiles.filter((p: any) => p.disc_primary === 'D').length,
            I: profiles.filter((p: any) => p.disc_primary === 'I').length,
            S: profiles.filter((p: any) => p.disc_primary === 'S').length,
            C: profiles.filter((p: any) => p.disc_primary === 'C').length,
          },
          vak: {
            visual: profiles.filter((p: any) => p.vak_primary === 'visual').length,
            auditory: profiles.filter((p: any) => p.vak_primary === 'auditory').length,
            kinesthetic: profiles.filter((p: any) => p.vak_primary === 'kinesthetic').length,
          },
        }

        return NextResponse.json({ contacts: profiles, stats })
      }
    }

    // Return mock data if Supabase not configured
    return NextResponse.json({
      contacts: mockContacts,
      stats: mockStats,
    })
  } catch (error) {
    console.error('Error fetching contact profiles:', error)
    return NextResponse.json({
      contacts: mockContacts,
      stats: mockStats,
    })
  }
}

const mockContacts = [
  {
    id: '1',
    phone: '+17602716295',
    name: 'Blake',
    disc_primary: 'I',
    disc_secondary: 'D',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'high',
    message_count: 248,
    emoji_frequency: 0.35,
    avg_message_length: 65,
    rapport_markers: ['bro', 'man', 'sick'],
    recommendations: ['Be enthusiastic', 'Share tech discoveries'],
  },
  {
    id: '2',
    phone: '+13017870430',
    name: 'Aaron Drew',
    disc_primary: 'D',
    disc_secondary: 'I',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'medium',
    message_count: 1454,
    emoji_frequency: 0.15,
    avg_message_length: 32,
    rapport_markers: ['lol', 'grinding'],
    recommendations: ['Keep it brief', 'Lead with results'],
  },
  {
    id: '3',
    phone: '+18186751325',
    name: 'Shray SD Investor',
    disc_primary: 'C',
    disc_secondary: 'I',
    vak_primary: 'visual',
    formality: 'balanced',
    energy_level: 'medium',
    message_count: 796,
    emoji_frequency: 0.20,
    avg_message_length: 45,
    rapport_markers: ['bro'],
    recommendations: ['Share links', 'Be curious'],
  },
  {
    id: '4',
    phone: '+18584499950',
    name: 'Fred Cary',
    disc_primary: 'D',
    disc_secondary: 'C',
    vak_primary: 'auditory',
    formality: 'formal',
    energy_level: 'low',
    message_count: 147,
    emoji_frequency: 0.0,
    avg_message_length: 55,
    rapport_markers: [],
    recommendations: ['Be precise', 'Professional tone'],
  },
  {
    id: '5',
    phone: '+19498649943',
    name: 'Sophia',
    disc_primary: 'I',
    disc_secondary: 'S',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'high',
    message_count: 9387,
    emoji_frequency: 0.45,
    avg_message_length: 28,
    rapport_markers: ['babe', 'love'],
    recommendations: ['Warm and affectionate', 'Emoji welcome'],
  },
  {
    id: '6',
    phone: '+18609840558',
    name: 'Andrea',
    disc_primary: 'S',
    disc_secondary: 'I',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'medium',
    message_count: 1146,
    emoji_frequency: 0.10,
    avg_message_length: 18,
    rapport_markers: ['howdy', 'lmk'],
    recommendations: ['Super casual', 'Keep it brief'],
  },
]

const mockStats = {
  total: 150,
  analyzed: 85,
  disc: { D: 38, I: 45, S: 32, C: 35 },
  vak: { visual: 42, auditory: 35, kinesthetic: 73 },
}
