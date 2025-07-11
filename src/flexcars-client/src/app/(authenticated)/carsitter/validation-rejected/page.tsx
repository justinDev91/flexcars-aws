"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ValidationRejectedPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <XCircle className="h-20 w-20 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-700">
              Retour rejeté
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Le retour de véhicule a été rejeté.
            </p>
            <p className="text-sm text-muted-foreground">
              Le client a été notifié du rejet. Un membre de notre équipe
              prendra contact avec lui pour résoudre la situation.
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-orange-800">
                <strong>Important :</strong> Si vous avez des questions ou des préoccupations,
                n'hésitez pas à contacter notre support.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center pt-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button asChild>
                <Link href="tel:+33123456789">
                  <Phone className="mr-2 h-4 w-4" />
                  Contacter le support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 