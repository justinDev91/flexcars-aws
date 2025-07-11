"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Mentions Légales
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Informations légales obligatoires
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Informations sur l'Éditeur</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p><strong>Raison sociale :</strong> FlexCars SAS</p>
                  <p><strong>Forme juridique :</strong> Société par Actions Simplifiée</p>
                  <p><strong>Capital social :</strong> [Montant à compléter] €</p>
                  <p><strong>Siège social :</strong> [Adresse à compléter]</p>
                  <p><strong>RCS :</strong> [Numéro RCS à compléter]</p>
                  <p><strong>SIRET :</strong> [Numéro SIRET à compléter]</p>
                  <p><strong>Code APE :</strong> [Code APE à compléter]</p>
                  <p><strong>TVA Intracommunautaire :</strong> [Numéro TVA à compléter]</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Contact</h2>
                <div className="space-y-2">
                  <p><strong>Adresse :</strong> [Adresse postale complète]</p>
                  <p><strong>Téléphone :</strong> [Numéro de téléphone]</p>
                  <p><strong>Email :</strong> contact@flexcars.fr</p>
                  <p><strong>Site web :</strong> https://flexcars.fr</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Représentant Légal</h2>
                <div className="space-y-2">
                  <p><strong>Directeur de la publication :</strong> [Nom du directeur]</p>
                  <p><strong>Qualité :</strong> [Fonction]</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Hébergement</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p><strong>Hébergeur :</strong> [Nom de l'hébergeur]</p>
                  <p><strong>Adresse :</strong> [Adresse de l'hébergeur]</p>
                  <p><strong>Téléphone :</strong> [Téléphone de l'hébergeur]</p>
                  <p><strong>Site web :</strong> [Site web de l'hébergeur]</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Propriété Intellectuelle</h2>
                <p>
                  L'ensemble du contenu du site FlexCars (textes, images, vidéos, logos, icônes, etc.) est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de FlexCars.
                </p>
                <p className="mt-4">
                  Toute exploitation non autorisée du site ou de l'un quelconque des éléments qu'il contient sera considérée comme constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Responsabilité</h2>
                <p>
                  FlexCars s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
                </p>
                <p className="mt-4">
                  Tous les informations indiquées sur le site sont données à titre indicatif, et sont susceptibles d'évoluer. Par ailleurs, les renseignements figurant sur le site ne sont pas exhaustifs. Ils sont donnés sous réserve de modifications ayant été apportées depuis leur mise en ligne.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Données Personnelles</h2>
                <p>
                  Le traitement des données personnelles est régi par notre 
                  <a href="/legal/politique-confidentialite" className="text-primary hover:underline"> Politique de Confidentialité</a>, 
                  conforme au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Cookies</h2>
                <p>
                  Le site FlexCars utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. L'utilisation de ces cookies est détaillée dans notre politique de confidentialité. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela pourrait affecter le fonctionnement optimal du site.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Liens Hypertextes</h2>
                <p>
                  Le site FlexCars peut contenir des liens vers d'autres sites web. FlexCars n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur politique de confidentialité.
                </p>
                <p className="mt-4">
                  Tout site souhaitant créer un lien vers le site FlexCars doit obtenir une autorisation préalable écrite.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Droit Applicable</h2>
                <p>
                  Le présent site et les présentes mentions légales sont régis par le droit français. En cas de litige, et après recherche d'une solution amiable, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Activité Réglementée</h2>
                <div className="space-y-2">
                  <p><strong>Activité :</strong> Location de véhicules</p>
                  <p><strong>Autorisation :</strong> [Référence autorisation si applicable]</p>
                  <p><strong>Assurance Responsabilité Civile Professionnelle :</strong></p>
                  <div className="pl-4">
                    <p>Compagnie : [Nom de l'assureur]</p>
                    <p>Police n° : [Numéro de police]</p>
                    <p>Garantie territoriale : [Zone de couverture]</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Médiation Consommation</h2>
                <p>
                  Conformément à l'article L.616-1 du Code de la consommation, nous vous informons qu'en cas de litige, vous pouvez recourir gratuitement au service de médiation :
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p><strong>Médiateur :</strong> [Nom du médiateur]</p>
                  <p><strong>Adresse :</strong> [Adresse du médiateur]</p>
                  <p><strong>Site web :</strong> [Site web du médiateur]</p>
                </div>
                <p className="mt-4">
                  Plateforme européenne de règlement en ligne des litiges : 
                  <a href="https://ec.europa.eu/consumers/odr/" className="text-primary hover:underline"> 
                    https://ec.europa.eu/consumers/odr/
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Crédits</h2>
                <div className="space-y-2">
                  <p><strong>Conception et développement :</strong> [Agence/Développeur]</p>
                  <p><strong>Crédits photos :</strong> [Sources des images]</p>
                  <p><strong>Icônes :</strong> Lucide React</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 