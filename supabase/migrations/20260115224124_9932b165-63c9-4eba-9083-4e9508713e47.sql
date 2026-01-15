-- Drop overly permissive policies
DROP POLICY IF EXISTS "Service role can insert email notifications" ON public.email_notifications;
DROP POLICY IF EXISTS "Service role can update email notifications" ON public.email_notifications;

-- Create more restrictive policies
-- Note: Edge functions using service_role key bypass RLS entirely
-- These policies are for regular authenticated users - which should not have access
CREATE POLICY "No user insert on email notifications"
ON public.email_notifications
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No user update on email notifications"
ON public.email_notifications
FOR UPDATE
USING (false);