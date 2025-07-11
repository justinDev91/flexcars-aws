"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  Car, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Shield,
  FileText,
  HelpCircle,
  Cookie
} from 'lucide-react';
import { CookiePreferencesModal } from '@/components/cookie-preferences-modal';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Section À propos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">FlexCars</span>
            </div>
            <p className="text-gray-300 text-sm">
              Votre solution de location de véhicules flexible et moderne. 
              Réservez en ligne, conduisez en toute sérénité.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-gray-300">[Adresse à compléter]</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-gray-300">[Téléphone à compléter]</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-gray-300">contact@flexcars.fr</span>
              </div>
            </div>
          </div>

          {/* Section Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nos Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/vehicles" className="text-gray-300 hover:text-primary transition-colors">
                  Location de véhicules
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reservations" className="text-gray-300 hover:text-primary transition-colors">
                  Réservation en ligne
                </Link>
              </li>
              <li>
                <span className="text-gray-300">Assurance tous risques</span>
              </li>
              <li>
                <span className="text-gray-300">Car sitting</span>
              </li>
              <li>
                <span className="text-gray-300">Assistance 24h/24</span>
              </li>
            </ul>
          </div>

          {/* Section Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/contact" className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1">
                  <HelpCircle className="h-4 w-4" />
                  <span>Centre d'aide</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/contact" className="text-gray-300 hover:text-primary transition-colors">
                  Nous contacter
                </Link>
              </li>
              <li>
                <span className="text-gray-300">FAQ</span>
              </li>
              <li>
                <span className="text-gray-300">Guide d'utilisation</span>
              </li>
              <li>
                <span className="text-gray-300">Signaler un problème</span>
              </li>
            </ul>
          </div>

          {/* Section Légal & Réseaux sociaux */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/mentions-legales" className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Mentions légales</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cgu" className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>CGU</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/cgv" className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>CGV</span>
                </Link>
              </li>
              <li>
                <Link href="/legal/politique-confidentialite" className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Politique de confidentialité</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setIsCookieModalOpen(true)}
                  className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1 text-left"
                >
                  <Cookie className="h-4 w-4" />
                  <span>Gestion des cookies</span>
                </button>
              </li>
            </ul>

            {/* Réseaux sociaux */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3">Suivez-nous</h4>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-300 hover:text-primary transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-primary transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-300">
              © {currentYear} FlexCars. Tous droits réservés.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <span>Paiement sécurisé</span>
              <div className="flex space-x-2">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs text-gray-800 font-semibold">VISA</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs text-gray-800 font-semibold">MC</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs text-gray-800 font-semibold">AMEX</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bandeau RGPD simplifié */}
        <div className="mt-6 p-3 bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-xs text-gray-300 flex-1">
              <Shield className="inline h-3 w-3 mr-1" />
              Vos données personnelles sont protégées conformément au RGPD. 
              <Link href="/legal/politique-confidentialite" className="text-primary hover:underline ml-1">
                Politique de confidentialité
              </Link>
              {' • '}
              <Link href="/legal/politique-cookies" className="text-primary hover:underline">
                Politique de cookies
              </Link>
            </div>
            <div className="text-xs text-gray-400">
              Conforme RGPD • Données sécurisées
            </div>
          </div>
        </div>
      </div>
      
      <CookiePreferencesModal 
        open={isCookieModalOpen} 
        onOpenChange={setIsCookieModalOpen} 
      />
    </footer>
  );
} 