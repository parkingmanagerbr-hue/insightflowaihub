import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Encryption using Web Crypto API with user-specific key derivation
async function deriveKey(userId: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(text: string, userId: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(userId, salt.buffer.slice(0));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(text)
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

interface SaveConfigRequest {
  action: 'save' | 'check' | 'delete';
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SaveConfigRequest = await req.json();

    if (body.action === 'check') {
      // Check if config exists
      const { data: config, error } = await supabase
        .from('user_azure_configs')
        .select('tenant_id, client_id, created_at, updated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking config:", error);
        return new Response(
          JSON.stringify({ error: "Failed to check configuration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          configured: !!config,
          config: config ? {
            tenantId: config.tenant_id,
            clientId: config.client_id,
            createdAt: config.created_at,
            updatedAt: config.updated_at
          } : null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === 'delete') {
      const { error } = await supabase
        .from('user_azure_configs')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error("Error deleting config:", error);
        return new Response(
          JSON.stringify({ error: "Failed to delete configuration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Configuration deleted" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.action === 'save') {
      if (!body.tenantId || !body.clientId || !body.clientSecret) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: tenantId, clientId, clientSecret" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate format (basic UUID check for tenant and client IDs)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(body.tenantId)) {
        return new Response(
          JSON.stringify({ error: "Invalid Tenant ID format. Expected UUID format." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!uuidPattern.test(body.clientId)) {
        return new Response(
          JSON.stringify({ error: "Invalid Client ID format. Expected UUID format." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Encrypt the client secret
      const encryptedSecret = await encrypt(body.clientSecret, user.id);

      // Upsert the config
      const { error } = await supabase
        .from('user_azure_configs')
        .upsert({
          user_id: user.id,
          tenant_id: body.tenantId,
          client_id: body.clientId,
          encrypted_client_secret: encryptedSecret,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error("Error saving config:", error);
        return new Response(
          JSON.stringify({ error: "Failed to save configuration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Azure config saved for user ${user.id}`);

      return new Response(
        JSON.stringify({ success: true, message: "Configuration saved securely" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'save', 'check', or 'delete'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in azure-config:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
