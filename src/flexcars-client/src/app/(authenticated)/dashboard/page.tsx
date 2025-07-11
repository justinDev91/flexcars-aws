"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Car, 
  Calendar, 
  CreditCard, 
  ArrowRight, 
  Clock,
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle,
  Euro,
  Activity,
  RefreshCw,
  Eye,
  Plus,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { vehicleApi, reservationApi, invoiceApi, documentApi } from '@/lib/api';
import { toast } from 'sonner';
import { ReservationStatus } from '@/types/reservation';
import { VehicleStatus } from '@/types/vehicle';

interface DashboardStats {
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  totalSpent: number;
  documentsUploaded: number;
  documentsVerified: number;
  pendingPayments: number;
  availableVehicles: number;
}

interface RecentActivity {
  id: string;
  type: 'reservation' | 'payment' | 'document';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'pending' | 'warning';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    activeReservations: 0,
    completedReservations: 0,
    totalSpent: 0,
    documentsUploaded: 0,
    documentsVerified: 0,
    pendingPayments: 0,
    availableVehicles: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);

      // Charger les données en parallèle
      const [reservationsRes, invoicesRes, documentsRes, vehiclesRes] = await Promise.all([
        reservationApi.getReservations({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        invoiceApi.getInvoices({ userId: user.id }).catch(() => ({ data: [] })),
        documentApi.getDocuments(user.id).catch(() => ({ data: [] })),
        vehicleApi.getVehicles({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
      ]);

      const reservations = (reservationsRes.data || []).filter(r => r.customerId === user.id);
      const invoices = invoicesRes.data || [];
      const documents = documentsRes.data || [];
      const vehicles = vehiclesRes.data || [];

      // Calculer les statistiques
      const activeReservations = reservations.filter(r => 
        r.status === ReservationStatus.PENDING || r.status === ReservationStatus.CONFIRMED
      ).length;

      const completedReservations = reservations.filter(r => 
        r.status === ReservationStatus.COMPLETED
      ).length;

      const totalSpent = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      const documentsVerified = documents.filter(d => d.verified === true).length;
      const pendingPayments = invoices.filter(i => i.status === 'UNPAID').length;
      const availableVehicles = vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length;

      setStats({
        totalReservations: reservations.length,
        activeReservations,
        completedReservations,
        totalSpent,
        documentsUploaded: documents.length,
        documentsVerified,
        pendingPayments,
        availableVehicles,
      });

      // Générer les activités récentes
      const activities: RecentActivity[] = [];

      // Ajouter les réservations récentes
      reservations.slice(0, 3).forEach(reservation => {
        activities.push({
          id: reservation.id,
          type: 'reservation',
          title: 'Nouvelle réservation',
          description: `Réservation ${reservation.status === ReservationStatus.COMPLETED ? 'terminée' : 'en cours'}`,
          time: typeof reservation.createdAt === 'string' ? reservation.createdAt : new Date().toISOString(),
          status: reservation.status === ReservationStatus.COMPLETED ? 'success' : 
                   reservation.status === ReservationStatus.CONFIRMED ? 'success' : 'pending'
        });
      });

      // Ajouter les paiements récents
      invoices.slice(0, 2).forEach(invoice => {
        activities.push({
          id: invoice.id,
          type: 'payment',
          title: `Facture ${invoice.invoiceNumber}`,
          description: `${invoice.amount?.toFixed(2)}€ - ${invoice.status === 'PAID' ? 'Payé' : 'En attente'}`,
          time: invoice.paidAt || invoice.issuedAt,
          status: invoice.status === 'PAID' ? 'success' : 'pending'
        });
      });

      // Ajouter les documents récents
      documents.slice(0, 2).forEach(document => {
        activities.push({
          id: document.id,
          type: 'document',
          title: 'Document uploadé',
          description: `${document.type === 'ID_CARD' ? 'Pièce d\'identité' : 'Permis de conduire'} ${document.verified ? 'vérifié' : 'en attente'}`,
          time: document.uploadedAt,
          status: document.verified ? 'success' : 'pending'
        });
      });

      // Trier par date et prendre les 5 plus récents
      setRecentActivity(
        activities
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5)
      );

    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      toast.error('Impossible de charger les données du dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'reservation':
        return Calendar;
      case 'payment':
        return CreditCard;
      case 'document':
        return FileText;
      default:
        return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'warning':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (time: string) => {
    const diff = Date.now() - new Date(time).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* En-tête skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Statistiques skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contenu skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const profileCompletionPercentage = Math.round(
    ((stats.documentsVerified / Math.max(stats.documentsUploaded, 2)) * 100)
  );

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Voici un aperçu de votre activité FlexCars
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => loadDashboardData()} 
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Réservations</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{stats.totalReservations}</p>
                  <Badge variant="secondary" className="text-xs">
                    {stats.activeReservations} actives
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total dépensé</p>
                <p className="text-2xl font-bold">{stats.totalSpent.toFixed(2)}€</p>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingPayments} paiements en attente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{stats.documentsVerified}</p>
                  <span className="text-sm text-muted-foreground">
                    / {stats.documentsUploaded} vérifiés
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-orange-100 rounded-full">
                <Car className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Véhicules disponibles</p>
                <p className="text-2xl font-bold">{stats.availableVehicles}</p>
                <p className="text-xs text-muted-foreground">
                  Prêts à réserver
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Actions rapides */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/vehicles">
              <Button variant="outline" className="w-full justify-start h-12">
                <Car className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Réserver un véhicule</div>
                  <div className="text-xs text-muted-foreground">{stats.availableVehicles} véhicules disponibles</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/dashboard/reservations">
              <Button variant="outline" className="w-full justify-start h-12">
                <Calendar className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Mes réservations</div>
                  <div className="text-xs text-muted-foreground">{stats.activeReservations} réservations actives</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/dashboard/profil">
              <Button variant="outline" className="w-full justify-start h-12">
                <FileText className="mr-3 h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Compléter mon profil</div>
                  <div className="text-xs text-muted-foreground">{profileCompletionPercentage}% complété</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Statut du profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Statut du profil
            </CardTitle>
            <CardDescription>
              Progression de la vérification de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Vérification des documents</span>
                <span className="text-sm text-muted-foreground">{profileCompletionPercentage}%</span>
              </div>
              <Progress value={profileCompletionPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${stats.documentsUploaded > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-sm">Documents uploadés</span>
                </div>
                <Badge variant={stats.documentsUploaded > 0 ? 'default' : 'secondary'} className="text-xs">
                  {stats.documentsUploaded}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${stats.documentsVerified > 0 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-sm">Documents vérifiés</span>
                </div>
                <Badge variant={stats.documentsVerified > 0 ? 'default' : 'secondary'} className="text-xs">
                  {stats.documentsVerified}
                </Badge>
              </div>
            </div>

            {stats.documentsUploaded < 2 && (
              <Link href="/dashboard/profil?tab=documents">
                <Button size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter des documents
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité récente
            </CardTitle>
            <CardDescription>
              Vos dernières actions sur FlexCars
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-full ${getActivityColor(activity.status)}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune activité récente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vue d'ensemble des réservations */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Aperçu des réservations
              </div>
              <Link href="/dashboard/reservations">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tout
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalReservations}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedReservations}</div>
                <div className="text-sm text-muted-foreground">Terminées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.activeReservations}</div>
                <div className="text-sm text-muted-foreground">En cours</div>
              </div>
            </div>
            
            {stats.totalReservations === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune réservation</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par réserver votre premier véhicule
                </p>
                <Link href="/dashboard/vehicles">
                  <Button>
                    <Car className="h-4 w-4 mr-2" />
                    Explorer les véhicules
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taux de complétion</span>
                  <span>{Math.round((stats.completedReservations / stats.totalReservations) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.completedReservations / stats.totalReservations) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paiements et facturation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Facturation
              </div>
              <Link href="/dashboard/historique">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Historique
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalSpent.toFixed(2)}€</p>
                <p className="text-sm text-muted-foreground">Total dépensé</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-amber-600">{stats.pendingPayments}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>

            {stats.pendingPayments > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {stats.pendingPayments} paiement{stats.pendingPayments > 1 ? 's' : ''} en attente
                  </span>
                </div>
                <Link href="/dashboard/historique">
                  <Button size="sm" variant="outline" className="mt-2 w-full">
                    Voir les factures
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 