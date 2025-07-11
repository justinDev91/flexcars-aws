"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de confirmation manquant');
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await authApi.confirmEmail(token);
        setStatus('success');
        setMessage(response.data.message || 'Email confirmé avec succès !');
      } catch (error) {
        setStatus('error');
        if (error && typeof error === 'object' && 'message' in error) {
          setMessage(error.message as string);
        } else {
          setMessage('Erreur lors de la confirmation de l&apos;email');
        }
      }
    };

    confirmEmail();
  }, [token]);

  const handleLoginRedirect = () => {
    router.push('/auth/login');
  };

  const handleResendConfirmation = () => {
    // Rediriger vers la page de connexion où l'utilisateur peut demander un nouveau lien
    router.push('/auth/login?message=resend-confirmation');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Confirmation d&apos;email</CardTitle>
          <CardDescription>
            Vérification de votre adresse email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-sm text-gray-600">Confirmation en cours...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-center text-sm text-gray-600">{message}</p>
                <Button onClick={handleLoginRedirect} className="w-full">
                  Se connecter
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-center text-sm text-red-600">{message}</p>
                <div className="flex space-x-2">
                  <Button onClick={handleLoginRedirect} variant="outline" className="flex-1">
                    Retour à la connexion
                  </Button>
                  <Button onClick={handleResendConfirmation} className="flex-1">
                    Renvoyer le lien
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ConfirmEmailContent />
    </Suspense>
  );
} 