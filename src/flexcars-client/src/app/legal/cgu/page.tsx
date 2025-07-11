"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Conditions Générales d'Utilisation
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
                  Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme FlexCars, service de location de véhicules en ligne.
                </p>
                <p>
                  L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Définitions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Plateforme :</strong> Le service FlexCars accessible via l'application web</li>
                  <li><strong>Utilisateur :</strong> Toute personne physique ou morale utilisant la plateforme</li>
                  <li><strong>Client :</strong> Utilisateur ayant souscrit à nos services de location</li>
                  <li><strong>Véhicule :</strong> Tout véhicule proposé à la location sur la plateforme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Inscription et Compte Utilisateur</h2>
                <p>
                  L'accès aux services de réservation nécessite la création d'un compte utilisateur. L'utilisateur s'engage à :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Maintenir la confidentialité de ses identifiants</li>
                  <li>Notifier immédiatement toute utilisation non autorisée de son compte</li>
                  <li>Être âgé d'au moins 18 ans et titulaire d'un permis de conduire valide</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Utilisation de la Plateforme</h2>
                <p>
                  L'utilisateur s'engage à utiliser la plateforme conformément à sa destination et aux présentes CGU. Il est interdit de :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Porter atteinte à la sécurité ou à l'intégrité de la plateforme</li>
                  <li>Utiliser des dispositifs automatisés pour accéder à la plateforme</li>
                  <li>Reproduire, copier ou vendre tout ou partie de la plateforme</li>
                  <li>Utiliser la plateforme à des fins illégales ou non autorisées</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Protection des Données Personnelles</h2>
                <p>
                  FlexCars s'engage à protéger la vie privée de ses utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
                <p>
                  Les modalités de traitement des données personnelles sont détaillées dans notre 
                  <a href="/legal/politique-confidentialite" className="text-primary hover:underline"> Politique de Confidentialité</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Responsabilité</h2>
                <p>
                  FlexCars met tout en œuvre pour assurer la continuité et la qualité du service. Toutefois, la responsabilité de FlexCars ne saurait être engagée en cas de :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Interruption du service pour maintenance ou cas de force majeure</li>
                  <li>Utilisation inappropriée de la plateforme par l'utilisateur</li>
                  <li>Dommages indirects résultant de l'utilisation de la plateforme</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Propriété Intellectuelle</h2>
                <p>
                  Tous les éléments de la plateforme (textes, images, logos, etc.) sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Modification des CGU</h2>
                <p>
                  FlexCars se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par email ou notification sur la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Droit Applicable et Juridiction</h2>
                <p>
                  Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
                <p>
                  Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Par email : legal@flexcars.fr</li>
                  <li>Par courrier : FlexCars, Service Juridique, [Adresse à compléter]</li>
                  <li>Via notre <a href="/legal/contact" className="text-primary hover:underline">formulaire de contact</a></li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 