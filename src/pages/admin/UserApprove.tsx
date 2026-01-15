import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Shield } from "lucide-react";

interface UserApproveProps {
  action: "approve" | "reject";
}

const UserApprove = ({ action }: UserApproveProps) => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email: string; full_name: string | null } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user:", error);
        setError("Usuário não encontrado");
      } else if (data) {
        setUserInfo(data);
      } else {
        setError("Usuário não encontrado");
      }
    };

    if (isAdmin && userId) {
      fetchUserInfo();
    }
  }, [userId, isAdmin]);

  const handleAction = async () => {
    if (!userId || !userInfo) return;

    setIsProcessing(true);
    setError(null);

    try {
      const newStatus = action === "approve" ? "active" : "rejected";

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Send notification email
      await supabase.functions.invoke("send-approval-email", {
        body: {
          type: action === "approve" ? "approved" : "rejected",
          userEmail: userInfo.email,
          userName: userInfo.full_name || "",
          userId: userId,
        },
      });

      setIsComplete(true);
      toast({
        title: "Sucesso",
        description: `Usuário ${action === "approve" ? "aprovado" : "rejeitado"} com sucesso`,
      });
    } catch (err) {
      console.error("Error processing action:", err);
      setError("Erro ao processar a ação. Tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível processar a ação",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado como administrador para realizar esta ação.
            </p>
            <Button onClick={() => navigate("/auth")}>Fazer Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            {action === "approve" ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            )}
            <h2 className="text-xl font-semibold mb-2">
              Usuário {action === "approve" ? "Aprovado" : "Rejeitado"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {userInfo?.full_name || userInfo?.email} foi{" "}
              {action === "approve" ? "aprovado e notificado por email" : "rejeitado"}.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard/admin")}>
                Ir para Admin
              </Button>
              <Button onClick={() => navigate("/")}>Página Inicial</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {action === "approve" ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                Aprovar Usuário
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-500" />
                Rejeitar Usuário
              </>
            )}
          </CardTitle>
          <CardDescription>
            Confirme a ação abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : userInfo ? (
            <>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{userInfo.full_name || "Não informado"}</p>
                <p className="text-sm text-muted-foreground mt-2">E-mail</p>
                <p className="font-medium">{userInfo.email}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard/admin")}
                >
                  Cancelar
                </Button>
                <Button
                  className={`flex-1 ${
                    action === "reject" ? "bg-red-600 hover:bg-red-700" : ""
                  }`}
                  onClick={handleAction}
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {action === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-muted-foreground mt-2">Carregando informações...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserApprove;