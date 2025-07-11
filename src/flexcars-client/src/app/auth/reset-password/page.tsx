"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Token de réinitialisation manquant ou invalide' });
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const minLength = 12;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[\W_]/.test(password);

    if (password.length < minLength) {
      return `Le mot de passe doit contenir au moins ${minLength} caractères`;
    }
    if (!hasUpper) {
      return 'Le mot de passe doit contenir au moins une majuscule';
    }
    if (!hasLower) {
      return 'Le mot de passe doit contenir au moins une minuscule';
    }
    if (!hasNumber) {
      return 'Le mot de passe doit contenir au moins un chiffre';
    }
    if (!hasSymbol) {
      return 'Le mot de passe doit contenir au moins un caractère spécial';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setMessage({ type: 'error', text: 'Token manquant ou invalide' });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authApi.resetPassword(token, password);
      setMessage({ type: 'success', text: response.data.message || 'Mot de passe réinitialisé avec succès' });
      setResetSuccess(true);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setMessage({ type: 'error', text: error.message as string });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la réinitialisation du mot de passe' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Réinitialisation réussie</CardTitle>
            <CardDescription>
              Votre mot de passe a été modifié avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-center text-sm text-gray-600">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe
              </p>
              <Button onClick={handleLoginRedirect} className="w-full">
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Nouveau mot de passe</CardTitle>
          <CardDescription className="text-center">
            Saisissez votre nouveau mot de passe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre nouveau mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2.5 h-4 w-4 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Le mot de passe doit contenir au moins 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Réinitialiser le mot de passe
                </>
              )}
            </Button>
          </form>

          <Button
            onClick={handleLoginRedirect}
            variant="ghost"
            className="w-full"
          >
            Retour à la connexion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
} 