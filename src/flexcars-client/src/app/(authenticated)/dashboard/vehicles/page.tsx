"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Car, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  LogIn, 
  Grid3X3, 
  List, 
  Table, 
  SlidersHorizontal, 
  Eye, 
  X,
  Filter,
  Calendar,
  Gauge
} from "lucide-react";
import { Vehicle, FuelType, VehicleStatus, VehicleFilters } from "@/types/vehicle";
import { vehicleApi } from "@/lib/api";
import { EnhancedVehicleCard } from "@/components/enhanced-vehicle-card";
import { VehicleDetailsModal } from "@/components/vehicle-details-modal";
import { useAuth } from "@/context/auth-context";

type ViewMode = 'grid' | 'list' | 'table';
type SortOption = 'name' | 'year' | 'mileage' | 'brand' | 'fuel' | 'status';

// Types d'erreur pour TypeScript
interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

interface BasicError {
  message: string;
}

// Type guards pour vérifier le type d'erreur
const isApiError = (err: unknown): err is ApiError => {
  return typeof err === 'object' && err !== null && 'statusCode' in err;
};

const isBasicError = (err: unknown): err is BasicError => {
  return typeof err === 'object' && err !== null && 'message' in err;
};

export default function VehicleCatalogPage() {
  const { isAuthenticated, logout, user } = useAuth();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // État pour le modal de détails
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // États séparés pour les sliders - valeurs temporaires vs appliquées
  const [tempYearRange, setTempYearRange] = useState<[number, number]>([2000, 2025]);
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2025]);
  const [tempMileageRange, setTempMileageRange] = useState<[number, number]>([0, 300000]);
  const [mileageRange, setMileageRange] = useState<[number, number]>([0, 300000]);
  
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const ITEMS_PER_PAGE = 12;

  // Fonction pour appliquer les filtres côté client
  const applyClientSideFilters = useCallback((vehicles: Vehicle[], filters: VehicleFilters, searchQuery: string): Vehicle[] => {
    let filtered = [...vehicles];
    
    // Filtre par type de carburant
    if (filters.fuelType) {
      filtered = filtered.filter(v => v.fuelType === filters.fuelType);
    }
    
    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(v => v.status === filters.status);
    }
    
    // Filtre par disponibilité uniquement
    if (showOnlyAvailable) {
      filtered = filtered.filter(v => v.status === VehicleStatus.AVAILABLE);
    }
    
    // Filtre par année (utilise les valeurs appliquées, pas temporaires)
    // Seulement si les valeurs par défaut ont été modifiées
    if (yearRange[0] !== 2000 || yearRange[1] !== 2025) {
      filtered = filtered.filter(v => 
        v.year && v.year >= yearRange[0] && v.year <= yearRange[1]
      );
    }
    
    // Filtre par kilométrage (utilise les valeurs appliquées, pas temporaires)
    // Seulement si les valeurs par défaut ont été modifiées
    if (mileageRange[0] !== 0 || mileageRange[1] !== 300000) {
      filtered = filtered.filter(v => 
        v.currentMileage !== null && v.currentMileage !== undefined && 
        v.currentMileage >= mileageRange[0] && v.currentMileage <= mileageRange[1]
      );
    }
    
    // Filtre par marque
    if (filters.brand) {
      filtered = filtered.filter(v => v.brand && v.brand.toLowerCase().includes(filters.brand!.toLowerCase()));
    }
    
    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        (v.brand && v.brand.toLowerCase().includes(query)) ||
        (v.model && v.model.toLowerCase().includes(query)) ||
        (v.plateNumber && v.plateNumber.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [yearRange, mileageRange, showOnlyAvailable]);

  // Fonction pour trier les véhicules
  const sortVehicles = useCallback((vehicles: Vehicle[]): Vehicle[] => {
    return [...vehicles].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.brand} ${a.model}`.toLowerCase();
          bValue = `${b.brand} ${b.model}`.toLowerCase();
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'mileage':
          aValue = a.currentMileage || 0;
          bValue = b.currentMileage || 0;
          break;
        case 'brand':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        case 'fuel':
          aValue = a.fuelType || '';
          bValue = b.fuelType || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [sortBy, sortDirection]);

  // Charger les véhicules (seulement les données brutes)
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        setError('Vous devez être connecté pour voir les véhicules');
        return;
      }
      
      const response = await vehicleApi.getVehicles({
        page: 1,
        limit: 1000,
      });
      
      setAllVehicles(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
      
      // Meilleur debugging de l'erreur
      if (isApiError(err)) {
        if (err.statusCode === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          // Déconnecter l'utilisateur automatiquement
          logout();
        } else {
          setError(`Erreur ${err.statusCode}: ${err.message || 'Erreur inconnue'}`);
        }
      } else if (isBasicError(err)) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError('Erreur lors du chargement des véhicules - Vérifiez que le serveur backend est démarré');
      }
      
      setAllVehicles([]);
      setFilteredVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, logout]); // Dépendances nécessaires pour l'authentification

  // Effet pour charger les véhicules au montage
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Reappliquer les filtres quand ils changent
  useEffect(() => {
    if (allVehicles.length > 0) {
      const filtered = applyClientSideFilters(allVehicles, filters, searchTerm);
      const sorted = sortVehicles(filtered);
      setFilteredVehicles(sorted);
      setCurrentPage(1);
      
      // Mettre à jour le nombre total de pages
      const totalItems = sorted.length;
      setTotalPages(Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)));
    }
  }, [allVehicles, filters, searchTerm, applyClientSideFilters, sortVehicles]);

  // Gestion des filtres
  const handleFilterChange = (key: keyof VehicleFilters, value: string) => {
    const newFilters = { ...filters };
    if (value === 'all' || value === '') {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, string>)[key] = value;
    }
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setTempYearRange([2000, 2025]);
    setYearRange([2000, 2025]);
    setTempMileageRange([0, 300000]);
    setMileageRange([0, 300000]);
    setShowOnlyAvailable(true);
    setCurrentPage(1);
  };

  // Gestionnaires pour les sliders avec optimisation UX
  const handleYearRangeChange = (value: number[]) => {
    setTempYearRange(value as [number, number]);
  };

  const handleYearRangeCommit = (value: number[]) => {
    setYearRange(value as [number, number]);
  };

  const handleMileageRangeChange = (value: number[]) => {
    setTempMileageRange(value as [number, number]);
  };

  const handleMileageRangeCommit = (value: number[]) => {
    setMileageRange(value as [number, number]);
  };

  // Gestion des actions véhicule
  const handleReserve = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  // Pagination
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const availableVehicles = filteredVehicles.filter(v => v.status === VehicleStatus.AVAILABLE);

  // Compter les filtres actifs
  const activeFiltersCount = Object.keys(filters).length + 
    (searchTerm.trim() !== '' ? 1 : 0) + 
    (showOnlyAvailable ? 1 : 0) +
    (yearRange[0] !== 2000 || yearRange[1] !== 2025 ? 1 : 0) +
    (mileageRange[0] !== 0 || mileageRange[1] !== 300000 ? 1 : 0);

  // Vérifier l'état d'authentification
  if (!isAuthenticated) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Accès restreint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Vous devez être connecté pour accéder au catalogue des véhicules.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'} size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Chargement des véhicules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2">
            <Button onClick={loadVehicles} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
            {error.includes('connecté') && (
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/auth/login'}>
                <LogIn className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogue des Véhicules</h1>
          <p className="text-muted-foreground">
            {filteredVehicles.length} véhicule{filteredVehicles.length !== 1 ? 's' : ''} 
            {filteredVehicles.length !== allVehicles.length && ` sur ${allVehicles.length}`}
            {availableVehicles.length > 0 && (
              <span className="text-green-600 ml-2">
                • {availableVehicles.length} disponible{availableVehicles.length !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et tri */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par marque, modèle, ou plaque..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nom</SelectItem>
            <SelectItem value="year">Année</SelectItem>
            <SelectItem value="mileage">Kilométrage</SelectItem>
            <SelectItem value="brand">Marque</SelectItem>
            <SelectItem value="fuel">Carburant</SelectItem>
            <SelectItem value="status">Statut</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Filtres Avancés</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">
                    {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Ligne 1: Filtres rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Type de carburant</Label>
                <Select value={filters.fuelType || 'all'} onValueChange={(value) => handleFilterChange('fuelType', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value={FuelType.PETROL}>🔥 Essence</SelectItem>
                    <SelectItem value={FuelType.DIESEL}>🛢️ Diesel</SelectItem>
                    <SelectItem value={FuelType.ELECTRIC}>⚡ Électrique</SelectItem>
                    <SelectItem value={FuelType.HYBRID}>🔋 Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Statut</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value={VehicleStatus.AVAILABLE}>✅ Disponible</SelectItem>
                    <SelectItem value={VehicleStatus.RESERVED}>🟡 Réservé</SelectItem>
                    <SelectItem value={VehicleStatus.RENTED}>🔵 Loué</SelectItem>
                    <SelectItem value={VehicleStatus.MAINTENANCE}>🔧 Maintenance</SelectItem>
                    <SelectItem value={VehicleStatus.INCIDENT}>🚨 Incident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Marque</Label>
                <Input
                  placeholder="Ex: BMW, Audi..."
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <Switch
                  id="available-only"
                  checked={showOnlyAvailable}
                  onCheckedChange={setShowOnlyAvailable}
                />
                <Label htmlFor="available-only" className="text-sm font-medium">
                  Uniquement disponibles
                </Label>
              </div>
            </div>

            {/* Ligne 2: Sliders avec design amélioré */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>Année de fabrication</span>
                  </Label>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="bg-blue-50 px-2 py-1 rounded font-mono">
                      {tempYearRange[0]}
                    </span>
                    <span>→</span>
                    <span className="bg-blue-50 px-2 py-1 rounded font-mono">
                      {tempYearRange[1]}
                    </span>
                  </div>
                </div>
                <div className="px-2">
                  <Slider
                    value={tempYearRange}
                    onValueChange={handleYearRangeChange}
                    onValueCommit={handleYearRangeCommit}
                    min={2000}
                    max={2024}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2000</span>
                    <span>2024</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-green-500" />
                    <span>Kilométrage</span>
                  </Label>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="bg-green-50 px-2 py-1 rounded font-mono">
                      {tempMileageRange[0].toLocaleString()} km
                    </span>
                    <span>→</span>
                    <span className="bg-green-50 px-2 py-1 rounded font-mono">
                      {tempMileageRange[1].toLocaleString()} km
                    </span>
                  </div>
                </div>
                <div className="px-2">
                  <Slider
                    value={tempMileageRange}
                    onValueChange={handleMileageRangeChange}
                    onValueCommit={handleMileageRangeCommit}
                    min={0}
                    max={300000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 km</span>
                    <span>300 000 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé des filtres actifs */}
            {activeFiltersCount > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{filteredVehicles.length}</strong> véhicule{filteredVehicles.length !== 1 ? 's' : ''} 
                  correspond{filteredVehicles.length === 1 ? '' : 'ent'} à vos critères de recherche
                  {activeFiltersCount > 0 && ` (${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} actif${activeFiltersCount > 1 ? 's' : ''})`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contenu principal */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedVehicles.map((vehicle) => (
              <EnhancedVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onReserve={handleReserve}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {/* En-tête de colonne pour le mode liste */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-600">
                  <div className="col-span-1">
                    <span>Image</span>
                  </div>
                  <div className="col-span-3">
                    <span>Véhicule</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span>Statut</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span>Carburant</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span>Kilométrage</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span>GPS</span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span>Actions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des véhicules */}
            {paginatedVehicles.map((vehicle) => (
              <EnhancedVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onReserve={handleReserve}
                onViewDetails={handleViewDetails}
                variant="list"
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Vue Tableau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left">Véhicule</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Année</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Carburant</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Kilométrage</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Statut</th>
                      <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4" />
                            <span>{vehicle.brand} {vehicle.model}</span>
                          </div>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">{vehicle.year}</td>
                        <td className="border border-gray-200 px-4 py-2">{vehicle.fuelType}</td>
                        <td className="border border-gray-200 px-4 py-2">
                          {vehicle.currentMileage?.toLocaleString()} km
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <Badge variant={vehicle.status === VehicleStatus.AVAILABLE ? 'default' : 'secondary'}>
                            {vehicle.status}
                          </Badge>
                        </td>
                        <td className="border border-gray-200 px-4 py-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(vehicle)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleReserve(vehicle)}
                              disabled={vehicle.status !== VehicleStatus.AVAILABLE}
                            >
                              Réserver
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}

      {/* État vide */}
      {filteredVehicles.length === 0 && !loading && (
        <Card className="text-center py-16">
          <CardContent>
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun véhicule ne correspond à vos critères de recherche.
            </p>
            <Button onClick={resetFilters} variant="outline">
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de détails véhicule */}
      {selectedVehicle && user && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          user={user}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
} 