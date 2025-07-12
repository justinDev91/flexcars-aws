"use client";

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Role } from '@/types';
import { CarSitterValidation } from '@/components/carsitter-validation';

interface PageProps {
  params: Promise<{
    dropoffRequestId: string;
  }>;
}

export default function CarSitterValidationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Vérification de l'authentification et du rôle
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Authentification requise');
      router.push('/auth/login');
      return;
    }

    if (!isLoading && isAuthenticated && user?.role !== Role.CARSITTER) {
      toast.error('Accès refusé - Vous n\'êtes pas un car sitter');
      router.push('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Écran de chargement pour l'authentification
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Vérification de l'authentification...</span>
        </div>
      </div>
    );
  }

  // Redirection en cours si pas authentifié ou mauvais rôle
  if (!isAuthenticated || user?.role !== Role.CARSITTER) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <CarSitterValidation 
        dropoffRequestId={resolvedParams.dropoffRequestId}
        onValidationComplete={() => {
          // Rediriger vers le dashboard car sitter après validation
          router.push('/carsitter/dashboard');
        }}
      />
    </div>
  );
} 