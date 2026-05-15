import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { z } from 'zod';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

  const emailSchema = z.string().email(t('auth.errors.invalidEmail'));
  const passwordSchema = z.string().min(6, t('auth.errors.passwordMin'));

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, resetPassword, user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile?.status === 'active') {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e) { if (e instanceof z.ZodError) newErrors.email = e.errors[0].message; }
    if (mode !== 'forgot') {
      try { passwordSchema.parse(password); } catch (e) { if (e instanceof z.ZodError) newErrors.password = e.errors[0].message; }
    }
    if (mode === 'register' && password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: t('auth.errors.loginError'),
            description: error.message.includes('Invalid login credentials')
              ? t('auth.errors.invalidCredentials')
              : error.message,
            variant: 'destructive',
          });
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: t('auth.errors.registerError'),
            description: error.message.includes('already registered')
              ? t('auth.errors.emailAlreadyRegistered')
              : error.message,
            variant: 'destructive',
          });
        } else {
          toast({ title: t('auth.success.registered'), description: t('auth.success.registeredMessage') });
          setMode('login');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: t('auth.success.emailSent'), description: t('auth.success.emailSentMessage') });
          setMode('login');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderPendingApproval = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
        <Mail className="w-8 h-8 text-yellow-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{t('auth.pendingApproval.title')}</h2>
      <p className="text-muted-foreground">{t('auth.pendingApproval.message')}</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('auth.backToHome')}
      </Button>
    </motion.div>
  );

  const renderRejected = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">{t('auth.rejected.title')}</h2>
      <p className="text-muted-foreground">{t('auth.rejected.message')}</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('auth.backToHome')}
      </Button>
    </motion.div>
  );

  if (user && profile?.status === 'pending_approval') {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="w-full max-w-md">{renderPendingApproval()}</div></div>;
  }

  if (user && profile?.status === 'rejected') {
    return <div className="min-h-screen bg-background flex items-center justify-center p-4"><div className="w-full max-w-md">{renderRejected()}</div></div>;
  }

  const modeTitle = {
    login: t('auth.login'),
    register: t('auth.register'),
    forgot: t('auth.forgotPassword'),
    reset: t('auth.resetPassword'),
  }[mode];

  const modeSubtitle = {
    login: t('auth.loginSubtitle'),
    register: t('auth.registerSubtitle'),
    forgot: t('auth.forgotSubtitle'),
    reset: t('auth.resetSubtitle'),
  }[mode];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center mb-6"><Logo /></div>
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">{modeTitle}</h1>
          <p className="text-muted-foreground text-center mb-6">{modeSubtitle}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="fullName" type="text" placeholder={t('auth.fullNamePlaceholder')} value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder={t('auth.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? t('auth.loading')
                : mode === 'login'
                ? t('auth.submitLogin')
                : mode === 'register'
                ? t('auth.submitRegister')
                : t('auth.submitForgot')}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('forgot')} className="text-primary hover:underline block w-full">{t('auth.forgotLink')}</button>
                <p className="text-muted-foreground">
                  {t('auth.noAccount')}{' '}
                  <button onClick={() => setMode('register')} className="text-primary hover:underline">{t('auth.createAccount')}</button>
                </p>
              </>
            )}
            {mode === 'register' && (
              <p className="text-muted-foreground">
                {t('auth.hasAccount')}{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline">{t('auth.login')}</button>
              </p>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button onClick={() => setMode('login')} className="text-primary hover:underline">{t('auth.backToLogin')}</button>
            )}
          </div>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('auth.backToHome')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
