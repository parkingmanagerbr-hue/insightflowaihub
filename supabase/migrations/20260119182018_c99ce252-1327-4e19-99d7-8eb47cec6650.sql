-- Create table for storing SQL query execution results
CREATE TABLE public.sql_query_executions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    query_history_id UUID REFERENCES public.sql_query_history(id) ON DELETE SET NULL,
    connection_id UUID REFERENCES public.user_database_connections(id) ON DELETE SET NULL,
    connection_name TEXT NOT NULL,
    database_type TEXT NOT NULL,
    executed_sql TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    row_count INTEGER,
    columns JSONB,
    result_preview JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_sql_query_executions_user_id ON public.sql_query_executions(user_id);
CREATE INDEX idx_sql_query_executions_created_at ON public.sql_query_executions(created_at DESC);

-- Enable RLS
ALTER TABLE public.sql_query_executions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own executions"
ON public.sql_query_executions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own executions"
ON public.sql_query_executions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own executions"
ON public.sql_query_executions
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all executions"
ON public.sql_query_executions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));