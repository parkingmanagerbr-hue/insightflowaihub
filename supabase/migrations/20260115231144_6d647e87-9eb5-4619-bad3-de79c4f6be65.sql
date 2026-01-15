-- Create table for SQL query history/audit
CREATE TABLE public.sql_query_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  generated_sql TEXT NOT NULL,
  context TEXT,
  model_used TEXT DEFAULT 'google/gemini-3-flash-preview',
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sql_query_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own queries" 
ON public.sql_query_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queries" 
ON public.sql_query_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all queries for audit
CREATE POLICY "Admins can view all queries" 
ON public.sql_query_history 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster lookups
CREATE INDEX idx_sql_query_history_user_id ON public.sql_query_history(user_id);
CREATE INDEX idx_sql_query_history_created_at ON public.sql_query_history(created_at DESC);