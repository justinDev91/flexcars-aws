"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, RefreshCw, ArrowLeft } from "lucide-react";
import { authApi } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleResendEmail = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Adresse email manquante' });
      return;
    }

    setIsResending(true);
    setMessage(null);

    try {
      // Pour renvoyer l'email, on peut utiliser le endpoint forgot-password
      // ou implémenter un endpoint spécifique de renvoi de confirmation
      await authApi.forgotPassword(email);
      setMessage({ type: 'success', text: 'Email de confirmation renvoyé avec succès' });
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du renvoi de l&apos;email' });
    } finally {
      setIsResending(false);
    }
  };

  const handleOpenMailDev = () => {
    window.open('http://localhost:1080', '_blank');
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const handleBackToRegister = () => {
    router.push('/auth/register');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-100 p-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Vérifiez votre email</CardTitle>
          <CardDescription>
            Un email de confirmation a été envoyé
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              {email ? (
                <>Un email de confirmation a été envoyé à <strong>{email}</strong>.</>
              ) : (
                <>Un email de confirmation a été envoyé à votre adresse.</>
              )}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Instructions :</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside text-left">
                <li>Vérifiez votre boîte de réception</li>
                <li>Cliquez sur le lien de confirmation dans l&apos;email</li>
                <li>Vous serez redirigé vers la page de connexion</li>
                <li>Connectez-vous avec vos identifiants</li>
              </ol>
            </div>

            {/* Lien MailDev pour développement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">💻 Mode Développement</h3>
              <p className="text-sm text-yellow-800 mb-3">
                En développement, consultez MailDev pour voir les emails :
              </p>
              <Button 
                onClick={handleOpenMailDev}
                variant="outline"
                size="sm"
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir MailDev (localhost:1080)
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleResendEmail} variant="outline" className="w-full" disabled={isResending}>
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Renvoi en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renvoyer l&apos;email
                </>
              )}
            </Button>

            <Button onClick={handleBackToLogin} className="w-full">
              Aller à la connexion
            </Button>

            <Button onClick={handleBackToRegister} variant="ghost" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l&apos;inscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
} 