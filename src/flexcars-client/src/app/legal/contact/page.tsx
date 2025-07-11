"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  Loader2,
  MessageSquare,
  HelpCircle,
  FileText,
  Shield
} from 'lucide-react';

const contactSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  subject: z.enum(['general', 'reservation', 'billing', 'technical', 'legal', 'complaint'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un sujet' })
  }),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const SUBJECTS = [
  { value: 'general', label: 'Question générale' },
  { value: 'reservation', label: 'Réservation' },
  { value: 'billing', label: 'Facturation' },
  { value: 'technical', label: 'Problème technique' },
  { value: 'legal', label: 'Question juridique' },
  { value: 'complaint', label: 'Réclamation' },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: undefined,
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dans un vrai projet, on ferait un appel API ici
      console.log('Contact form submitted:', data);
      
      toast.success('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      form.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Contactez-nous</h1>
            <p className="text-muted-foreground text-lg">
              Notre équipe est là pour vous aider. N'hésitez pas à nous contacter !
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulaire de contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Envoyer un message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        placeholder="Votre prénom"
                        {...form.register('firstName')}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        placeholder="Votre nom"
                        {...form.register('lastName')}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="01 23 45 67 89"
                      {...form.register('phone')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet *</Label>
                    <Select onValueChange={(value) => form.setValue('subject', value as 'general' | 'reservation' | 'billing' | 'technical' | 'legal' | 'complaint')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un sujet" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.subject && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre demande en détail..."
                      rows={6}
                      {...form.register('message')}
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Informations de contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-muted-foreground text-sm">
                        [Adresse à compléter]<br />
                        [Code postal] [Ville]<br />
                        France
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-muted-foreground text-sm">
                        Service client : [Numéro à compléter]<br />
                        Assistance 24h/24 : [Numéro à compléter]
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground text-sm">
                        contact@flexcars.fr<br />
                        support@flexcars.fr
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Horaires</p>
                      <p className="text-muted-foreground text-sm">
                        Lundi - Vendredi : 9h00 - 18h00<br />
                        Samedi : 9h00 - 12h00<br />
                        Dimanche : Fermé
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Questions fréquentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="font-medium mb-1">🚗 Questions sur les réservations</p>
                    <p className="text-muted-foreground">
                      Consultez notre section d'aide ou contactez-nous directement.
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium mb-1">💳 Problèmes de paiement</p>
                    <p className="text-muted-foreground">
                      Notre équipe de facturation vous aidera rapidement.
                    </p>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium mb-1">🔧 Support technique</p>
                    <p className="text-muted-foreground">
                      Assistance technique disponible pour tous vos problèmes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informations légales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <FileText className="inline h-4 w-4 mr-2" />
                    <a href="/legal/mentions-legales" className="text-primary hover:underline">
                      Mentions légales
                    </a>
                  </p>
                  <p>
                    <FileText className="inline h-4 w-4 mr-2" />
                    <a href="/legal/cgu" className="text-primary hover:underline">
                      Conditions générales d'utilisation
                    </a>
                  </p>
                  <p>
                    <FileText className="inline h-4 w-4 mr-2" />
                    <a href="/legal/cgv" className="text-primary hover:underline">
                      Conditions générales de vente
                    </a>
                  </p>
                  <p>
                    <Shield className="inline h-4 w-4 mr-2" />
                    <a href="/legal/politique-confidentialite" className="text-primary hover:underline">
                      Politique de confidentialité
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 