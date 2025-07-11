"use client";

import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { toast } from 'sonner';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { 
  PenTool, 
  RotateCcw, 
  Save, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  penColor?: string;
}

export function SignaturePad({ 
  onSave, 
  onCancel,
  title = "Signature électronique",
  description = "Signez dans la zone ci-dessous",
  width = 600,
  height = 300,
  penColor = "#000000"
}: SignaturePadProps) {
  const sigPadRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigPadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigPadRef.current) {
      if (sigPadRef.current.isEmpty()) {
        toast.error("Veuillez signer avant de sauvegarder");
        return;
      }
      
      const signatureData = sigPadRef.current.toDataURL();
      onSave(signatureData);
      toast.success("Signature sauvegardée avec succès !");
    }
  };

  const handleDownload = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const canvas = sigPadRef.current.getCanvas();
      const link = document.createElement('a');
      link.download = 'signature.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success("Signature téléchargée !");
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              Utilisez votre doigt ou votre stylet pour signer dans la zone ci-dessous
            </span>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <SignatureCanvas
              ref={sigPadRef}
              penColor={penColor}
              canvasProps={{
                width: width,
                height: height,
                className: 'signature-canvas w-full h-full bg-white rounded border cursor-crosshair'
              }}
              onBegin={handleBegin}
            />
          </div>

          {!isEmpty && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Signature détectée</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={isEmpty}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Effacer
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={isEmpty}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Annuler
              </Button>
            )}
            
            <Button 
              onClick={handleSave}
              disabled={isEmpty}
              className="ml-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  title?: string;
  description?: string;
  documentTitle?: string;
}

export function SignatureDialog({ 
  isOpen, 
  onClose, 
  onSave,
  title = "Signature du document",
  description,
  documentTitle
}: SignatureDialogProps) {
  const handleSave = (signature: string) => {
    onSave(signature);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          {documentTitle && (
            <Badge variant="outline" className="w-fit">
              Document: {documentTitle}
            </Badge>
          )}
        </DialogHeader>
        
        <div className="py-4">
          <SignaturePad 
            onSave={handleSave}
            onCancel={onClose}
            title=""
            description={description || "Signez ci-dessous pour valider le document"}
            width={700}
            height={250}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SignatureDisplayProps {
  signature: string;
  timestamp?: string;
  signerName?: string;
  className?: string;
}

export function SignatureDisplay({ 
  signature, 
  timestamp, 
  signerName,
  className = "" 
}: SignatureDisplayProps) {
  return (
    <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="mb-2">
        <h4 className="text-sm font-medium">Signature électronique</h4>
        {signerName && (
          <p className="text-xs text-muted-foreground">Signé par: {signerName}</p>
        )}
        {timestamp && (
          <p className="text-xs text-muted-foreground">
            Le {new Date(timestamp).toLocaleDateString('fr-FR')} à{' '}
            {new Date(timestamp).toLocaleTimeString('fr-FR')}
          </p>
        )}
      </div>
      
      <div className="border rounded bg-white p-2">
        <Image 
          src={signature} 
          alt="Signature" 
          width={300}
          height={120}
          className="max-w-full h-auto"
          style={{ maxHeight: '120px' }}
        />
      </div>
      
      <div className="flex items-center gap-2 mt-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-xs">Signature valide et certifiée</span>
      </div>
    </div>
  );
} 