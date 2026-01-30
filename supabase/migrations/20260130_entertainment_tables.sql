-- Entertainment Contacts Table (Casting Directors, Agents, Directors)
CREATE TABLE IF NOT EXISTS entertainment_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT,
  category TEXT CHECK (category IN ('casting_director', 'talent_agent', 'movie_director', 'commercial_director', 'creative_director', 'producer', 'ad_agency')) DEFAULT 'casting_director',
  tier INTEGER CHECK (tier IN (1, 2, 3)) DEFAULT 2,
  email TEXT,
  phone TEXT,
  linkedin TEXT,
  instagram TEXT,
  website TEXT,
  recent_projects TEXT[] DEFAULT '{}',
  brands_represented TEXT[] DEFAULT '{}',
  budget_range TEXT,
  submission_process TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('research', 'contacted', 'responded', 'meeting', 'relationship', 'inactive')) DEFAULT 'research',
  last_contacted TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  potential_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Agencies Table
CREATE TABLE IF NOT EXISTS ad_agencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('ad_agency', 'talent_agency', 'production_company', 'casting_agency')) DEFAULT 'ad_agency',
  headquarters TEXT,
  website TEXT,
  linkedin TEXT,
  tier INTEGER CHECK (tier IN (1, 2, 3)) DEFAULT 2,
  luxury_clients TEXT[] DEFAULT '{}',
  fashion_clients TEXT[] DEFAULT '{}',
  automotive_clients TEXT[] DEFAULT '{}',
  lifestyle_clients TEXT[] DEFAULT '{}',
  annual_billings TEXT,
  notable_campaigns TEXT[] DEFAULT '{}',
  submission_email TEXT,
  submission_process TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('research', 'contacted', 'relationship', 'inactive')) DEFAULT 'research',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency Contacts (Decision makers at agencies)
CREATE TABLE IF NOT EXISTS agency_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES ad_agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  department TEXT,
  email TEXT,
  linkedin TEXT,
  phone TEXT,
  is_decision_maker BOOLEAN DEFAULT FALSE,
  notes TEXT,
  last_contacted TIMESTAMPTZ,
  status TEXT CHECK (status IN ('research', 'contacted', 'responded', 'meeting', 'relationship')) DEFAULT 'research',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing Leads Table (for the Outreach page)
CREATE TABLE IF NOT EXISTS marketing_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  website TEXT,
  brand_description TEXT,
  price_point TEXT CHECK (price_point IN ('budget', 'mid-range', 'premium', 'luxury')) DEFAULT 'mid-range',
  brand_aesthetic TEXT,
  potential_revenue INTEGER DEFAULT 1000,
  status TEXT CHECK (status IN ('discovered', 'followed', 'dmed', 'replied', 'negotiating', 'booked', 'completed', 'rejected')) DEFAULT 'discovered',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  followers_count INTEGER,
  engagement_rate DECIMAL,
  last_contacted TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_entertainment_contacts_category ON entertainment_contacts(category);
CREATE INDEX IF NOT EXISTS idx_entertainment_contacts_tier ON entertainment_contacts(tier);
CREATE INDEX IF NOT EXISTS idx_entertainment_contacts_status ON entertainment_contacts(status);
CREATE INDEX IF NOT EXISTS idx_ad_agencies_type ON ad_agencies(type);
CREATE INDEX IF NOT EXISTS idx_ad_agencies_tier ON ad_agencies(tier);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_status ON marketing_leads(status);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_price_point ON marketing_leads(price_point);

-- Enable Row Level Security (RLS)
ALTER TABLE entertainment_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth setup)
CREATE POLICY "Allow all access to entertainment_contacts" ON entertainment_contacts FOR ALL USING (true);
CREATE POLICY "Allow all access to ad_agencies" ON ad_agencies FOR ALL USING (true);
CREATE POLICY "Allow all access to agency_contacts" ON agency_contacts FOR ALL USING (true);
CREATE POLICY "Allow all access to marketing_leads" ON marketing_leads FOR ALL USING (true);
