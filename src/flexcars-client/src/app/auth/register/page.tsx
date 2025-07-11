"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { GoogleOAuthButton } from '@/components/google-oauth-button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

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
    setIsLoading(true);
    setError('');

    try {
      // Validation du mot de passe
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Inscription via l'API
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Redirection vers la page de vérification d'email
      router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        setError(error.message as string);
      } else {
        setError('Erreur lors de l\'inscription');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">FlexCars</span>
          </div>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>
            Créez votre compte pour accéder à nos véhicules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
              <div className="text-xs text-gray-500">
                Le mot de passe doit contenir au moins 12 caractères avec majuscules, minuscules, chiffres et caractères spéciaux.
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Création...' : 'Créer mon compte'}
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
            text="S'inscrire avec Google"
            disabled={isLoading}
          />
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Déjà un compte ?{' '}
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-primary"
                onClick={() => router.push('/auth/login')}
              >
                Se connecter
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 