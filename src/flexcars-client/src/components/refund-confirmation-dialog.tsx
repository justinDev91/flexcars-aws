"use client";

import React, { useState } from 'react';
import { AlertTriangle, Euro, Clock, CreditCard, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface RefundConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  refundAmount: number;
  reservationId: string;
  isProcessing?: boolean;
}

export function RefundConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  refundAmount,
  reservationId,
  isProcessing = false,
}: RefundConfirmationDialogProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const handleConfirm = () => {
    if (hasReadTerms) {
      onConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmer l&apos;annulation et le remboursement
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d&apos;annuler une réservation payée. Un remboursement sera automatiquement traité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Montant du remboursement */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Montant à rembourser TTC</span>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                {formatAmount(refundAmount)}
              </Badge>
            </div>
            <div className="text-xs text-blue-700 mt-2">
              (dont {(refundAmount * 0.2 / 1.2).toFixed(2)}€ de TVA)
            </div>
          </div>

          {/* Détails de la réservation */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Détails de la réservation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Numéro de réservation</span>
                <span className="font-mono">#{reservationId.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant payé TTC</span>
                <span>{formatAmount(refundAmount)}</span>
              </div>
            </div>
          </div>

          {/* Informations sur le remboursement */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    <strong>Délai de traitement :</strong> 3-5 jours ouvrés
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">
                    <strong>Méthode :</strong> Remboursement sur la carte utilisée
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Conditions d'annulation */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">
              Conditions d&apos;annulation
            </h4>
            <div className="space-y-2 text-sm text-amber-800">
              <p>• L&apos;annulation est définitive et ne peut pas être annulée</p>
              <p>• Le remboursement sera traité automatiquement</p>
              <p>• Vous recevrez un email de confirmation</p>
              <p>• Le véhicule sera remis en disponibilité</p>
            </div>
          </div>

          {/* Checkbox de confirmation */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={hasReadTerms}
              onChange={(e) => setHasReadTerms(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              J&apos;ai lu et compris les conditions d&apos;annulation. Je confirme vouloir 
              annuler cette réservation et accepter le remboursement de {formatAmount(refundAmount)}.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Garder la réservation
          </Button>
          
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!hasReadTerms || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Confirmer l&apos;annulation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 