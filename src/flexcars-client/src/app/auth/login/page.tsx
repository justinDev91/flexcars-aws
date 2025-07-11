"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Car, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { GoogleOAuthButton } from '@/components/google-oauth-button';

// Composant séparé pour gérer les erreurs Google OAuth
function GoogleErrorHandler({ onError }: { onError: (error: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'google_auth_failed') {
      onError('Échec de la connexion avec Google. Veuillez réessayer.');
    }
  }, [searchParams, onError]);

  return null;
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const [googleError, setGoogleError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password);
      // La redirection se fait automatiquement dans le contexte
    } catch (err) {
      // L'erreur est gérée par le contexte
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <>
      <GoogleErrorHandler onError={setGoogleError} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">FlexCars</span>
          </div>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour accéder à nos véhicules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || googleError) && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error || googleError}
                {error && error.includes('confirmer votre adresse email') && (
                  <div className="mt-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal text-red-600 underline"
                      onClick={() => router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)}
                    >
                      Aller vérifier mon email
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Séparateur */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
          </div>

          {/* Bouton Google OAuth */}
          <GoogleOAuthButton 
            text="Se connecter avec Google"
            disabled={isLoading}
          />
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="p-0 h-auto font-normal text-sm text-muted-foreground"
              onClick={() => router.push('/auth/forgot-password')}
            >
              Mot de passe oublié ?
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Pas encore de compte ?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-primary"
                onClick={() => router.push('/auth/register')}
              >
                Créer un compte
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">FlexCars</span>
            </div>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Chargement...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 