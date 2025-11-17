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
    // Redirect if already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  // Real-time email validation
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

  // Calculate password strength
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | null => {
    if (password.length === 0) return null;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  // Real-time password validation
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

  const handleForgotPassword = async () => {
    if (!emailValid) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
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
    
    // Validate before submission
    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    
    if (!emailResult.success || !passwordResult.success) {
      toast({
        title: "Dados inválidos",
        description: "Por favor, corrija os erros antes de continuar.",
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
        
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Cadastro realizado!",
          description: "Você já pode fazer login.",
        });
        setIsLogin(true);
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
      <div className="Auth bg-background p-4">
          <Card className="shadow-lg w-full max-w-md">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold">
                Recuperar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Digite seu email para receber as instruções de recuperação
              </p>
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`pl-10 ${emailError ? 'border-destructive' : emailValid ? 'border-green-500' : ''}`}
                  />
                  {emailValid && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                  {emailError && (
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                  )}
                </div>
                {emailError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>
              <Button 
                onClick={handleForgotPassword} 
                className="w-full" 
                disabled={loading || !emailValid}
              >
                {loading ? "Enviando..." : "Enviar instruções"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Voltar ao login
              </Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="Auth bg-background p-4">
      <Card className="shadow-lg w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-center">
              {isLogin ? "Entrar" : "Criar conta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`pl-10 ${emailError ? 'border-destructive' : emailValid ? 'border-green-500' : ''}`}
                  />
                  {emailValid && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                  {emailError && (
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                  )}
                </div>
                {emailError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`pl-10 pr-20 ${passwordError ? 'border-destructive' : passwordValid ? 'border-green-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-10 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  {passwordValid && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                  {passwordError && (
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                  )}
                </div>
                {!isLogin && password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded transition-colors ${
                        passwordStrength === 'weak' ? 'bg-destructive' : 
                        passwordStrength === 'medium' ? 'bg-destructive' : 
                        passwordStrength === 'strong' ? 'bg-destructive' : 'bg-muted'
                      }`} />
                      <div className={`h-1 flex-1 rounded transition-colors ${
                        passwordStrength === 'medium' ? 'bg-yellow-500' : 
                        passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-muted'
                      }`} />
                      <div className={`h-1 flex-1 rounded transition-colors ${
                        passwordStrength === 'strong' ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength === 'weak' && 'Senha fraca'}
                      {passwordStrength === 'medium' && 'Senha média'}
                      {passwordStrength === 'strong' && 'Senha forte'}
                    </p>
                  </div>
                )}
                {passwordError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {passwordError}
                  </p>
                )}
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !emailValid || !passwordValid}
              >
                {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuar com Google
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmailError(null);
                  setPasswordError(null);
                  setEmailValid(false);
                  setPasswordValid(false);
                }}
              >
                {isLogin ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
};

export default Auth;
