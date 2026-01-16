import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client as PostgresClient } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { Client as MySQLClient } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption using Web Crypto API with user-specific key derivation
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

async function decrypt(encryptedBase64: string, userId: string): Promise<string> {
  const decoder = new TextDecoder();
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

  // Extract salt, iv, and encrypted data
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

// Test PostgreSQL connection
async function testPostgresConnection(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Testing PostgreSQL connection to ${host}:${port}/${database}`);
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
    const result = await client.queryObject("SELECT 1 as test");
    console.log('PostgreSQL connection successful:', result);
    await client.end();
    return { success: true, message: 'Conexão PostgreSQL estabelecida com sucesso!' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('PostgreSQL connection error:', errorMessage);
    return { success: false, message: `Erro ao conectar: ${errorMessage}` };
  }
}

// Test MySQL connection
async function testMySQLConnection(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Testing MySQL connection to ${host}:${port}/${database}`);
  const client = await new MySQLClient();

  try {
    await client.connect({
      hostname: host,
      port: port,
      db: database,
      username: username,
      password: password,
    });
    const result = await client.query("SELECT 1 as test");
    console.log('MySQL connection successful:', result);
    await client.close();
    return { success: true, message: 'Conexão MySQL estabelecida com sucesso!' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('MySQL connection error:', errorMessage);
    return { success: false, message: `Erro ao conectar: ${errorMessage}` };
  }
}

// Test SQL Server connection (via TCP socket - basic validation)
async function testSQLServerConnection(
  host: string,
  port: number,
  _database: string,
  _username: string,
  _password: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Testing SQL Server connection to ${host}:${port}`);
  
  // For SQL Server, we do a basic TCP connection test since Deno doesn't have a native driver
  // In production, you would use a proper TDS (Tabular Data Stream) library
  try {
    const conn = await Deno.connect({
      hostname: host,
      port: port,
    });
    conn.close();
    return { 
      success: true, 
      message: 'Servidor SQL Server acessível. Nota: validação completa de credenciais requer conexão TDS.' 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('SQL Server connection error:', errorMessage);
    return { success: false, message: `Erro ao conectar: ${errorMessage}` };
  }
}

// Test Oracle connection (via TCP socket - basic validation)
async function testOracleConnection(
  host: string,
  port: number,
  _database: string,
  _username: string,
  _password: string
): Promise<{ success: boolean; message: string }> {
  console.log(`Testing Oracle connection to ${host}:${port}`);
  
  // For Oracle, we do a basic TCP connection test since Deno doesn't have a native driver
  try {
    const conn = await Deno.connect({
      hostname: host,
      port: port,
    });
    conn.close();
    return { 
      success: true, 
      message: 'Servidor Oracle acessível. Nota: validação completa de credenciais requer driver Oracle.' 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Oracle connection error:', errorMessage);
    return { success: false, message: `Erro ao conectar: ${errorMessage}` };
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

    const { action, text, connectionId } = await req.json();
    console.log(`Processing ${action} request for user ${user.id}`);

    if (action === 'encrypt') {
      if (!text) {
        return new Response(
          JSON.stringify({ error: 'Text to encrypt is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const encrypted = await encrypt(text, user.id);
      console.log('Encryption successful');

      return new Response(
        JSON.stringify({ encrypted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    
    if (action === 'decrypt') {
      if (!connectionId) {
        return new Response(
          JSON.stringify({ error: 'Connection ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch encrypted password from database
      const { data: connection, error: connError } = await supabase
        .from('user_database_connections')
        .select('encrypted_password')
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

      if (!connection.encrypted_password) {
        return new Response(
          JSON.stringify({ decrypted: '' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const decrypted = await decrypt(connection.encrypted_password, user.id);
      console.log('Decryption successful');

      return new Response(
        JSON.stringify({ decrypted }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'test-connection') {
      if (!connectionId) {
        return new Response(
          JSON.stringify({ error: 'Connection ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
        await supabase
          .from('user_database_connections')
          .update({ status: 'error' })
          .eq('id', connectionId);

        return new Response(
          JSON.stringify({ 
            success: false, 
            status: 'error',
            message: 'Parâmetros de conexão incompletos'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Decrypt password if exists
      let password = '';
      if (connection.encrypted_password) {
        try {
          password = await decrypt(connection.encrypted_password, user.id);
        } catch (decryptError) {
          console.error('Failed to decrypt password:', decryptError);
        }
      }

      // Test connection based on type
      let result: { success: boolean; message: string };
      
      switch (connection.type) {
        case 'postgresql':
          result = await testPostgresConnection(
            connection.host,
            connection.port,
            connection.database_name,
            connection.username,
            password
          );
          break;
        case 'mysql':
          result = await testMySQLConnection(
            connection.host,
            connection.port,
            connection.database_name,
            connection.username,
            password
          );
          break;
        case 'sqlserver':
          result = await testSQLServerConnection(
            connection.host,
            connection.port,
            connection.database_name,
            connection.username,
            password
          );
          break;
        case 'oracle':
          result = await testOracleConnection(
            connection.host,
            connection.port,
            connection.database_name,
            connection.username,
            password
          );
          break;
        default:
          result = { success: false, message: `Tipo de banco não suportado: ${connection.type}` };
      }

      // Update connection status
      const newStatus = result.success ? 'connected' : 'error';
      await supabase
        .from('user_database_connections')
        .update({ status: newStatus })
        .eq('id', connectionId);

      console.log(`Connection test result: ${newStatus} - ${result.message}`);

      return new Response(
        JSON.stringify({ 
          success: result.success, 
          status: newStatus,
          message: result.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in encrypt-connection function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
