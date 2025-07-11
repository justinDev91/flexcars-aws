"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CookiePreferencesModal } from '@/components/cookie-preferences-modal';
import { useCookies } from '@/context/cookie-context';
import { 
  Cookie, 
  Shield, 
  BarChart3, 
  Target, 
  Settings,
  Clock,
  Database,
  Globe
} from 'lucide-react';

export default function PolitiqueCookiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { consent } = useCookies();

  const cookieDetails = [
    {
      name: 'flexcars-auth-token',
      purpose: 'Authentification utilisateur',
      category: 'Nécessaire',
      duration: '30 jours',
      provider: 'FlexCars',
      description: 'Token d\'authentification pour maintenir la session utilisateur connecté'
    },
    {
      name: 'flexcars-cookie-consent',
      purpose: 'Préférences cookies',
      category: 'Nécessaire',
      duration: '13 mois',
      provider: 'FlexCars',
      description: 'Stocke vos préférences de consentement pour les cookies'
    },
    {
      name: 'next-auth.session-token',
      purpose: 'Session NextAuth',
      category: 'Nécessaire',
      duration: 'Session',
      provider: 'NextAuth.js',
      description: 'Gestion des sessions d\'authentification'
    },
    {
      name: '_ga',
      purpose: 'Google Analytics',
      category: 'Analytique',
      duration: '2 ans',
      provider: 'Google',
      description: 'Distingue les utilisateurs uniques'
    },
    {
      name: '_ga_*',
      purpose: 'Google Analytics 4',
      category: 'Analytique',
      duration: '2 ans',
      provider: 'Google',
      description: 'Utilisé par Google Analytics 4 pour persister l\'état de session'
    },
    {
      name: 'fbp',
      purpose: 'Facebook Pixel',
      category: 'Marketing',
      duration: '3 mois',
      provider: 'Meta',
      description: 'Utilisé par Facebook pour le suivi publicitaire'
    },
    {
      name: 'flexcars-preferences',
      purpose: 'Préférences utilisateur',
      category: 'Préférences',
      duration: '1 an',
      provider: 'FlexCars',
      description: 'Sauvegarde les préférences d\'affichage et de langue'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cookie className="h-8 w-8 text-primary" />
              <CardTitle className="text-4xl font-bold">
                Politique de Cookies
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-lg">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)} size="lg" className="gap-2">
                <Settings className="h-4 w-4" />
                Gérer mes préférences
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-3xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-primary" />
                  1. Qu'est-ce qu'un cookie ?
                </h2>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                  <p className="text-blue-800">
                    Un cookie est un petit fichier texte stocké par votre navigateur lorsque vous visitez notre site. 
                    Il permet de mémoriser des informations sur votre visite comme vos préférences ou votre session de connexion.
                  </p>
                </div>
                <p>
                  FlexCars utilise différents types de cookies pour améliorer votre expérience de navigation, 
                  analyser l'utilisation du site et vous proposer des contenus personnalisés.
                </p>
                <p>
                  Conformément au Règlement Général sur la Protection des Données (RGPD) et à la directive ePrivacy, 
                  nous vous informons de l'utilisation de ces cookies et vous permettons de contrôler vos préférences.
                </p>
              </section>

              {/* Types de cookies */}
              <section>
                <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  2. Types de cookies utilisés
                </h2>
                
                <div className="grid gap-6">
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Shield className="h-5 w-5" />
                        Cookies strictement nécessaires
                        <span className="text-xs bg-green-200 px-2 py-1 rounded">OBLIGATOIRES</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-green-700 mb-3">
                        Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-green-700">
                        <li>Authentification et maintien de session</li>
                        <li>Sécurité et protection contre les attaques</li>
                        <li>Fonctionnalités du panier et du processus de réservation</li>
                        <li>Préférences de navigation essentielles</li>
                      </ul>
                      <p className="mt-3 text-sm text-green-600">
                        <strong>Base légale :</strong> Intérêt légitime (fonctionnement du service)
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <BarChart3 className="h-5 w-5" />
                        Cookies analytiques
                        <span className={`text-xs px-2 py-1 rounded ${consent.analytics ? 'bg-blue-200' : 'bg-gray-200'}`}>
                          {consent.analytics ? 'ACTIVÉS' : 'DÉSACTIVÉS'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-blue-700 mb-3">
                        Ces cookies nous aident à comprendre comment vous utilisez notre site pour l'améliorer.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-blue-700">
                        <li>Google Analytics pour les statistiques de visite</li>
                        <li>Analyse du comportement utilisateur</li>
                        <li>Mesure des performances du site</li>
                        <li>Tests d'optimisation (A/B testing)</li>
                      </ul>
                      <p className="mt-3 text-sm text-blue-600">
                        <strong>Base légale :</strong> Consentement utilisateur
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Target className="h-5 w-5" />
                        Cookies marketing
                        <span className={`text-xs px-2 py-1 rounded ${consent.marketing ? 'bg-purple-200' : 'bg-gray-200'}`}>
                          {consent.marketing ? 'ACTIVÉS' : 'DÉSACTIVÉS'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-700 mb-3">
                        Ces cookies permettent de vous proposer des publicités et offres personnalisées.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-purple-700">
                        <li>Facebook Pixel et réseaux sociaux</li>
                        <li>Retargeting publicitaire</li>
                        <li>Mesure d'efficacité des campagnes</li>
                        <li>Personnalisation des offres</li>
                      </ul>
                      <p className="mt-3 text-sm text-purple-600">
                        <strong>Base légale :</strong> Consentement utilisateur
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Settings className="h-5 w-5" />
                        Cookies de préférences
                        <span className={`text-xs px-2 py-1 rounded ${consent.preferences ? 'bg-orange-200' : 'bg-gray-200'}`}>
                          {consent.preferences ? 'ACTIVÉS' : 'DÉSACTIVÉS'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-orange-700 mb-3">
                        Ces cookies sauvegardent vos préférences pour personnaliser votre expérience.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-orange-700">
                        <li>Langue et région préférées</li>
                        <li>Thème et apparence du site</li>
                        <li>Filtres et tri sauvegardés</li>
                        <li>Préférences de notification</li>
                      </ul>
                      <p className="mt-3 text-sm text-orange-600">
                        <strong>Base légale :</strong> Consentement utilisateur
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Tableau détaillé des cookies */}
              <section>
                <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  3. Liste détaillée des cookies
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left font-semibold">Nom du cookie</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Finalité</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Catégorie</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Durée</th>
                        <th className="border border-gray-300 p-3 text-left font-semibold">Fournisseur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieDetails.map((cookie, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3 font-mono text-sm">{cookie.name}</td>
                          <td className="border border-gray-300 p-3 text-sm">{cookie.purpose}</td>
                          <td className="border border-gray-300 p-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              cookie.category === 'Nécessaire' ? 'bg-green-100 text-green-800' :
                              cookie.category === 'Analytique' ? 'bg-blue-100 text-blue-800' :
                              cookie.category === 'Marketing' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {cookie.category}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-3 text-sm">{cookie.duration}</td>
                          <td className="border border-gray-300 p-3 text-sm">{cookie.provider}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Gestion des cookies */}
              <section>
                <h2 className="text-3xl font-semibold mb-4">4. Comment gérer vos cookies ?</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">🎛️ Centre de préférences FlexCars</h3>
                    <p className="mb-4">
                      Vous pouvez à tout moment modifier vos préférences de cookies en utilisant notre centre de gestion :
                    </p>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                      <Settings className="h-4 w-4" />
                      Ouvrir le centre de préférences
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">🌐 Paramètres de votre navigateur</h3>
                    <p className="mb-3">
                      Vous pouvez également configurer votre navigateur pour refuser les cookies :
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                      <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
                      <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                      <li><strong>Edge :</strong> Paramètres → Confidentialité → Cookies</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-amber-800">
                      ⚠️ <strong>Attention :</strong> Désactiver tous les cookies peut affecter le fonctionnement 
                      du site et certaines fonctionnalités pourraient ne plus être disponibles.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies tiers */}
              <section>
                <h2 className="text-3xl font-semibold mb-4">5. Cookies de partenaires tiers</h2>
                <p className="mb-4">
                  Certains de nos partenaires peuvent également déposer des cookies sur votre appareil :
                </p>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Google Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Service d'analyse d'audience pour comprendre l'utilisation du site.
                    </p>
                    <a 
                      href="https://policies.google.com/privacy" 
                      className="text-primary hover:underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Politique de confidentialité Google →
                    </a>
                  </div>

                  <div className="border border-gray-200 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Meta (Facebook)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Pixel de suivi pour les campagnes publicitaires et le retargeting.
                    </p>
                    <a 
                      href="https://www.facebook.com/privacy/policy/" 
                      className="text-primary hover:underline text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Politique de confidentialité Meta →
                    </a>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-3xl font-semibold mb-4">6. Contact</h2>
                <p>
                  Pour toute question concernant notre politique de cookies, vous pouvez nous contacter :
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p><strong>FlexCars - Délégué à la Protection des Données</strong></p>
                  <p>Email : dpo@flexcars.fr</p>
                  <p>Téléphone : [Numéro à compléter]</p>
                  <p>Adresse : [Adresse à compléter]</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>

      <CookiePreferencesModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  );
} 