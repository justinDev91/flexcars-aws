"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Bell, LogOut, User, Menu, Calendar, CreditCard, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  // Navigation items
  const getNavigationItems = () => {
    return [
      { 
        id: 'accueil', 
        label: 'Accueil', 
        href: '/dashboard',
        icon: Home
      },
      { 
        id: 'vehicules', 
        label: 'Catalogue de véhicules', 
        href: '/dashboard/vehicles',
        icon: Car
      },
      { 
        id: 'reservations', 
        label: 'Mes réservations', 
        href: '/dashboard/reservations',
        icon: Calendar
      },
      { 
        id: 'historique', 
        label: 'Historique des paiements', 
        href: '/dashboard/historique',
        icon: CreditCard
      },
      { 
        id: 'profil', 
        label: 'Mon profil', 
        href: '/dashboard/profil',
        icon: User
      },
    ];
  };

  const navigationItems = getNavigationItems();

  const getActiveItem = () => {
    // Correspondance exacte pour la page d'accueil
    if (pathname === '/dashboard') {
      return 'accueil';
    }
    
    // Pour les autres pages, on cherche la correspondance la plus spécifique
    const matches = navigationItems
      .filter(item => item.href !== '/dashboard' && pathname.startsWith(item.href))
      .sort((a, b) => b.href.length - a.href.length); // Trier par longueur décroissante pour avoir la correspondance la plus spécifique
    
    return matches[0]?.id || 'accueil';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Main Header */}
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">FlexCars</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                Location de véhicules
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Simple links in header */}
        <nav className="hidden md:flex items-center space-x-6">
          <span className="text-sm font-medium text-muted-foreground">
            Bienvenue dans votre espace FlexCars
          </span>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/dashboard/profil">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
              3
            </span>
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.email} />
                  <AvatarFallback>
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profil" className="w-full cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col space-y-4 mt-4">
                <div className="flex items-center space-x-2 mb-6 pb-4 border-b">
                  <Car className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold text-primary">FlexCars</span>
                </div>
                
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 text-sm font-medium p-3 rounded-md transition-colors ${
                      getActiveItem() === item.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:text-primary hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Navigation Tabs for Desktop */}
      <div className="hidden md:block border-t">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6 overflow-x-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  getActiveItem() === item.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-primary hover:border-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
} 