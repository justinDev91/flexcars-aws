"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  MapPin, 
  Shield, 
  Clock, 
  Star, 
  ArrowRight,
  Smartphone,
  CreditCard,
  Zap,
  Award,
  Phone
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Smartphone,
      title: "Réservation en ligne",
      description: "Réservez votre véhicule en quelques clics, 24h/24 et 7j/7"
    },
    {
      icon: MapPin,
      title: "Plusieurs points de retrait",
      description: "Récupérez votre véhicule dans l'un de nos nombreux points de retrait"
    },
    {
      icon: Shield,
      title: "Assurance incluse",
      description: "Tous nos véhicules sont assurés avec options d'assurance complémentaire"
    },
    {
      icon: Clock,
      title: "Assistance 24h/24",
      description: "Notre équipe vous accompagne à tout moment pour un service optimal"
    },
    {
      icon: CreditCard,
      title: "Paiement sécurisé",
      description: "Transactions protégées et multiples moyens de paiement acceptés"
    },
    {
      icon: Zap,
      title: "Service Car Sitting",
      description: "Livraison et récupération de votre véhicule à domicile ou au bureau"
    }
  ];

  const vehicleTypes = [
    {
      title: "Citadines",
      description: "Parfaites pour la ville",
      image: "🚗",
      price: "À partir de 25€/jour"
    },
    {
      title: "Familiales",
      description: "Confort pour toute la famille",
      image: "🚙",
      price: "À partir de 45€/jour"
    },
    {
      title: "Utilitaires",
      description: "Pour vos déménagements",
      image: "🚚",
      price: "À partir de 35€/jour"
    },
    {
      title: "Premium",
      description: "Luxe et performance",
      image: "🏎️",
      price: "À partir de 80€/jour"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Cliente particulière",
      rating: 5,
      comment: "Service impeccable ! La réservation en ligne est très simple et les véhicules sont toujours en parfait état."
    },
    {
      name: "Jean Martin",
      role: "Dirigeant d'entreprise",
      rating: 5,
      comment: "FlexCars nous fait gagner un temps précieux pour les déplacements professionnels de nos équipes."
    },
    {
      name: "Sophie Leroy",
      role: "Particulière",
      rating: 5,
      comment: "Le service car sitting est fantastique ! Plus besoin de se déplacer, tout se fait à domicile."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header simple pour les non-connectés */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">FlexCars</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link href="/auth/register">
                <Button>S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Award className="h-4 w-4 mr-2" />
              #1 de la location de véhicules en ligne
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Location de véhicules
              <span className="text-primary"> moderne et flexible</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Découvrez une nouvelle façon de louer des véhicules. Simple, rapide et adapté à tous vos besoins. 
              Réservez en ligne et roulez en toute sérénité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  En savoir plus
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-foreground/80">Véhicules disponibles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">10k+</div>
              <div className="text-primary-foreground/80">Clients satisfaits</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">15</div>
              <div className="text-primary-foreground/80">Points de retrait</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-foreground/80">Assistance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi choisir FlexCars ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nous révolutionnons la location de véhicules avec des services pensés pour votre confort et votre tranquillité d'esprit.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Notre flotte de véhicules
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des citadines économiques aux véhicules premium, trouvez le véhicule parfait pour chaque occasion.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicleTypes.map((type, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{type.image}</div>
                  <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <div className="text-primary font-semibold">{type.price}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Louer un véhicule n'a jamais été aussi simple. Suivez ces 3 étapes et roulez !
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Choisissez votre véhicule</h3>
              <p className="text-muted-foreground">
                Parcourez notre catalogue et sélectionnez le véhicule qui correspond à vos besoins.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Réservez en ligne</h3>
              <p className="text-muted-foreground">
                Indiquez vos dates, validez votre réservation et payez en toute sécurité.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Récupérez et roulez</h3>
              <p className="text-muted-foreground">
                Récupérez votre véhicule au point de retrait ou profitez de notre service de livraison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plus de 10 000 clients nous font confiance. Découvrez leurs témoignages.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.comment}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer votre aventure ?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de clients satisfaits et découvrez une nouvelle façon de louer des véhicules.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Créer mon compte gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/legal/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary">
                Nous contacter
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 