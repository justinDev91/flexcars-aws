"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Download, 
  Eye, 
  Filter,
  Calendar,
  Euro,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { invoiceApi } from '@/lib/api';
import { useAuth } from '@/context/auth-context';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax?: number;
  total?: number;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'REFUNDED';
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  customerId: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  reservationId?: string;
  reservation?: {
    id: string;
    vehicle: {
      brand: string;
      model: string;
      plateNumber: string;
    };
  };
}

interface PaymentFilters {
  status: string;
  method: string;
  dateRange: string;
  search: string;
}

export default function HistoriquePage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    status: 'all',
    method: 'all',
    dateRange: 'all',
    search: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadInvoices = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await invoiceApi.getInvoices({ userId: user.id });
      
      // Les factures sont maintenant retournées avec toutes les relations par le backend
      setInvoices(response.data as Invoice[]);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      toast.error('Impossible de charger l\'historique des paiements');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'UNPAID':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'REFUNDED':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'UNPAID':
        return 'Non payé';
      case 'OVERDUE':
        return 'En retard';
      case 'REFUNDED':
        return 'Remboursé';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-amber-100 text-amber-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterInvoicesByDateRange = (invoice: Invoice, dateRange: string) => {
    // Utiliser paidAt si disponible, sinon utiliser issuedAt comme fallback
    const invoiceDate = new Date(invoice.paidAt || invoice.issuedAt);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return invoiceDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invoiceDate >= weekAgo;
      case 'month':
        return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
      case 'year':
        return invoiceDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filters.status !== 'all' && invoice.status !== filters.status) return false;
    if (!filterInvoicesByDateRange(invoice, filters.dateRange)) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesInvoiceNumber = invoice.invoiceNumber.toLowerCase().includes(searchLower);
      const matchesVehicle = invoice.reservation?.vehicle.brand.toLowerCase().includes(searchLower) ||
                            invoice.reservation?.vehicle.model.toLowerCase().includes(searchLower);
      const matchesCustomer = invoice.customer?.firstName.toLowerCase().includes(searchLower) ||
                             invoice.customer?.lastName.toLowerCase().includes(searchLower);
      
      if (!matchesInvoiceNumber && !matchesVehicle && !matchesCustomer) return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const downloadInvoice = async (invoice: Invoice) => {
    try {
      setDownloading(invoice.id);
      await invoiceApi.downloadInvoice(invoice.id);
      toast.success(`Facture ${invoice.invoiceNumber} téléchargée`);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Impossible de télécharger la facture');
    } finally {
      setDownloading(null);
    }
  };

  const viewDetails = async (invoice: Invoice) => {
    try {
      setViewing(invoice.id);
      await invoiceApi.viewInvoice(invoice.id);
      toast.success(`Facture ${invoice.invoiceNumber} ouverte dans une nouvelle fenêtre`);
    } catch (error) {
      console.error('Erreur lors de l\'affichage des détails:', error);
      toast.error('Impossible d\'afficher les détails de la facture');
    } finally {
      setViewing(null);
    }
  };

  // Les montants sont déjà TTC dans la base de données
  const totalPaid = filteredInvoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + (i.total ?? i.amount ?? 0), 0);

  const totalRefunded = filteredInvoices
    .filter(i => i.status === 'REFUNDED')
    .reduce((sum, i) => sum + (i.total ?? i.amount ?? 0), 0);

  const pendingCount = invoices.filter(i => i.status === 'UNPAID').length;
  const invoiceCount = invoices.length;

  if (loading) {
  return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
      <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Historique des paiements</h1>
          <p className="text-muted-foreground mt-2">
            Consultez toutes vos transactions et téléchargez vos factures
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <CreditCard className="h-4 w-4 mr-2" />
          {filteredInvoices.length} factures
        </Badge>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Euro className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total payé TTC</p>
                <p className="text-lg font-semibold">{totalPaid.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remboursements TTC</p>
                <p className="text-lg font-semibold">{totalRefunded.toFixed(2)}€</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-lg font-semibold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Factures</p>
                <p className="text-lg font-semibold">{invoiceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Numéro, véhicule..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PAID">Payé</SelectItem>
                  <SelectItem value="UNPAID">Non payé</SelectItem>
                  <SelectItem value="OVERDUE">En retard</SelectItem>
                  <SelectItem value="REFUNDED">Remboursé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ status: 'all', method: 'all', dateRange: 'all', search: '' })}
                className="w-full"
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des factures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Factures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Non payé'}
                            </span>
                            {invoice.paidAt && (
                              <span className="text-xs text-muted-foreground">
                                Payé le {new Date(invoice.paidAt).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{invoice.invoiceNumber}</span>
                      </TableCell>
                      <TableCell>
                        {invoice.reservation ? (
                          <div>
                            <p className="font-medium">
                              {invoice.reservation.vehicle.brand} {invoice.reservation.vehicle.model}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.reservation.vehicle.plateNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non spécifié</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold">
                            {(invoice.total ?? invoice.amount ?? 0).toFixed(2)}€ TTC
                          </span>
                          <p className="text-sm text-muted-foreground">
                            dont {((invoice.total ?? invoice.amount ?? 0) * 0.2 / 1.2).toFixed(2)}€ de TVA
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {getStatusLabel(invoice.status)}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => viewDetails(invoice)}
                            disabled={viewing === invoice.id}
                          >
                            {viewing === invoice.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => downloadInvoice(invoice)}
                            disabled={downloading === invoice.id}
                          >
                            {downloading === invoice.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-lg font-semibold">Aucune facture trouvée</p>
                        <p className="text-muted-foreground">
                          {filters.search || filters.status !== 'all' || filters.dateRange !== 'all'
                            ? 'Aucun résultat ne correspond à vos critères'
                            : 'Vous n\'avez aucune facture'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{' '}
                {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} sur{' '}
                {filteredInvoices.length} factures
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 