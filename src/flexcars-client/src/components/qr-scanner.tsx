"use client";

import { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Car,
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';

import { reservationApi } from '@/lib/api';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Vehicle } from '@/types/vehicle';

interface QRScannerProps {
  onClose: () => void;
  onSuccess?: (data: { reservation: Reservation; vehicle: Vehicle }) => void;
}

interface ScanResult {
  reservation: Reservation;
  vehicle: Vehicle;
}

export function QRCodeScanner({ onClose, onSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (result: string) => {
    if (!result || loading) return;

    try {
      setLoading(true);
      setError(null);
      setIsScanning(false);

      // Le QR code contient l'identifiant de la réservation
      const response = await reservationApi.scanReservation(result);
      setScanResult(response.data);
      
      toast.success('QR Code scanné avec succès !');
      onSuccess?.(response.data);
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setError('QR Code invalide ou réservation introuvable');
      toast.error('QR Code invalide ou réservation introuvable');
      setIsScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: Error) => {
    console.error('Erreur de caméra:', error);
    setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    toast.error('Impossible d\'accéder à la caméra');
  };

  const resetScanner = () => {
    setIsScanning(true);
    setScanResult(null);
    setError(null);
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case ReservationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReservationStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case ReservationStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'Confirmée';
      case ReservationStatus.PENDING:
        return 'En attente';
      case ReservationStatus.CANCELLED:
        return 'Annulée';
      case ReservationStatus.COMPLETED:
        return 'Terminée';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Scanner QR Code */}
      {isScanning && !scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scanner le QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                {!error ? (
                  <QrScanner
                    onDecode={handleScan}
                    onError={handleError}
                    constraints={{
                      facingMode: 'environment'
                    }}
                    containerStyle={{
                      width: '100%',
                      height: '100%'
                    }}
                    videoStyle={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}
                
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p>Vérification en cours...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Positionnez le QR Code dans le cadre pour le scanner
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Assurez-vous d'avoir l'autorisation d'accès à la caméra</span>
                </div>
              </div>

              {error && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={resetScanner}>
                    Réessayer
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultat du scan */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Réservation trouvée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Informations de la réservation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Détails de la réservation</h3>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Période</p>
                      <p className="text-sm text-muted-foreground">
                        Du {new Date(scanResult.reservation.startDatetime).toLocaleDateString('fr-FR')} 
                        {' '}au {new Date(scanResult.reservation.endDatetime).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Lieux</p>
                      <p className="text-sm text-muted-foreground">
                        Départ: {scanResult.reservation.pickupLocation}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Retour: {scanResult.reservation.dropoffLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(scanResult.reservation.status)}>
                      {getStatusLabel(scanResult.reservation.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Véhicule</h3>
                  
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {scanResult.vehicle.brand} {scanResult.vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Plaque: {scanResult.vehicle.plateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Année:</span> {scanResult.vehicle.year}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Carburant:</span> {scanResult.vehicle.fuelType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Kilométrage:</span> {scanResult.vehicle.currentMileage?.toLocaleString()} km
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button onClick={resetScanner} variant="outline" className="flex-1">
                  Scanner un autre QR Code
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface QRScannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { reservation: Reservation; vehicle: Vehicle }) => void;
}

export function QRScannerDialog({ isOpen, onClose, onSuccess }: QRScannerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scanner QR Code
          </DialogTitle>
        </DialogHeader>
        <QRCodeScanner onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
} 