"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [showManualRedirect, setShowManualRedirect] = useState(false);
  const processedRef = useRef(false);

  const handleGoogleCallback = useCallback(async () => {
    if (processedRef.current) return; // Éviter les re-traitements
    
    try {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      
      console.log('Google callback - Token:', token ? 'présent' : 'absent');
      console.log('Google callback - User param:', userParam ? 'présent' : 'absent');
      
      if (token && userParam) {
        processedRef.current = true; // Marquer comme traité
        
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log('Google callback - User parsed:', user);
        
        // Sauvegarder le token et l'utilisateur
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mettre à jour le contexte d'authentification
        setUser(user);
        setStatus('success');
        
        console.log('Google callback - Données sauvegardées, redirection dans 1 seconde...');
        
        // Redirection directe avec délai
        setTimeout(() => {
          console.log('Google callback - Redirection vers dashboard...');
          window.location.href = '/dashboard';
        }, 1000);
        
        // Fallback : afficher le bouton manuel après 3 secondes
        setTimeout(() => {
          setShowManualRedirect(true);
        }, 3000);
        
      } else {
        throw new Error('Paramètres d\'authentification manquants');
      }
      
    } catch (err) {
      console.error('Erreur lors du callback Google:', err);
      setError(err instanceof Error ? err.message : 'Erreur d\'authentification Google');
      setStatus('error');
      
      setTimeout(() => {
        router.push('/auth/login?error=google_auth_failed');
      }, 3000);
    }
  }, [searchParams, setUser, router]);

  useEffect(() => {
    handleGoogleCallback();
  }, [handleGoogleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">FlexCars</span>
          </div>
          <CardTitle>Connexion Google</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Finalisation de votre connexion avec Google...
              </p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="h-8 w-8 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-600">Connexion réussie !</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirection vers votre tableau de bord...
                </p>
                {showManualRedirect && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      La redirection automatique semble prendre du temps.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/dashboard'}
                      size="sm"
                      variant="outline"
                    >
                      Aller au tableau de bord
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="h-8 w-8 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-600">Erreur de connexion</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error || 'Une erreur est survenue lors de la connexion avec Google.'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Redirection vers la page de connexion...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 