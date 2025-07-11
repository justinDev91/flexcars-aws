"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Politique de Confidentialité
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                  FlexCars s'engage à protéger la vie privée et les données personnelles de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
                </p>
                <p>
                  Cette politique explique comment nous collectons, utilisons, conservons et protégeons vos données personnelles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Responsable du Traitement</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>FlexCars</strong></p>
                  <p>Adresse : [Adresse à compléter]</p>
                  <p>Email : dpo@flexcars.fr</p>
                  <p>Téléphone : [Numéro à compléter]</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Données Collectées</h2>
                <h3 className="text-xl font-semibold mb-2">3.1 Données d'identification</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nom, prénom</li>
                  <li>Date de naissance</li>
                  <li>Adresse postale</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse email</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Données de conduite</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Numéro et date d'obtention du permis de conduire</li>
                  <li>Catégories de permis</li>
                  <li>Historique de conduite (si communiqué)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Données de paiement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Informations de carte bancaire (cryptées et sécurisées)</li>
                  <li>Historique des transactions</li>
                  <li>Informations de facturation</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">3.4 Données de navigation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Adresse IP</li>
                  <li>Cookies et traceurs</li>
                  <li>Données de géolocalisation (avec consentement)</li>
                  <li>Historique de navigation sur la plateforme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Finalités du Traitement</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">4.1 Gestion des comptes et services</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Création et gestion de votre compte</li>
                      <li>Traitement des réservations</li>
                      <li>Gestion des paiements et facturations</li>
                      <li>Service client et support</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">Base légale : Exécution du contrat</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">4.2 Obligations légales</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Vérification d'identité</li>
                      <li>Lutte contre la fraude</li>
                      <li>Conservation des données comptables</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">Base légale : Obligation légale</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">4.3 Amélioration des services</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Analyse des usages</li>
                      <li>Personnalisation de l'expérience</li>
                      <li>Développement de nouveaux services</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">Base légale : Intérêt légitime</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">4.4 Communication marketing (avec consentement)</h3>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Newsletters</li>
                      <li>Offres promotionnelles</li>
                      <li>Enquêtes de satisfaction</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2">Base légale : Consentement</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Partage des Données</h2>
                <p>
                  Vos données personnelles ne sont partagées qu'avec :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Prestataires de services :</strong> Paiement (Stripe), hébergement, maintenance</li>
                  <li><strong>Autorités compétentes :</strong> Sur réquisition judiciaire uniquement</li>
                  <li><strong>Partenaires commerciaux :</strong> Uniquement avec votre consentement explicite</li>
                </ul>
                <p className="mt-4">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Transferts Internationaux</h2>
                <p>
                  Certaines de nos données peuvent être hébergées ou traitées en dehors de l'Union Européenne. Dans ce cas, nous nous assurons que :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Le pays bénéficie d'une décision d'adéquation de la Commission Européenne</li>
                  <li>Des garanties appropriées sont mises en place (clauses contractuelles types)</li>
                  <li>Votre consentement explicite est obtenu si nécessaire</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Durée de Conservation</h2>
                <div className="space-y-2">
                  <p><strong>Données de compte :</strong> 3 ans après la dernière activité</p>
                  <p><strong>Données de facturation :</strong> 10 ans (obligation légale)</p>
                  <p><strong>Données de navigation :</strong> 13 mois maximum</p>
                  <p><strong>Données marketing :</strong> 3 ans ou jusqu'à désabonnement</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Sécurité des Données</h2>
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chiffrement des données sensibles</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Surveillance et détection d'intrusions</li>
                  <li>Sauvegardes régulières et sécurisées</li>
                  <li>Formation régulière de nos équipes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Vos Droits</h2>
                <p>
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">🔍 Droit d'accès</h3>
                    <p>Connaître les données que nous détenons sur vous</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">✏️ Droit de rectification</h3>
                    <p>Corriger vos données inexactes ou incomplètes</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">🗑️ Droit à l'effacement</h3>
                    <p>Demander la suppression de vos données dans certains cas</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">⏸️ Droit à la limitation</h3>
                    <p>Limiter le traitement de vos données</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">📦 Droit à la portabilité</h3>
                    <p>Récupérer vos données dans un format structuré</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">🚫 Droit d'opposition</h3>
                    <p>Vous opposer au traitement de vos données</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">⚖️ Droit de retrait du consentement</h3>
                    <p>Retirer votre consentement à tout moment</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Comment exercer vos droits ?</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Email : dpo@flexcars.fr</li>
                    <li>Courrier : FlexCars - DPO, [Adresse]</li>
                    <li>Espace personnel : Section "Mes données"</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    Nous nous engageons à répondre dans un délai d'un mois.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Cookies et Traceurs</h2>
                <p>
                  Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences via notre bandeau de cookies ou dans les paramètres de votre navigateur.
                </p>
                <p>
                  Types de cookies utilisés :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                  <li><strong>Cookies de performance :</strong> Mesure d'audience et statistiques</li>
                  <li><strong>Cookies de personnalisation :</strong> Préférences utilisateur</li>
                  <li><strong>Cookies marketing :</strong> Publicité ciblée (avec consentement)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Mineurs</h2>
                <p>
                  Nos services sont destinés aux personnes majeures. Nous ne collectons pas intentionnellement de données personnelles concernant des mineurs de moins de 16 ans.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Réclamations</h2>
                <p>
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL :
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong></p>
                  <p>3 Place de Fontenoy - TSA 80715</p>
                  <p>75334 PARIS CEDEX 07</p>
                  <p>Téléphone : 01 53 73 22 22</p>
                  <p>Site web : <a href="https://www.cnil.fr" className="text-primary hover:underline">www.cnil.fr</a></p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Modifications</h2>
                <p>
                  Cette politique peut être modifiée pour refléter les évolutions de nos services ou de la réglementation. Nous vous informerons de toute modification significative par email ou notification sur la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">14. Contact</h2>
                <p>
                  Pour toute question concernant cette politique de confidentialité :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Délégué à la Protection des Données :</strong> dpo@flexcars.fr</li>
                  <li><strong>Service client :</strong> contact@flexcars.fr</li>
                  <li><strong>Téléphone :</strong> [Numéro à compléter]</li>
                  <li><a href="/legal/contact" className="text-primary hover:underline">Formulaire de contact</a></li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 