-- Drop and recreate the handle_item_notification function to fix sequence reference
CREATE OR REPLACE FUNCTION handle_item_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_payload JSONB;
  queue_id UUID;
BEGIN
  -- New item inserted (notify admins only)
  IF TG_OP = 'INSERT' THEN
    notification_payload := jsonb_build_object(
      'title', 'New Item Listed',
      'body', format('A new item "%s" has been listed for review', NEW.item_name),
      'url', '/admin/marketplace',
      'tag', format('item-%s', NEW.id)
    );
    
    INSERT INTO notification_queue (event_type, item_id, target_admins_only, payload, status)
    VALUES ('item_created', NEW.id, true, notification_payload, 'pending')
    RETURNING id INTO queue_id;
    
    -- Notify edge function
    PERFORM pg_notify('push_notification', json_build_object('queue_id', queue_id)::text);
  END IF;
  
  -- Item status changed to approved (notify all users)
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    notification_payload := jsonb_build_object(
      'title', 'New Item Available!',
      'body', format('%s is now available in marketplace - ₹%s', NEW.item_name, NEW.price),
      'url', '/buy-sell',
      'tag', format('item-available-%s', NEW.id)
    );
    
    INSERT INTO notification_queue (event_type, item_id, target_admins_only, payload, status)
    VALUES ('item_available', NEW.id, false, notification_payload, 'pending')
    RETURNING id INTO queue_id;
    
    -- Notify edge function
    PERFORM pg_notify('push_notification', json_build_object('queue_id', queue_id)::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;