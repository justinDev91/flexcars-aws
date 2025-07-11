"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Conditions Générales de Vente
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
                <p>
                  Les présentes Conditions Générales de Vente (CGV) s'appliquent à tous les services de location de véhicules proposés par FlexCars. Elles complètent les Conditions Générales d'Utilisation.
                </p>
                <p>
                  Toute réservation implique l'acceptation sans réserve des présentes CGV.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Conditions de Location</h2>
                <h3 className="text-xl font-semibold mb-2">2.1 Conditions d'âge et permis</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Être âgé d'au moins 21 ans (25 ans pour certaines catégories de véhicules)</li>
                  <li>Être titulaire d'un permis de conduire valide depuis au moins 2 ans</li>
                  <li>Présenter une pièce d'identité en cours de validité</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Documents obligatoires</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Permis de conduire en cours de validité</li>
                  <li>Pièce d'identité (carte nationale d'identité ou passeport)</li>
                  <li>Justificatif de domicile de moins de 3 mois</li>
                  <li>Carte bancaire pour la caution</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Réservation et Paiement</h2>
                <h3 className="text-xl font-semibold mb-2">3.1 Processus de réservation</h3>
                <p>
                  La réservation s'effectue exclusivement en ligne via la plateforme FlexCars. Elle devient ferme et définitive après :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Validation du formulaire de réservation</li>
                  <li>Paiement de l'acompte ou du montant total</li>
                  <li>Réception de l'email de confirmation</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Modalités de paiement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cartes bancaires (Visa, Mastercard, American Express)</li>
                  <li>Virement bancaire (pour les entreprises)</li>
                  <li>Paiement en ligne sécurisé via Stripe</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Caution</h3>
                <p>
                  Une caution est systématiquement demandée lors de la prise du véhicule. Le montant varie selon la catégorie du véhicule (de 500€ à 2000€).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Tarification</h2>
                <h3 className="text-xl font-semibold mb-2">4.1 Prix</h3>
                <p>
                  Les prix affichés sur la plateforme sont exprimés en euros TTC. Ils comprennent :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>La location du véhicule pour la durée choisie</li>
                  <li>L'assurance responsabilité civile obligatoire</li>
                  <li>L'assistance 24h/24 7j/7</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Services optionnels</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Assurance tous risques : réduction de franchise</li>
                  <li>Car sitting : service de livraison/récupération</li>
                  <li>Équipements supplémentaires (siège bébé, GPS, etc.)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Utilisation du Véhicule</h2>
                <h3 className="text-xl font-semibold mb-2">5.1 Obligations du locataire</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Utiliser le véhicule en bon père de famille</li>
                  <li>Respecter le Code de la route</li>
                  <li>Ne pas dépasser le kilométrage autorisé (si applicable)</li>
                  <li>Rendre le véhicule dans l'état où il a été remis</li>
                  <li>Interdiction de sous-louer ou prêter le véhicule</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">5.2 Interdictions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Conduite sous l'emprise d'alcool ou de stupéfiants</li>
                  <li>Transport de matières dangereuses</li>
                  <li>Utilisation à des fins commerciales (sauf accord préalable)</li>
                  <li>Sortie du territoire français sans autorisation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Annulation et Modification</h2>
                <h3 className="text-xl font-semibold mb-2">6.1 Annulation par le client</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Plus de 48h avant : remboursement intégral</li>
                  <li>Entre 24h et 48h : retenue de 50%</li>
                  <li>Moins de 24h : aucun remboursement</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">6.2 Modification de réservation</h3>
                <p>
                  Les modifications sont possibles sous réserve de disponibilité et peuvent entraîner un supplément tarifaire.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Assurance et Responsabilité</h2>
                <h3 className="text-xl font-semibold mb-2">7.1 Couverture d'assurance</h3>
                <p>
                  Tous les véhicules sont assurés en responsabilité civile obligatoire. Des options d'assurance complémentaire sont proposées.
                </p>

                <h3 className="text-xl font-semibold mb-2 mt-4">7.2 Franchise</h3>
                <p>
                  En cas de sinistre, une franchise reste à la charge du locataire selon le barème en vigueur (consultable sur demande).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Incidents et Pannes</h2>
                <p>
                  En cas d'incident ou de panne, le locataire doit immédiatement :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contacter FlexCars via l'assistance 24h/24</li>
                  <li>Remplir un constat amiable en cas d'accident</li>
                  <li>Porter plainte en cas de vol ou vandalisme</li>
                  <li>Ne pas faire réparer sans accord préalable</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Protection des Données</h2>
                <p>
                  Les données personnelles collectées sont traitées conformément à notre 
                  <a href="/legal/politique-confidentialite" className="text-primary hover:underline"> Politique de Confidentialité</a> 
                  et au RGPD.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Règlement des Litiges</h2>
                <p>
                  En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux de Paris seront compétents.
                </p>
                <p>
                  Le client peut également recourir à la médiation de la consommation via la plateforme européenne de règlement en ligne des litiges.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact</h2>
                <p>
                  Pour toute question relative aux présentes CGV :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email : ventes@flexcars.fr</li>
                  <li>Téléphone : 01 XX XX XX XX</li>
                  <li>Assistance 24h/24 : 01 XX XX XX XX</li>
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