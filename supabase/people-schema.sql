-- ============================================
-- PEOPLE/RELATIONSHIPS SCHEMA ADDITIONS
-- ============================================
-- Add this table to the existing Dashboard Daddy schema

-- ============================================
-- PEOPLE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR,
    phone VARCHAR,
    company VARCHAR,
    title VARCHAR,
    timezone VARCHAR, -- inferred from phone area code
    notes TEXT,
    tags JSONB DEFAULT '[]',
    last_contacted TIMESTAMPTZ,
    next_follow_up TIMESTAMPTZ,
    contact_frequency INTEGER, -- days between contacts
    relationship_type VARCHAR DEFAULT 'contact' CHECK (relationship_type IN ('contact', 'client', 'prospect', 'partner', 'friend', 'family', 'colleague')),
    priority VARCHAR DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    social_links JSONB DEFAULT '{}', -- LinkedIn, Twitter, etc.
    address JSONB DEFAULT '{}', -- street, city, state, zip, country
    birthday DATE,
    anniversary DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACT HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.contact_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES public.people(id) ON DELETE CASCADE,
    contact_type VARCHAR NOT NULL CHECK (contact_type IN ('email', 'phone', 'meeting', 'text', 'social', 'other')),
    subject VARCHAR,
    notes TEXT,
    outcome VARCHAR, -- 'successful', 'no_response', 'follow_up_needed', etc.
    next_action TEXT,
    contact_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_people_user_id ON public.people(user_id);
CREATE INDEX IF NOT EXISTS idx_people_name ON public.people(name);
CREATE INDEX IF NOT EXISTS idx_people_email ON public.people(email);
CREATE INDEX IF NOT EXISTS idx_people_phone ON public.people(phone);
CREATE INDEX IF NOT EXISTS idx_people_company ON public.people(company);
CREATE INDEX IF NOT EXISTS idx_people_last_contacted ON public.people(last_contacted);
CREATE INDEX IF NOT EXISTS idx_people_next_follow_up ON public.people(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_people_relationship_type ON public.people(relationship_type);
CREATE INDEX IF NOT EXISTS idx_people_priority ON public.people(priority);
CREATE INDEX IF NOT EXISTS idx_contact_history_person_id ON public.contact_history(person_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_contact_date ON public.contact_history(contact_date DESC);

-- Full text search for people
CREATE INDEX IF NOT EXISTS idx_people_search 
ON public.people USING gin(to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(company, '') || ' ' || COALESCE(notes, '')));

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================

CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_history ENABLE ROW LEVEL SECURITY;

-- People: Full CRUD for own people
CREATE POLICY "Users can view own people"
  ON public.people FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own people"
  ON public.people FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own people"
  ON public.people FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own people"
  ON public.people FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Contact History: Full CRUD for own contact history
CREATE POLICY "Users can view own contact history"
  ON public.contact_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.people 
      WHERE id = person_id AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can create own contact history"
  ON public.contact_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.people 
      WHERE id = person_id AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own contact history"
  ON public.contact_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.people 
      WHERE id = person_id AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete own contact history"
  ON public.contact_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.people 
      WHERE id = person_id AND user_id = (SELECT auth.uid())
    )
  );

-- ============================================
-- TIMEZONE INFERENCE FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.infer_timezone_from_phone(phone_number VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    area_code VARCHAR;
    timezone VARCHAR;
BEGIN
    -- Extract area code (first 3 digits after country code)
    area_code := REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g');
    
    IF LENGTH(area_code) >= 10 THEN
        area_code := SUBSTRING(area_code FROM LENGTH(area_code) - 9 FOR 3);
    ELSIF LENGTH(area_code) >= 3 THEN
        area_code := SUBSTRING(area_code FROM 1 FOR 3);
    ELSE
        RETURN 'America/New_York'; -- Default
    END IF;
    
    -- Map area codes to timezones (major US areas)
    CASE area_code
        -- Eastern Time
        WHEN '201', '202', '203', '212', '215', '216', '234', '240', '267', '301', '302', '304', '305', '321', '330', '347', '352', '386', '401', '404', '407', '410', '412', '413', '414', '419', '423', '434', '443', '470', '475', '478', '484', '508', '516', '518', '561', '567', '570', '585', '607', '610', '614', '617', '631', '646', '678', '689', '716', '718', '724', '732', '740', '754', '757', '772', '774', '781', '786', '813', '828', '845', '848', '850', '856', '863', '878', '904', '912', '914', '917', '919', '929', '934', '937', '941', '954', '973', '980' THEN
            timezone := 'America/New_York';
            
        -- Central Time  
        WHEN '205', '214', '217', '218', '224', '225', '228', '251', '256', '262', '281', '309', '312', '314', '316', '318', '319', '320', '334', '337', '346', '361', '409', '414', '417', '430', '432', '469', '479', '501', '504', '507', '512', '515', '563', '573', '580', '601', '608', '612', '618', '620', '630', '636', '641', '651', '660', '662', '682', '708', '712', '713', '715', '731', '763', '773', '775', '806', '807', '815', '816', '817', '830', '832', '847', '870', '901', '903', '913', '918', '920', '936', '940', '952', '956', '972', '979' THEN
            timezone := 'America/Chicago';
            
        -- Mountain Time
        WHEN '303', '307', '385', '406', '435', '505', '575', '601', '720', '801', '970' THEN
            timezone := 'America/Denver';
            
        -- Pacific Time
        WHEN '206', '209', '213', '253', '310', '323', '341', '408', '415', '424', '442', '510', '530', '541', '559', '562', '619', '626', '628', '650', '657', '661', '669', '707', '714', '747', '760', '805', '818', '831', '858', '909', '916', '925', '949', '951' THEN
            timezone := 'America/Los_Angeles';
            
        ELSE
            timezone := 'America/New_York'; -- Default
    END CASE;
    
    RETURN timezone;
END;
$$;

-- ============================================
-- AUTO-UPDATE TIMEZONE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_person_timezone()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- If phone number changed and no manual timezone set, infer it
    IF NEW.phone IS DISTINCT FROM OLD.phone AND NEW.phone IS NOT NULL THEN
        NEW.timezone := public.infer_timezone_from_phone(NEW.phone);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER people_timezone_update
  BEFORE UPDATE ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_person_timezone();

-- Also set timezone on insert
CREATE OR REPLACE FUNCTION public.set_initial_timezone()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.phone IS NOT NULL AND NEW.timezone IS NULL THEN
        NEW.timezone := public.infer_timezone_from_phone(NEW.phone);
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER people_timezone_insert
  BEFORE INSERT ON public.people
  FOR EACH ROW
  EXECUTE FUNCTION public.set_initial_timezone();

-- ============================================
-- SAMPLE DATA
-- ============================================

-- This will be populated by the application
-- No sample data to avoid conflicts

-- ============================================
-- DONE
-- ============================================
-- Run this SQL in Supabase SQL Editor to add relationships/people functionality