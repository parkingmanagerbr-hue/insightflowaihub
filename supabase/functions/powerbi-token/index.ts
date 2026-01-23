import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenRequest {
  workspaceId?: string;
  reportId?: string;
}

// Decrypt function - must match encrypt-connection
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

async function decrypt(encryptedBase64: string, userId: string): Promise<string> {
  const decoder = new TextDecoder();
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);

  const key = await deriveKey(userId, salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength));

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted
  );

  return decoder.decode(decrypted);
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

    // Verify user is active (approved)
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('user_id', user.id)
      .single();
    
    if (!profile || profile.status !== 'active') {
      return new Response(
        JSON.stringify({ error: "Account not active. Please wait for admin approval." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Azure config from database (secure server-side storage)
    const { data: azureConfig, error: configError } = await supabase
      .from('user_azure_configs')
      .select('tenant_id, client_id, encrypted_client_secret')
      .eq('user_id', user.id)
      .maybeSingle();

    if (configError) {
      console.error("Error fetching Azure config:", configError);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve Azure configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!azureConfig) {
      return new Response(
        JSON.stringify({ error: "Azure AD configuration not found. Please configure your Azure AD credentials first.", configured: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt the client secret
    let clientSecret: string;
    try {
      clientSecret = await decrypt(azureConfig.encrypted_client_secret, user.id);
    } catch (decryptError) {
      console.error("Failed to decrypt client secret:", decryptError);
      return new Response(
        JSON.stringify({ error: "Failed to decrypt Azure credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TokenRequest = await req.json();
    
    console.log("Requesting Azure AD token for tenant:", azureConfig.tenant_id);

    // Step 1: Get Azure AD access token
    const tokenUrl = `https://login.microsoftonline.com/${azureConfig.tenant_id}/oauth2/v2.0/token`;
    
    const tokenParams = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: azureConfig.client_id,
      client_secret: clientSecret,
      scope: "https://analysis.windows.net/powerbi/api/.default",
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Azure AD token error:", tokenData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to get Azure AD token",
          details: tokenData.error_description || tokenData.error
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = tokenData.access_token;
    console.log("Azure AD token obtained successfully");

    // Step 2: If workspaceId and reportId provided, generate embed token
    if (body.workspaceId && body.reportId) {
      console.log("Generating embed token for report:", body.reportId);
      
      const embedUrl = `https://api.powerbi.com/v1.0/myorg/groups/${body.workspaceId}/reports/${body.reportId}/GenerateToken`;
      
      const embedResponse = await fetch(embedUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessLevel: "View",
          allowSaveAs: false,
        }),
      });

      const embedData = await embedResponse.json();

      if (!embedResponse.ok) {
        console.error("Power BI embed token error:", embedData);
        return new Response(
          JSON.stringify({ 
            error: "Failed to generate embed token",
            details: embedData.error?.message || embedData.message || "Unknown error"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Embed token generated successfully");

      // Get report details for embed URL
      const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${body.workspaceId}/reports/${body.reportId}`;
      const reportResponse = await fetch(reportUrl, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      let embedReportUrl = "";
      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        embedReportUrl = reportData.embedUrl;
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          embedToken: embedData.token,
          tokenExpiry: embedData.expiration,
          embedUrl: embedReportUrl,
          tokenType: "embed"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return just the access token if no report specified
    return new Response(
      JSON.stringify({ 
        success: true,
        accessToken: accessToken,
        expiresIn: tokenData.expires_in,
        tokenType: "access"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in powerbi-token:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
