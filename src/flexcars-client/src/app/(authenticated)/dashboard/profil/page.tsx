"use client";

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  FileSignature, 
  Edit, 
  Save,
  Mail,
  Smartphone,
  MessageSquare,
  Calendar,
  CreditCard,
  Car,
  Eye,
  Trash2,
  FileText,
  Upload,
  Download,
  Plus,
  AlertTriangle,
  Shield,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { SignatureDisplay } from '@/components/signature-pad';
import { Document, DocumentType } from '@/types/document';
import { documentApi, gdprApi } from '@/lib/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  reservations: boolean;
  payments: boolean;
  promotions: boolean;
  maintenance: boolean;
  reminders: boolean;
}

interface SavedSignature {
  id: string;
  documentName: string;
  signature: string;
  timestamp: string;
  signerName: string;
}

interface GDPRConsents {
  dataProcessing: boolean;
  marketing: boolean;
  analytics: boolean;
  cookies: boolean;
  consents?: Array<{
    description: string;
    given: boolean;
    givenAt: string;
  }>;
}

const DOCUMENT_TYPE_LABELS = {
  [DocumentType.ID_CARD]: 'Pièce d\'identité',
  [DocumentType.DRIVER_LICENSE]: 'Permis de conduire',
};

const DOCUMENT_TYPE_DESCRIPTIONS = {
  [DocumentType.ID_CARD]: 'Carte nationale d\'identité ou passeport en cours de validité',
  [DocumentType.DRIVER_LICENSE]: 'Permis de conduire français ou international valide',
};

