-- Store per-user Azure AD configuration for Power BI (encrypted client secret)

CREATE TABLE IF NOT EXISTS public.user_azure_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  tenant_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  encrypted_client_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_azure_configs ENABLE ROW LEVEL SECURITY;

-- Users can manage only their own configuration
CREATE POLICY "Users can view their own Azure config"
ON public.user_azure_configs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Azure config"
ON public.user_azure_configs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Azure config"
ON public.user_azure_configs
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Azure config"
ON public.user_azure_configs
FOR DELETE
USING (auth.uid() = user_id);

-- Timestamp trigger
DROP TRIGGER IF EXISTS update_user_azure_configs_updated_at ON public.user_azure_configs;
CREATE TRIGGER update_user_azure_configs_updated_at
BEFORE UPDATE ON public.user_azure_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();