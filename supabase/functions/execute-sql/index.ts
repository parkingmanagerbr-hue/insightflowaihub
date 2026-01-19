import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client as PostgresClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { Client as MySQLClient } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Execute PostgreSQL query
async function executePostgresQuery(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string,
  sql: string
): Promise<{ success: boolean; data?: unknown[]; columns?: string[]; rowCount?: number; error?: string; executionTimeMs: number }> {
  const startTime = Date.now();
  console.log(`Executing PostgreSQL query on ${host}:${port}/${database}`);
  
  const client = new PostgresClient({
    hostname: host,
    port: port,
    database: database,
    user: username,
    password: password,
    tls: { enabled: false },
    connection: { attempts: 1 },
  });

  try {
    await client.connect();
    const result = await client.queryObject(sql);
    await client.end();
    
    const executionTimeMs = Date.now() - startTime;
    // Extract column names - columns is an array of Column objects or strings
    const columns = result.columns ? 
      result.columns.map((c: { name: string } | string) => typeof c === 'string' ? c : c.name) : 
      (result.rows.length > 0 ? Object.keys(result.rows[0] as object) : []);
    
    return { 
      success: true, 
      data: result.rows as unknown[], 
      columns,
      rowCount: result.rowCount ?? result.rows.length,
      executionTimeMs 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('PostgreSQL query error:', errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      executionTimeMs: Date.now() - startTime 
    };
  }
}

// Execute MySQL query
async function executeMySQLQuery(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string,
  sql: string
): Promise<{ success: boolean; data?: unknown[]; columns?: string[]; rowCount?: number; error?: string; executionTimeMs: number }> {
  const startTime = Date.now();
  console.log(`Executing MySQL query on ${host}:${port}/${database}`);
  
  const client = await new MySQLClient();

  try {
    await client.connect({
      hostname: host,
      port: port,
      db: database,
      username: username,
      password: password,
    });
    
    const result = await client.query(sql);
    await client.close();
    
    const executionTimeMs = Date.now() - startTime;
    
    // Extract columns from first row if available
    const rows = Array.isArray(result) ? result : [];
    const columns = rows.length > 0 ? Object.keys(rows[0] as object) : [];
    
    return { 
      success: true, 
      data: rows, 
      columns,
      rowCount: rows.length,
      executionTimeMs 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('MySQL query error:', errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      executionTimeMs: Date.now() - startTime 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { connectionId, sql, queryHistoryId, saveExecution = true } = await req.json();
    console.log(`Processing SQL execution for user ${user.id} on connection ${connectionId}`);

    if (!connectionId) {
      return new Response(
        JSON.stringify({ error: 'Connection ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'SQL query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic SQL injection prevention - only allow SELECT queries
    const sqlTrimmed = sql.trim().toUpperCase();
    if (!sqlTrimmed.startsWith('SELECT') && !sqlTrimmed.startsWith('WITH')) {
      return new Response(
        JSON.stringify({ error: 'Only SELECT queries are allowed for safety' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for dangerous keywords
    const dangerousKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE'];
    for (const keyword of dangerousKeywords) {
      // Check if keyword appears outside of quotes/strings
      const pattern = new RegExp(`\\b${keyword}\\b(?=(?:[^']*'[^']*')*[^']*$)`, 'i');
      if (pattern.test(sql)) {
        return new Response(
          JSON.stringify({ error: `Keyword ${keyword} is not allowed in queries` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch connection details
    const { data: connection, error: connError } = await supabase
      .from('user_database_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (connError || !connection) {
      console.error('Connection not found:', connError);
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required parameters
    if (!connection.host || !connection.port || !connection.database_name || !connection.username) {
      return new Response(
        JSON.stringify({ error: 'Connection parameters incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt password if exists
    let password = '';
    if (connection.encrypted_password) {
      try {
        password = await decrypt(connection.encrypted_password, user.id);
      } catch (decryptError) {
        console.error('Failed to decrypt password:', decryptError);
        return new Response(
          JSON.stringify({ error: 'Failed to decrypt connection credentials' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Execute query based on type
    let result: { success: boolean; data?: unknown[]; columns?: string[]; rowCount?: number; error?: string; executionTimeMs: number };
    
    switch (connection.type) {
      case 'postgresql':
        result = await executePostgresQuery(
          connection.host,
          connection.port,
          connection.database_name,
          connection.username,
          password,
          sql
        );
        break;
      case 'mysql':
        result = await executeMySQLQuery(
          connection.host,
          connection.port,
          connection.database_name,
          connection.username,
          password,
          sql
        );
        break;
      case 'sqlserver':
      case 'oracle':
        return new Response(
          JSON.stringify({ 
            error: `${connection.type} query execution is not yet supported. Only PostgreSQL and MySQL are currently available.` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      default:
        return new Response(
          JSON.stringify({ error: `Unsupported database type: ${connection.type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Save execution to history if requested
    let executionId: string | null = null;
    if (saveExecution) {
      try {
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

        // Store only first 100 rows as preview
        const resultPreview = result.data ? result.data.slice(0, 100) : null;

        const { data: execution, error: insertError } = await adminSupabase
          .from('sql_query_executions')
          .insert({
            user_id: user.id,
            query_history_id: queryHistoryId || null,
            connection_id: connectionId,
            connection_name: connection.name,
            database_type: connection.type,
            executed_sql: sql,
            success: result.success,
            row_count: result.rowCount || 0,
            columns: result.columns || [],
            result_preview: resultPreview,
            error_message: result.error || null,
            execution_time_ms: result.executionTimeMs,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to save execution:', insertError);
        } else {
          executionId = execution?.id || null;
          console.log('Execution saved with ID:', executionId);
        }
      } catch (saveError) {
        console.error('Error saving execution:', saveError);
      }
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: result.error,
          executionTimeMs: result.executionTimeMs,
          executionId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Query executed successfully. Rows: ${result.rowCount}, Time: ${result.executionTimeMs}ms`);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: result.data,
        columns: result.columns,
        rowCount: result.rowCount,
        executionTimeMs: result.executionTimeMs,
        connectionName: connection.name,
        databaseType: connection.type,
        executionId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in execute-sql function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
