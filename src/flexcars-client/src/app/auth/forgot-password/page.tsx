"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ type: 'error', text: 'Veuillez saisir votre adresse email' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await authApi.forgotPassword(email);
      setMessage({ type: 'success', text: response.data.message || 'Email de réinitialisation envoyé' });
      setEmailSent(true);
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        setMessage({ type: 'error', text: error.message as string });
             } else {
         setMessage({ type: 'error', text: 'Erreur lors de l&apos;envoi de l&apos;email' });
       }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setMessage(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
          <CardDescription className="text-center">
            {emailSent 
              ? 'Email envoyé avec succès'
              : 'Saisissez votre email pour recevoir un lien de réinitialisation'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer le lien
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Un email de réinitialisation a été envoyé à <strong>{email}</strong>. 
                Vérifiez votre boîte de réception et suivez les instructions.
              </p>
              <div className="space-y-2">
                <Button onClick={handleResendEmail} variant="outline" className="w-full">
                  Renvoyer l&apos;email
                </Button>
                <Button onClick={handleBackToLogin} className="w-full">
                  Retour à la connexion
                </Button>
              </div>
            </div>
          )}

          {!emailSent && (
            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 