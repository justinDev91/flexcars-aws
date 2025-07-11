"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function ValidationSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Validation réussie !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Le retour de véhicule a été validé avec succès.
            </p>
            <p className="text-sm text-muted-foreground">
              Le client a été notifié et sa réservation est maintenant terminée.
              Merci pour votre travail en tant que Car Sitter !
            </p>
            
            <div className="flex gap-4 justify-center pt-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 