export default function ProfilPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // GDPR
  const [gdprLoading, setGdprLoading] = useState(false);
  const [consents, setConsents] = useState<GDPRConsents | null>(null);
  const [showAnonymizeDialog, setShowAnonymizeDialog] = useState(false);
  
  // Informations personnelles
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
    avatar: ''
  });

  // Paramètres de notifications
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    reservations: true,
    payments: true,
    promotions: true,
    maintenance: true,
    reminders: true
  });

  // Signatures sauvegardées
  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([
    {
      id: '1',
      documentName: 'Contrat de location - BMW X3',
      signature: '/api/placeholder/300/100',
      timestamp: '2024-01-15T10:30:00Z',
      signerName: user?.firstName + ' ' + user?.lastName || 'Utilisateur'
    },
    {
      id: '2', 
      documentName: 'État des lieux - Véhicule',
      signature: '/api/placeholder/300/100',
      timestamp: '2024-01-10T14:15:00Z',
      signerName: user?.firstName + ' ' + user?.lastName || 'Utilisateur'
    }
  ]);

  const loadNotificationSettings = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Ici on chargerait les paramètres depuis l'API
      // const response = await notificationApi.getSettings(user.id);
      // setNotificationSettings(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  }, [user?.id]);

  const loadDocuments = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setDocumentsLoading(true);
      const response = await documentApi.getDocuments(user.id);
      setDocuments(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast.error('Impossible de charger les documents');
    } finally {
      setDocumentsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadNotificationSettings();
    loadDocuments();
  }, [loadNotificationSettings, loadDocuments]);

  const saveProfile = async () => {
    try {
      setLoading(true);
      // Ici on sauvegarderait les données du profil
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation API
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSetting = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Paramètre mis à jour');
  };

  const deleteSignature = (id: string) => {
    setSavedSignatures(prev => prev.filter(sig => sig.id !== id));
    toast.success('Signature supprimée');
  };

  // Documents functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (maximum 10MB)');
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non autorisé. Utilisez JPG, PNG, WEBP ou PDF.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType || !user?.id) {
      toast.error('Veuillez sélectionner un fichier et un type de document');
      return;
    }

    try {
      setUploadingDocument(selectedDocumentType);

      // 1. Upload du fichier
      await documentApi.uploadDocument(selectedFile, selectedDocumentType, user.id);

      toast.success('Document uploadé avec succès !');
      setSelectedFile(null);
      setSelectedDocumentType(null);
      setShowUploadDialog(false);
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload du document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await documentApi.deleteDocument(documentId);
      toast.success('Document supprimé');
      loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du document');
    }
  };

  const getRequiredDocuments = () => {
    return Object.values(DocumentType)
      .map(type => {
        const existingDoc = documents.find(doc => doc.type === type);
        return {
          type,
          label: DOCUMENT_TYPE_LABELS[type as keyof typeof DOCUMENT_TYPE_LABELS],
          description: DOCUMENT_TYPE_DESCRIPTIONS[type as keyof typeof DOCUMENT_TYPE_DESCRIPTIONS],
          document: existingDoc,
          required: true
        };
      });
  };

  const getDocumentStats = () => {
    const requiredDocs = getRequiredDocuments();
    const uploaded = requiredDocs.filter(doc => doc.document).length;
    
    return {
      uploaded,
      total: requiredDocs.length,
      isComplete: uploaded === requiredDocs.length
    };
  };

  // GDPR Functions
  const loadUserConsents = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await gdprApi.getUserConsents(user.id);
      setConsents(response.data as GDPRConsents);
    } catch (error) {
      console.error('Erreur lors du chargement des consentements:', error);
    }
  }, [user?.id]);

  const handleExportData = async () => {
    if (!user?.id) return;
    
    try {
      setGdprLoading(true);
      await gdprApi.exportUserData(user.id);
      toast.success('Export des données démarré ! Le téléchargement va commencer.');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export des données');
    } finally {
      setGdprLoading(false);
    }
  };

  const handleAnonymizeData = async () => {
    if (!user?.id) return;
    
    try {
      setGdprLoading(true);
      await gdprApi.anonymizeUserData(user.id);
      toast.success('Données anonymisées avec succès. Vous serez déconnecté.');
      // Redirection vers la déconnexion
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error: unknown) {
      console.error('Erreur lors de l\'anonymisation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'anonymisation des données';
      toast.error(errorMessage);
    } finally {
      setGdprLoading(false);
      setShowAnonymizeDialog(false);
    }
  };

  useEffect(() => {
    loadUserConsents();
  }, [loadUserConsents]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Gérez vos informations personnelles, paramètres et préférences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="gdpr">Mes données</TabsTrigger>
        </TabsList>

        {/* Onglet Informations personnelles */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar et nom */}
                <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
                    <h3 className="text-xl font-semibold">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <Badge variant="outline" className="mt-1">
                      Compte vérifié
                    </Badge>
          </div>
        </div>
        
                <Separator />

                {/* Formulaire */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        {profileData.firstName || 'Non défini'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        {profileData.lastName || 'Non défini'}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="p-3 bg-muted rounded-md">
                      {profileData.email || 'Non défini'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="01 23 45 67 89"
                      />
                    ) : (
            <div className="p-3 bg-muted rounded-md">
                        {profileData.phone || 'Non défini'}
            </div>
                    )}
          </div>
          
          <div className="space-y-2">
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    {isEditing ? (
                      <Input
                        id="birthDate"
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                      />
                    ) : (
            <div className="p-3 bg-muted rounded-md">
                        {profileData.birthDate ? new Date(profileData.birthDate).toLocaleDateString('fr-FR') : 'Non défini'}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={saveProfile}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="documents" className="space-y-6">
          {/* Statistiques documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Statut de vérification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getDocumentStats().uploaded}</div>
                  <div className="text-sm text-muted-foreground">Documents uploadés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getDocumentStats().total}</div>
                  <div className="text-sm text-muted-foreground">Documents requis</div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(getDocumentStats().uploaded / getDocumentStats().total) * 100}%` }}
                ></div>
              </div>
              
              {!getDocumentStats().isComplete && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Vérification incomplète
                      </p>
                      <p className="text-sm text-yellow-700">
                        Vous devez télécharger et faire vérifier tous vos documents pour pouvoir louer des véhicules.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents requis */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mes documents</CardTitle>
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Télécharger un document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="documentType">Type de document</Label>
                      <Select value={selectedDocumentType || ''} onValueChange={(value) => setSelectedDocumentType(value as DocumentType)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type de document" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedDocumentType && DOCUMENT_TYPE_DESCRIPTIONS[selectedDocumentType as keyof typeof DOCUMENT_TYPE_DESCRIPTIONS] && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Requis :</strong> {DOCUMENT_TYPE_DESCRIPTIONS[selectedDocumentType as keyof typeof DOCUMENT_TYPE_DESCRIPTIONS]}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="file">Fichier</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={handleFileSelect}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formats acceptés : JPG, PNG, WEBP, PDF (max 10MB)
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleUpload}
                        disabled={!selectedFile || !selectedDocumentType || uploadingDocument !== null}
                      >
                        {uploadingDocument ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Upload en cours...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Télécharger
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {getRequiredDocuments().map((docInfo) => {
                    
                    return (
                      <div key={docInfo.type} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{docInfo.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {docInfo.description}
                            </div>
                            {docInfo.document && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Uploadé le {new Date(docInfo.document.uploadedAt).toLocaleDateString('fr-FR')}
                              </div>
                            )}
            </div>
          </div>
          
                        <div className="flex items-center space-x-2">
                          
                          {docInfo.document ? (
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline" asChild>
                                <a href={docInfo.document.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <a href={docInfo.document.fileUrl} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteDocument(docInfo.document!.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline">
                              Manquant
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Paramètres de notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Paramètres de notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choisissez comment vous souhaitez être notifié
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canaux de notification */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Canaux de notification</h4>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications par email
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications sur votre appareil
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">SMS</p>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications par SMS
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.sms}
                      onCheckedChange={(checked) => updateNotificationSetting('sms', checked)}
                    />
            </div>
          </div>
        </div>
        
              <Separator />

              {/* Types de notifications */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Types de notifications</h4>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">Réservations</p>
                        <p className="text-sm text-muted-foreground">
                          Confirmations, rappels et mises à jour
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.reservations}
                      onCheckedChange={(checked) => updateNotificationSetting('reservations', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Paiements</p>
                        <p className="text-sm text-muted-foreground">
                          Factures, paiements et remboursements
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.payments}
                      onCheckedChange={(checked) => updateNotificationSetting('payments', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Car className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="font-medium">Maintenance</p>
                        <p className="text-sm text-muted-foreground">
                          Maintenance véhicules et incidents
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.maintenance}
                      onCheckedChange={(checked) => updateNotificationSetting('maintenance', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="font-medium">Promotions</p>
                        <p className="text-sm text-muted-foreground">
                          Offres spéciales et nouveautés
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.promotions}
                      onCheckedChange={(checked) => updateNotificationSetting('promotions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="font-medium">Rappels</p>
          <p className="text-sm text-muted-foreground">
                          Rappels de retour et échéances
          </p>
        </div>
      </div>
                    <Switch
                      checked={notificationSettings.reminders}
                      onCheckedChange={(checked) => updateNotificationSetting('reminders', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Signatures */}
        <TabsContent value="signatures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5" />
                Mes signatures électroniques
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gérez vos signatures sauvegardées
              </p>
            </CardHeader>
            <CardContent>
              {savedSignatures.length > 0 ? (
                <div className="space-y-4">
                  {savedSignatures.map((signature) => (
                    <div key={signature.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{signature.documentName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Signé le {new Date(signature.timestamp).toLocaleDateString('fr-FR')} à{' '}
                            {new Date(signature.timestamp).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteSignature(signature.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      <SignatureDisplay 
                        signature={signature.signature}
                        timestamp={signature.timestamp}
                        signerName={signature.signerName}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileSignature className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune signature sauvegardée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet RGPD - Mes données */}
        <TabsContent value="gdpr" className="space-y-6">
          {/* Aperçu des droits RGPD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Vos droits sur vos données personnelles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Droit d'accès et de portabilité</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Téléchargez toutes vos données personnelles dans un format lisible.
                    </p>
                    <Button 
                      onClick={handleExportData}
                      disabled={gdprLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {gdprLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Export en cours...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Exporter mes données
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Droit à l'effacement</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Anonymisez définitivement vos données personnelles.
                    </p>
                    <Button 
                      onClick={() => setShowAnonymizeDialog(true)}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Anonymiser mes données
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium mb-4">Informations importantes</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                    <div>
                      <strong>Anonymisation :</strong> Cette action est irréversible. Vos données personnelles seront anonymisées mais vos réservations et factures seront conservées pour les obligations légales.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Export :</strong> Vous recevrez un fichier JSON contenant toutes vos données personnelles.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consentements */}
          {consents && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Mes consentements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consents.consents?.map((consent: { description: string; given: boolean; givenAt: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{consent.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {consent.given ? 'Accordé' : 'Refusé'} le {new Date(consent.givenAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <Badge variant={consent.given ? 'default' : 'secondary'}>
                        {consent.given ? 'Accordé' : 'Refusé'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dialogue de confirmation pour l'anonymisation */}
          <Dialog open={showAnonymizeDialog} onOpenChange={setShowAnonymizeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmer l'anonymisation des données
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">⚠️ Action irréversible</h4>
                  <p className="text-sm text-red-700">
                    Cette action va anonymiser définitivement toutes vos données personnelles :
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                    <li>Votre nom, email, téléphone seront anonymisés</li>
                    <li>Vos documents d'identité seront supprimés</li>
                    <li>Vos notifications seront anonymisées</li>
                    <li>Votre compte sera inaccessible</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">ℹ️ Données conservées</h4>
                  <p className="text-sm text-blue-700">
                    Pour des raisons légales et comptables, certaines données seront conservées de manière anonyme :
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                    <li>Historique des réservations (anonymisé)</li>
                    <li>Factures et paiements (anonymisés)</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAnonymizeDialog(false)}>
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleAnonymizeData}
                    disabled={gdprLoading}
                  >
                    {gdprLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Anonymisation...
                      </>
                    ) : (
                      'Confirmer l\'anonymisation'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
} 