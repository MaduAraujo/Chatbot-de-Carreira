import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Mail, Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

// Validation schemas
const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres");

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const result = emailSchema.safeParse(value);
    if (value.length === 0) {
      setEmailError(null);
      setEmailValid(false);
    } else if (!result.success) {
      setEmailError(result.error.errors[0].message);
      setEmailValid(false);
    } else {
      setEmailError(null);
      setEmailValid(true);
    }
  };

  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | null => {
    if (password.length === 0) return null;
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const result = passwordSchema.safeParse(value);
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
    
    if (value.length === 0) {
      setPasswordError(null);
      setPasswordValid(false);
    } else if (!result.success) {
      setPasswordError(result.error.errors[0].message);
      setPasswordValid(false);
    } else {
      setPasswordError(null);
      setPasswordValid(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async () => {
    if (!emailValid) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid || !passwordValid) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos corretamente",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        
        toast({
          title: "Conta criada!",
          description: "Você já pode começar a usar o sistema",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="Auth relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] pointer-events-none" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <Card className="w-full max-w-md mx-auto shadow-[var(--shadow-card)] border-border/50 backdrop-blur-sm bg-card/95 animate-scale-fade-in">
            <CardHeader className="space-y-3">
              <CardTitle className="text-3xl font-bold text-center bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                Recuperar Senha
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Digite seu email para receber instruções de recuperação
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={`pl-10 h-11 transition-all ${emailError ? "border-destructive ring-destructive/20" : emailValid ? "border-secondary ring-secondary/20" : "focus-visible:ring-primary/20"}`}
                    />
                    {emailValid && (
                      <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-secondary animate-fade-in" />
                    )}
                    {emailError && (
                      <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-destructive animate-fade-in" />
                    )}
                  </div>
                  {emailError && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
                      <AlertCircle className="h-4 w-4" />
                      {emailError}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleForgotPassword}
                  className="w-full h-11 bg-[image:var(--gradient-primary)] hover:opacity-90 transition-all shadow-[var(--shadow-soft)]" 
                  disabled={loading || !!emailError}
                >
                  {loading ? "Enviando..." : "Enviar Instruções"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 hover:bg-muted/50 transition-all"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Voltar ao Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="Auth relative overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)] pointer-events-none" />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <Card className="w-full max-w-md mx-auto shadow-[var(--shadow-card)] border-border/50 backdrop-blur-sm bg-card/95 animate-scale-fade-in">
          <CardHeader className="space-y-4 pb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-lg animate-fade-in">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              {isLogin ? "Bem-vindo de volta" : "Começar agora"}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              {isLogin ? "Entre com sua conta para continuar" : "Crie sua conta em segundos"}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`pl-10 h-11 transition-all ${emailError ? "border-destructive ring-destructive/20" : emailValid ? "border-secondary ring-secondary/20" : "focus-visible:ring-primary/20"}`}
                  />
                  {emailValid && (
                    <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-secondary animate-fade-in" />
                  )}
                  {emailError && (
                    <AlertCircle className="absolute right-3 top-3 h-5 w-5 text-destructive animate-fade-in" />
                  )}
                </div>
                {emailError && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`pl-10 pr-10 h-11 transition-all ${passwordError ? "border-destructive ring-destructive/20" : passwordValid ? "border-secondary ring-secondary/20" : "focus-visible:ring-primary/20"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </p>
                )}
                
                {!isLogin && passwordStrength && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength === 'weak' ? 'bg-destructive' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-accent' : 'bg-muted'}`} />
                      <div className={`h-1 flex-1 rounded-full transition-all ${passwordStrength === 'strong' ? 'bg-secondary' : 'bg-muted'}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Força da senha: <span className={`font-medium ${passwordStrength === 'weak' ? 'text-destructive' : passwordStrength === 'medium' ? 'text-accent' : 'text-secondary'}`}>
                        {passwordStrength === 'weak' ? 'Fraca' : passwordStrength === 'medium' ? 'Média' : 'Forte'}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Esqueceu a senha?
                </button>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-[image:var(--gradient-primary)] hover:opacity-90 transition-all shadow-[var(--shadow-soft)]" 
                disabled={loading || !emailValid || !passwordValid}
              >
                {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="h-11 hover:bg-muted/50 transition-all border-border/50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGithubSignIn}
                  className="h-11 hover:bg-muted/50 transition-all border-border/50"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMicrosoftSignIn}
                  className="h-11 hover:bg-muted/50 transition-all border-border/50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M13 1h10v10H13z" />
                    <path fill="#7fba00" d="M1 13h10v10H1z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                <span className="text-primary font-medium hover:underline">
                  {isLogin ? "Criar conta" : "Entrar"}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
