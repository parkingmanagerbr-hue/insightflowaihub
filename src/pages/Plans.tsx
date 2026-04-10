import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 'R$ 49,90',
    priceValue: 49.90,
    period: '/mês',
    description: 'Ideal para começar a explorar o poder da IA em seus dados',
    icon: Zap,
    features: [
      'Conexão com múltiplos bancos de dados',
      'Geração de SQL com IA (Gemini)',
      'Histórico de consultas ilimitado',
      'Exportação em CSV, Excel e PDF',
      'Integração com Power BI',
      'Chat com IA para análise de dados',
      'Suporte por email',
    ],
    popular: false,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 'R$ 149,00',
    priceValue: 149.00,
    period: '/ano',
    description: 'Melhor custo-benefício — economize mais de 75%',
    icon: Crown,
    features: [
      'Tudo do plano Mensal',
      'Conexão com múltiplos bancos de dados',
      'Geração de SQL com IA (Gemini)',
      'Histórico de consultas ilimitado',
      'Exportação em CSV, Excel e PDF',
      'Integração com Power BI',
      'Chat com IA para análise de dados',
      'Suporte prioritário',
      'Economize mais de 75%',
    ],
    popular: true,
    savings: 'Economize R$ 449,80',
  },
];

const Plans = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const paymentStatus = searchParams.get('payment');

  if (paymentStatus === 'success') {
    toast({
      title: 'Pagamento aprovado!',
      description: 'Sua assinatura foi ativada com sucesso.',
    });
  } else if (paymentStatus === 'failure') {
    toast({
      title: 'Pagamento não aprovado',
      description: 'Tente novamente ou escolha outro método de pagamento.',
      variant: 'destructive',
    });
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke('mercadopago-checkout', {
        body: { plan: planId },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({
        title: 'Erro ao iniciar pagamento',
        description: err.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(216,82%,10%)] via-[hsl(216,82%,15%)] to-[hsl(216,82%,12%)] text-foreground">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-4 text-center pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="mb-4 bg-[hsl(210,100%,56%)]/20 text-[hsl(210,100%,70%)] border-[hsl(210,100%,56%)]/30">
            Planos & Preços
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Escolha o plano ideal para você
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Desbloqueie todo o potencial do InsightFlow com nossos planos acessíveis.
            Cancele quando quiser.
          </p>
        </motion.div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card
                className={`relative h-full flex flex-col border-2 transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular
                    ? 'border-[hsl(210,100%,56%)] bg-[hsl(216,82%,15%)]/80 shadow-lg shadow-[hsl(210,100%,56%)]/20'
                    : 'border-white/10 bg-[hsl(216,82%,18%)]/60'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[hsl(210,100%,56%)] text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-[hsl(210,100%,56%)]/20 flex items-center justify-center">
                    <plan.icon className="h-7 w-7 text-[hsl(210,100%,56%)]" />
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-white/50">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/50 ml-1">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-white/70 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className={`w-full h-12 text-base font-semibold ${
                      plan.popular
                        ? 'bg-[hsl(210,100%,56%)] hover:bg-[hsl(210,100%,65%)] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                  >
                    {loading === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Assinar agora'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ section */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Perguntas frequentes</h2>
          <div className="space-y-4 text-left">
            {[
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais.',
              },
              {
                q: 'Quais formas de pagamento são aceitas?',
                a: 'Aceitamos cartão de crédito, boleto bancário e Pix através do Mercado Pago.',
              },
              {
                q: 'Existe período de teste gratuito?',
                a: 'Atualmente não oferecemos teste gratuito, mas você pode assinar o plano mensal e cancelar quando quiser.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-white font-medium mb-1">{faq.q}</h3>
                <p className="text-white/50 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
