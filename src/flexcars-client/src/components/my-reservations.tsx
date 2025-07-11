"use client";

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Search,
  Car,
  Euro,
  CheckCircle,
  Loader2,
  XCircle,
  Timer,
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { 
  Reservation, 
  ReservationStatus, 
  Location
} from '@/types/reservation';
import { Vehicle } from '@/types/vehicle';
import { reservationApi, vehicleApi } from '@/lib/api';
import { cn } from '@/lib/utils';

import { RefundConfirmationDialog } from './refund-confirmation-dialog';
import { DropoffModal } from './dropoff-modal';

interface MyReservationsProps {
  className?: string;
}

export function MyReservations({ className }: MyReservationsProps) {
  const { user } = useAuth();
  
  // États principaux
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États de l'interface
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showDropoffModal, setShowDropoffModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
  const [reservationToRefund, setReservationToRefund] = useState<Reservation | null>(null);
  const [reservationToDropoff, setReservationToDropoff] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Note: États de paiement supprimés - paiement obligatoire lors de la réservation

  const loadMyReservations = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [reservationsResponse, vehiclesResponse] = await Promise.all([
        reservationApi.getReservationsByCustomer(user.id),
        vehicleApi.getVehicles({ page: 1, limit: 1000 })
      ]);
      
      const reservationsData = reservationsResponse.data || [];
      console.log('📊 Réservations chargées:', reservationsData.map(r => ({
        id: r.id.slice(-8),
        status: r.status,
        totalPrice: r.totalPrice,
        invoicesCount: r.invoices?.length || 0,
        hasInvoices: !!r.invoices?.length
      })));
      
      setReservations(reservationsData);
      setVehicles(vehiclesResponse.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
      setError('Impossible de charger vos réservations');
      toast.error('Erreur lors du chargement de vos réservations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMyReservations();
  }, [loadMyReservations]);

  // Recharger les réservations quand on revient sur la page (ex: après un paiement)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Page focus détectée, rechargement des réservations...');
      loadMyReservations();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible, rechargement des réservations...');
        loadMyReservations();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadMyReservations]);

  const filteredReservations = reservations.filter(reservation => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
    const vehicleText = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.plateNumber}` : '';
    
    return vehicleText.toLowerCase().includes(searchLower) || 
           reservation.id.toLowerCase().includes(searchLower);
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => 
    new Date(b.startDatetime).getTime() - new Date(a.startDatetime).getTime()
  );

  const handleCancelReservation = useCallback(async (reservationId: string) => {
    setIsCancelling(true);
    try {
      await reservationApi.updateReservation(reservationId, {
        status: ReservationStatus.CANCELLED
      });
      
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationId 
            ? { ...r, status: ReservationStatus.CANCELLED }
            : r
        )
      );
      
      setShowCancelDialog(false);
      setShowRefundDialog(false);
      setReservationToCancel(null);
      setReservationToRefund(null);
      toast.success('Réservation annulée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error('Erreur lors de l\'annulation de la réservation');
    } finally {
      setIsCancelling(false);
    }
  }, []);

  const handleCancelClick = useCallback((reservation: Reservation) => {
    console.log('🚨 Cancel clicked for reservation:', {
      id: reservation.id.slice(-8),
      status: reservation.status,
      totalPrice: reservation.totalPrice,
      invoices: reservation.invoices?.length || 0
    });
    
    // Vérifier si la réservation est payée (statut CONFIRMED)
    if (reservation.status === ReservationStatus.CONFIRMED && reservation.totalPrice && reservation.totalPrice > 0) {
      console.log('💰 Réservation payée -> modal de remboursement');
      // Réservation payée -> afficher dialog de remboursement
      setReservationToRefund(reservation);
      setShowRefundDialog(true);
    } else {
      console.log('📋 Réservation non payée -> modal d\'annulation simple');
      // Réservation non payée -> afficher dialog d'annulation simple
      setReservationToCancel(reservation.id);
      setShowCancelDialog(true);
    }
  }, []);



  const handleRefundConfirm = useCallback(async () => {
    if (!reservationToRefund) {
      toast.error('Aucune réservation sélectionnée');
      return;
    }

    console.log('💳 Début remboursement pour réservation:', reservationToRefund.id.slice(-8));

    setIsCancelling(true);
    try {
      // Utiliser l'API de cancellation qui gère automatiquement les remboursements
      await reservationApi.updateReservation(reservationToRefund.id, {
        status: ReservationStatus.CANCELLED
      });

      console.log('✅ Réservation annulée avec remboursement automatique');

      // Recharger les réservations pour voir les changements
      await loadMyReservations();
      
      setShowRefundDialog(false);
      setReservationToRefund(null);
      toast.success('Réservation annulée et remboursement effectué avec succès ! Vous recevrez un email de confirmation.');
    } catch (error) {
      console.error('❌ Erreur lors du remboursement:', error);
      toast.error('Erreur lors du remboursement. Veuillez réessayer.');
    } finally {
      setIsCancelling(false);
    }
  }, [reservationToRefund, loadMyReservations]);

  // Fonction de diagnostic et correction des problèmes de synchronisation
  const fixPaymentSync = useCallback(async (reservation: Reservation) => {
    if (!reservation.invoices?.length) {
      toast.error('Aucune facture trouvée pour cette réservation');
      return;
    }

    const mainInvoice = reservation.invoices.find(inv => 
      !inv.invoiceType || inv.invoiceType === 'MAIN' || inv.invoiceType === 'BOOKING'
    ) || reservation.invoices[0];

    console.log('🔧 Diagnostic et correction pour la facture:', mainInvoice.id.slice(-8));
    
    try {
      // Diagnostic
      const diagResponse = await fetch(`/api/payments/debug/payment-sync/${mainInvoice.id}`);
      const diagnosis = await diagResponse.json();
      
      console.log('📊 Diagnostic:', diagnosis);
      
      if (diagnosis.error) {
        toast.error(`Erreur diagnostic: ${diagnosis.error}`);
        return;
      }

      // Vérifier si une correction est nécessaire
      const needsFix = diagnosis.diagnosis?.invoiceNeedsFix || 
                      diagnosis.diagnosis?.reservationNeedsFix || 
                      diagnosis.diagnosis?.vehicleNeedsFix;

      if (needsFix) {
        console.log('⚠️ Correction nécessaire, application...');
        
        // Appliquer la correction
        const fixResponse = await fetch(`/api/payments/debug/fix-payment-sync/${mainInvoice.id}`, {
          method: 'POST'
        });
        const fixResult = await fixResponse.json();
        
        if (fixResult.success) {
          console.log('✅ Corrections appliquées:', fixResult.fixes);
          toast.success(`Synchronisation corrigée: ${fixResult.fixes.join(', ')}`);
          
          // Recharger les réservations
          await loadMyReservations();
        } else {
          toast.error(`Erreur correction: ${fixResult.error}`);
        }
      } else {
        toast.info('Aucune correction nécessaire');
      }
      
    } catch (error) {
      console.error('❌ Erreur diagnostic/correction:', error);
      toast.error('Erreur lors du diagnostic de synchronisation');
    }
  }, [loadMyReservations]);

  // Note: Fonctions de paiement supprimées - paiement obligatoire lors de la réservation

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReservationStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case ReservationStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ReservationStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'En attente';
      case ReservationStatus.CONFIRMED:
        return 'Confirmée';
      case ReservationStatus.CANCELLED:
        return 'Annulée';
      case ReservationStatus.COMPLETED:
        return 'Terminée';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case ReservationStatus.CONFIRMED:
        return <CheckCircle className="h-4 w-4" />;
      case ReservationStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      case ReservationStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Timer className="h-4 w-4" />;
    }
  };

  const getLocationLabel = (location: Location) => {
    switch (location) {
      case Location.PARIS_11:
        return 'Paris 11e';
      case Location.PARIS_19:
        return 'Paris 19e';
      case Location.ISSY_LES_MOULINEAUX:
        return 'Issy-les-Moulineaux';
      case Location.BOULOGNE:
        return 'Boulogne';
      case Location.SAINT_DENIS:
        return 'Saint-Denis';
      default:
        return location;
    }
  };

  const canCancelReservation = (reservation: Reservation) => {
    return reservation.status === ReservationStatus.PENDING || 
           reservation.status === ReservationStatus.CONFIRMED;
  };

  // Note: Paiement maintenant obligatoire lors de la réservation
  // Le bouton "Payer maintenant" a été supprimé car tous les paiements
  // doivent être effectués lors de la création de réservation

  const canDropoffVehicle = (reservation: Reservation) => {
    console.log(`🚗 Dropoff check for ${reservation.id}: status=${reservation.status}, canDropoff=${reservation.status === ReservationStatus.CONFIRMED}`);
    return reservation.status === ReservationStatus.CONFIRMED;
  };

  const handleDropoffClick = (reservation: Reservation) => {
    setReservationToDropoff(reservation);
    setShowDropoffModal(true);
  };

  const handleDropoffSuccess = () => {
    toast.success('Retour de véhicule traité avec succès !');
    setShowDropoffModal(false);
    setReservationToDropoff(null);
    loadMyReservations(); // Recharger les réservations
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos réservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => loadMyReservations()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-6", className)}>
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes Réservations</h1>
            <p className="text-gray-600">
              {sortedReservations.length} réservation{sortedReservations.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadMyReservations()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                console.log('🔍 Debug - Réservations actuelles:');
                reservations.forEach(r => {
                  console.log(`  • ${r.id.slice(-8)}: ${r.status} - ${r.totalPrice}€ - Factures: ${r.invoices?.length || 0}`);
                  console.log(`    ├─ canDropoff: ${r.status === ReservationStatus.CONFIRMED}`);
                  console.log(`    ├─ canCancel: ${r.status === ReservationStatus.PENDING || r.status === ReservationStatus.CONFIRMED}`);
                  if (r.invoices?.length) {
                    r.invoices.forEach(inv => {
                      console.log(`    └─ Facture ${inv.id.slice(-8)}: ${inv.status} - ${inv.amount}€ - Type: ${inv.invoiceType || 'N/A'}`);
                    });
                  }
                });
              }}
            >
              Debug
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="max-w-md">
          <Label htmlFor="search">Rechercher une réservation</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="search"
              placeholder="Rechercher par véhicule ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des réservations */}
        {sortedReservations.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune réservation trouvée</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Aucune réservation ne correspond à votre recherche.' : 'Vous n\'avez pas encore de réservations.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedReservations.map((reservation) => {
              const vehicle = vehicles.find(v => v.id === reservation.vehicleId);
              const startDate = new Date(reservation.startDatetime);
              const endDate = new Date(reservation.endDatetime);
              
              return (
                <Card key={reservation.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule inconnu'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vehicle?.plateNumber} • ID: {reservation.id.slice(-8)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(reservation.status)}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">{getStatusLabel(reservation.status)}</span>
                        </Badge>
                        {/* Debug info */}
                        <span className="text-xs text-gray-400 font-mono">
                          [{reservation.status}]
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Début:</span>
                          <span className="ml-1">{format(startDate, 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Fin:</span>
                          <span className="ml-1">{format(endDate, 'dd MMM yyyy à HH:mm', { locale: fr })}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Récupération:</span>
                          <span className="ml-1">{getLocationLabel(reservation.pickupLocation)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Retour:</span>
                          <span className="ml-1">{getLocationLabel(reservation.dropoffLocation)}</span>
                        </div>
                      </div>
                    </div>

                    {/* DEBUG: totalPrice = {reservation.totalPrice} */}
                    {reservation.totalPrice != null && reservation.totalPrice > 0 ? (
                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-4">
                        <span className="text-sm font-medium">Prix total TTC:</span>
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-1 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {reservation.totalPrice.toFixed(2)} € TTC
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          (dont {(reservation.totalPrice * 0.2 / 1.2).toFixed(2)}€ de TVA)
                        </div>
                      </div>
                    ) : null}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>



                      {canDropoffVehicle(reservation) && (
                        <Button
                          size="sm"
                          onClick={() => handleDropoffClick(reservation)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Car className="h-4 w-4 mr-2" />
                          Rendre le véhicule
                        </Button>
                      )}

                      {canCancelReservation(reservation) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(reservation)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      )}

                      {/* Bouton de diagnostic pour les réservations avec problèmes de sync */}
                      {reservation.status === ReservationStatus.PENDING && reservation.totalPrice && reservation.totalPrice > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fixPaymentSync(reservation)}
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Synchroniser
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs existants... */}
      {/* Modal de détails */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              {/* Contenu des détails de la réservation */}
              <p>Détails complets de la réservation {selectedReservation.id}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l&apos;annulation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reservationToCancel && handleCancelReservation(reservationToCancel)}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Annulation...
                </>
              ) : (
                "Confirmer l&apos;annulation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Nouveau dialog de remboursement */}
      <RefundConfirmationDialog
        isOpen={showRefundDialog}
        onClose={() => setShowRefundDialog(false)}
        onConfirm={handleRefundConfirm}
        refundAmount={reservationToRefund?.totalPrice || 0}
        reservationId={reservationToRefund?.id || ''}
        isProcessing={isCancelling}
      />



      {/* Modal de dropoff */}
      {reservationToDropoff && (
        <DropoffModal
          reservation={reservationToDropoff}
          isOpen={showDropoffModal}
          onClose={() => setShowDropoffModal(false)}
          onSuccess={handleDropoffSuccess}
        />
      )}
    </>
  );
} 