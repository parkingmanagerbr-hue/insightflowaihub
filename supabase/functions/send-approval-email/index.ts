import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "approval" | "approved" | "rejected";
  userEmail: string;
  userName: string;
  userId: string;
}

const ADMIN_EMAIL = "mrovariz@hotmail.com";
const APP_NAME = "InsightFlow AI Hub";
const SENDER_EMAIL = "InsightFlowAIHub@outlook.com";
const SENDER_NAME = "InsightFlow AI Hub";

// Generate HTML email templates
const generateApprovalRequestEmail = (userName: string, userEmail: string, userId: string, baseUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Solicitação de Acesso - ${APP_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A1F44; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a365d 0%, #0A1F44 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; color: #E2E8F0; }
    .content h2 { color: #1E90FF; margin-top: 0; }
    .info-box { background: rgba(30, 144, 255, 0.1); border-left: 4px solid #1E90FF; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 8px 0; }
    .info-label { color: #90CDF4; font-size: 12px; text-transform: uppercase; }
    .info-value { color: white; font-size: 16px; font-weight: 600; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 14px 32px; margin: 0 10px 10px 0; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.3s; }
    .button-approve { background: linear-gradient(135deg, #48BB78 0%, #38A169 100%); color: white; }
    .button-reject { background: linear-gradient(135deg, #FC8181 0%, #E53E3E 100%); color: white; }
    .footer { background: rgba(0,0,0,0.2); padding: 20px; text-align: center; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 ${APP_NAME}</h1>
    </div>
    <div class="content">
      <h2>Nova Solicitação de Acesso</h2>
      <p>Um novo usuário se registrou e está aguardando aprovação para acessar o sistema.</p>
      
      <div class="info-box">
        <p><span class="info-label">Nome</span><br><span class="info-value">${userName || 'Não informado'}</span></p>
        <p><span class="info-label">E-mail</span><br><span class="info-value">${userEmail}</span></p>
        <p><span class="info-label">ID do Usuário</span><br><span class="info-value">${userId}</span></p>
      </div>
      
      <div class="button-container">
        <a href="${baseUrl}/admin/approve/${userId}" class="button button-approve">✓ Aprovar Usuário</a>
        <a href="${baseUrl}/admin/reject/${userId}" class="button button-reject">✕ Rejeitar Usuário</a>
      </div>
      
      <p style="color: #718096; font-size: 14px;">Você também pode gerenciar usuários diretamente no painel administrativo.</p>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo ${APP_NAME}.<br>Por favor, não responda a este email.</p>
    </div>
  </div>
</body>
</html>
`;

const generateApprovedEmail = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conta Aprovada - ${APP_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A1F44; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a365d 0%, #0A1F44 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #48BB78 0%, #38A169 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; color: #E2E8F0; text-align: center; }
    .content h2 { color: #48BB78; margin-top: 0; }
    .icon { font-size: 64px; margin: 20px 0; }
    .button { display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1E90FF 0%, #00BFFF 100%); color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 20px; }
    .footer { background: rgba(0,0,0,0.2); padding: 20px; text-align: center; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ ${APP_NAME}</h1>
    </div>
    <div class="content">
      <div class="icon">🎉</div>
      <h2>Sua conta foi aprovada!</h2>
      <p>Olá${userName ? `, ${userName}` : ''}!</p>
      <p>Temos o prazer de informar que sua solicitação de acesso ao ${APP_NAME} foi <strong>aprovada</strong>.</p>
      <p>Agora você pode acessar todas as funcionalidades da plataforma para criar relatórios inteligentes com Gemini AI e Power BI.</p>
      <a href="https://insightflowaihub.lovable.app/auth" class="button">Acessar o Sistema</a>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo ${APP_NAME}.<br>Por favor, não responda a este email.</p>
    </div>
  </div>
</body>
</html>
`;

const generateRejectedEmail = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitação Não Aprovada - ${APP_NAME}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0A1F44; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a365d 0%, #0A1F44 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #FC8181 0%, #E53E3E 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; color: #E2E8F0; text-align: center; }
    .content h2 { color: #FC8181; margin-top: 0; }
    .icon { font-size: 64px; margin: 20px 0; }
    .footer { background: rgba(0,0,0,0.2); padding: 20px; text-align: center; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✕ ${APP_NAME}</h1>
    </div>
    <div class="content">
      <div class="icon">😔</div>
      <h2>Solicitação não aprovada</h2>
      <p>Olá${userName ? `, ${userName}` : ''}!</p>
      <p>Lamentamos informar que sua solicitação de acesso ao ${APP_NAME} <strong>não foi aprovada</strong> neste momento.</p>
      <p>Se você acredita que isso é um erro ou deseja mais informações, entre em contato com o administrador do sistema.</p>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo ${APP_NAME}.<br>Por favor, não responda a este email.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body: EmailRequest = await req.json();
    
    if (!body.type || !body.userEmail || !body.userId) {
      console.error("Missing required fields:", { type: body.type, userEmail: body.userEmail, userId: body.userId });
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, userEmail, userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.userEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate type
    if (!["approval", "approved", "rejected"].includes(body.type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be: approval, approved, or rejected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get base URL for email links
    const baseUrl = "https://insightflowaihub.lovable.app";
    
    let emailTo: string;
    let emailSubject: string;
    let emailHtml: string;

    switch (body.type) {
      case "approval":
        emailTo = ADMIN_EMAIL;
        emailSubject = `[${APP_NAME}] Nova Solicitação de Acesso - ${body.userName || body.userEmail}`;
        emailHtml = generateApprovalRequestEmail(body.userName, body.userEmail, body.userId, baseUrl);
        break;
      case "approved":
        emailTo = body.userEmail;
        emailSubject = `[${APP_NAME}] Sua conta foi aprovada!`;
        emailHtml = generateApprovedEmail(body.userName);
        break;
      case "rejected":
        emailTo = body.userEmail;
        emailSubject = `[${APP_NAME}] Solicitação de acesso`;
        emailHtml = generateRejectedEmail(body.userName);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid email type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Store email notification in a table for tracking
    const { error: insertError } = await supabase
      .from("email_notifications")
      .insert({
        recipient_email: emailTo,
        email_type: body.type,
        user_id: body.userId,
        subject: emailSubject,
        status: "pending",
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.log("Note: email_notifications table may not exist, continuing without tracking:", insertError.message);
    }

    // Send email via Brevo API
    if (brevoApiKey) {
      try {
        console.log("Sending email via Brevo to:", emailTo);
        
        const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": brevoApiKey,
          },
          body: JSON.stringify({
            sender: {
              name: SENDER_NAME,
              email: SENDER_EMAIL,
            },
            to: [{ email: emailTo }],
            subject: emailSubject,
            htmlContent: emailHtml,
          }),
        });

        const brevoResult = await brevoResponse.json();
        
        if (!brevoResponse.ok) {
          console.error("Brevo API error:", brevoResult);
          
          // Update notification status to failed
          if (!insertError) {
            await supabase
              .from("email_notifications")
              .update({ 
                status: "failed", 
                error_message: JSON.stringify(brevoResult),
                processed_at: new Date().toISOString() 
              })
              .eq("user_id", body.userId)
              .eq("email_type", body.type)
              .order("created_at", { ascending: false })
              .limit(1);
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Failed to send email via Brevo",
              details: brevoResult 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Email sent successfully via Brevo:", brevoResult);

        // Update notification status to sent
        if (!insertError) {
          await supabase
            .from("email_notifications")
            .update({ status: "sent", processed_at: new Date().toISOString() })
            .eq("user_id", body.userId)
            .eq("email_type", body.type)
            .order("created_at", { ascending: false })
            .limit(1);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Email of type '${body.type}' sent successfully via Brevo`,
            recipient: emailTo,
            messageId: brevoResult.messageId
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (brevoError) {
        console.error("Brevo sending error:", brevoError);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Failed to send email",
            details: brevoError instanceof Error ? brevoError.message : "Unknown error"
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log("BREVO_API_KEY not configured. Email logged but not sent.");
      
      // Update status to indicate email was logged only
      if (!insertError) {
        await supabase
          .from("email_notifications")
          .update({ status: "logged", processed_at: new Date().toISOString() })
          .eq("user_id", body.userId)
          .eq("email_type", body.type)
          .order("created_at", { ascending: false })
          .limit(1);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email notification of type '${body.type}' logged (BREVO_API_KEY not configured)`,
          recipient: emailTo,
          note: "Configure BREVO_API_KEY secret for actual email delivery"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-approval-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
