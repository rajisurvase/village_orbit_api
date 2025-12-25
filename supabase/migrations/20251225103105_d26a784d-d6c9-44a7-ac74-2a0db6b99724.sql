-- Drop and recreate push_subscriptions with endpoint as primary identifier
-- First, drop existing table if it exists (we'll recreate with better schema)
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

-- Create optimized push_subscriptions table
CREATE TABLE public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  endpoint text PRIMARY KEY NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create subscriptions"
ON public.push_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can manage all subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster queries
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_is_admin ON public.push_subscriptions(is_admin);

-- Function to send push notification (called from edge function)
CREATE OR REPLACE FUNCTION public.get_push_subscriptions(target_admins_only boolean DEFAULT false)
RETURNS TABLE (
  endpoint text,
  p256dh text,
  auth text,
  user_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ps.endpoint,
    ps.p256dh,
    ps.auth,
    ps.user_id
  FROM public.push_subscriptions ps
  WHERE 
    CASE 
      WHEN target_admins_only THEN ps.is_admin = true
      ELSE true
    END;
$$;

-- Create notification queue table for event-driven notifications
CREATE TABLE public.notification_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- 'item_pending' or 'item_available'
  item_id uuid REFERENCES public.items(id) ON DELETE CASCADE,
  target_admins_only boolean DEFAULT false,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed'
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Enable RLS on notification queue
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access notification queue
CREATE POLICY "Service role can manage notification queue"
ON public.notification_queue FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to queue notification when item is created or updated
CREATE OR REPLACE FUNCTION public.handle_item_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_payload jsonb;
  notification_type text;
  notify_admins boolean;
BEGIN
  -- On INSERT: Notify admins about new pending item
  IF TG_OP = 'INSERT' THEN
    notification_payload := jsonb_build_object(
      'title', 'New Item Listed',
      'body', 'A new item "' || NEW.item_name || '" has been listed for review',
      'url', '/admin/marketplace',
      'item_id', NEW.id,
      'item_name', NEW.item_name,
      'category', NEW.category
    );
    
    INSERT INTO public.notification_queue (event_type, item_id, target_admins_only, payload)
    VALUES ('item_pending', NEW.id, true, notification_payload);
    
    -- Notify the edge function
    PERFORM pg_notify('push_notification', json_build_object('type', 'item_pending', 'queue_id', currval('notification_queue_id_seq'))::text);
  END IF;
  
  -- On UPDATE: If status changed to 'approved', notify all users
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    notification_payload := jsonb_build_object(
      'title', 'New Item Available!',
      'body', NEW.item_name || ' is now available in marketplace - ₹' || NEW.price,
      'url', '/buy-sell',
      'item_id', NEW.id,
      'item_name', NEW.item_name,
      'category', NEW.category,
      'price', NEW.price
    );
    
    INSERT INTO public.notification_queue (event_type, item_id, target_admins_only, payload)
    VALUES ('item_available', NEW.id, false, notification_payload);
    
    -- Notify the edge function
    PERFORM pg_notify('push_notification', json_build_object('type', 'item_available', 'queue_id', currval('notification_queue_id_seq'))::text);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on items table
DROP TRIGGER IF EXISTS on_item_change ON public.items;
CREATE TRIGGER on_item_change
  AFTER INSERT OR UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_item_notification();