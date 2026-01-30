-- ============================================
-- OUTREACH QUEUE SCHEMA
-- ============================================
-- Adds approve/deny/delay functionality to Dashboard Daddy

-- ============================================
-- OUTREACH QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.outreach_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
    scheduled_time TIMESTAMPTZ NOT NULL,
    original_trigger JSONB, -- Store original trigger data
    delay_reason VARCHAR, -- '1h', '4h', 'tomorrow', 'custom'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0
);

-- ============================================
-- OUTREACH HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.outreach_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    action VARCHAR NOT NULL CHECK (action IN ('approve', 'deny', 'delay', 'send', 'cancel')),
    message TEXT,
    scheduled_time TIMESTAMPTZ,
    delay_reason VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_outreach_queue_user_id ON public.outreach_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_queue_person_id ON public.outreach_queue(person_id);
CREATE INDEX IF NOT EXISTS idx_outreach_queue_status ON public.outreach_queue(status);
CREATE INDEX IF NOT EXISTS idx_outreach_queue_scheduled_time ON public.outreach_queue(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_outreach_queue_pending ON public.outreach_queue(status, scheduled_time) 
    WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_outreach_history_user_id ON public.outreach_history(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_history_person_id ON public.outreach_history(person_id);
CREATE INDEX IF NOT EXISTS idx_outreach_history_created_at ON public.outreach_history(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.outreach_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_history ENABLE ROW LEVEL SECURITY;

-- Outreach Queue: Full CRUD for own queue items
CREATE POLICY "Users can view own outreach queue"
  ON public.outreach_queue FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own outreach queue"
  ON public.outreach_queue FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own outreach queue"
  ON public.outreach_queue FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own outreach queue"
  ON public.outreach_queue FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Outreach History: Full CRUD for own history
CREATE POLICY "Users can view own outreach history"
  ON public.outreach_history FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create own outreach history"
  ON public.outreach_history FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own outreach history"
  ON public.outreach_history FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own outreach history"
  ON public.outreach_history FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- ============================================
-- OPTIMAL SEND TIME CALCULATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_optimal_send_time(
    person_timezone VARCHAR DEFAULT 'America/Los_Angeles',
    relationship_type VARCHAR DEFAULT 'contact',
    priority VARCHAR DEFAULT 'medium'
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
    base_time TIMESTAMPTZ;
    target_hour INTEGER;
    optimal_time TIMESTAMPTZ;
    days_to_add INTEGER := 0;
BEGIN
    -- Start with current time in PST (system timezone)
    base_time := NOW();
    
    -- Determine optimal hour based on relationship type and priority
    CASE relationship_type
        WHEN 'client', 'prospect', 'partner' THEN
            -- B2B: 9-11am in their timezone
            IF priority IN ('critical', 'high') THEN
                target_hour := 9; -- Earlier for high priority
            ELSE
                target_hour := 10; -- Standard B2B time
            END IF;
            
        WHEN 'family', 'friend' THEN
            -- Personal: 6-8pm in their timezone
            IF priority = 'critical' THEN
                target_hour := 18; -- 6pm for urgent personal
            ELSE
                target_hour := 19; -- 7pm for casual
            END IF;
            
        ELSE
            -- Default: 10am for professional, 7pm for personal
            target_hour := 10;
    END CASE;
    
    -- If it's too late today (after 8pm) or too early (before 8am), 
    -- schedule for tomorrow
    IF EXTRACT(HOUR FROM base_time AT TIME ZONE person_timezone) >= 20 
       OR EXTRACT(HOUR FROM base_time AT TIME ZONE person_timezone) < 8 THEN
        days_to_add := 1;
    END IF;
    
    -- For weekend personal contacts, move to Monday for professional
    IF relationship_type IN ('client', 'prospect', 'partner') THEN
        WHILE EXTRACT(DOW FROM (base_time + INTERVAL '1 day' * days_to_add)) IN (0, 6) LOOP
            days_to_add := days_to_add + 1;
        END LOOP;
    END IF;
    
    -- Create target time
    optimal_time := (DATE_TRUNC('day', base_time) + INTERVAL '1 day' * days_to_add + INTERVAL '1 hour' * target_hour) 
                    AT TIME ZONE person_timezone AT TIME ZONE 'UTC';
    
    -- If the calculated time is in the past, add a day
    IF optimal_time <= NOW() THEN
        optimal_time := optimal_time + INTERVAL '1 day';
    END IF;
    
    RETURN optimal_time;
END;
$$;

-- ============================================
-- AUTO-CLEANUP FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_outreach()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Delete sent messages older than 30 days
    DELETE FROM public.outreach_queue 
    WHERE status = 'sent' 
    AND sent_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Delete cancelled messages older than 7 days
    DELETE FROM public.outreach_queue 
    WHERE status = 'cancelled' 
    AND cancelled_at < NOW() - INTERVAL '7 days';
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Delete old history entries older than 90 days
    DELETE FROM public.outreach_history 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$;

-- ============================================
-- DONE
-- ============================================
-- Run this SQL in Supabase SQL Editor to add outreach queue functionality