"use client";

import { Settings } from 'lucide-react';

export default function ParametresPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Configurez vos préférences
        </p>
      </div>

      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <div className="mx-auto max-w-md">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Paramètres à venir</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Les options de configuration seront disponibles prochainement.
          </p>
          <p className="text-xs text-muted-foreground">
            Notifications, préférences de langue, sécurité, etc.
          </p>
        </div>
      </div>
    </div>
  );
} 