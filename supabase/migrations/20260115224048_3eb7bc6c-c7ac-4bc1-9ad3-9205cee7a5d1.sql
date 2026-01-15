-- Create email_notifications table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('approval', 'approved', 'rejected')),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view email notifications
CREATE POLICY "Admins can view email notifications"
ON public.email_notifications
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only service role can insert (from edge function)
CREATE POLICY "Service role can insert email notifications"
ON public.email_notifications
FOR INSERT
WITH CHECK (true);

-- Only service role can update (from edge function)
CREATE POLICY "Service role can update email notifications"
ON public.email_notifications
FOR UPDATE
USING (true);

-- Create index for faster queries
CREATE INDEX idx_email_notifications_user_id ON public.email_notifications(user_id);
CREATE INDEX idx_email_notifications_status ON public.email_notifications(status);