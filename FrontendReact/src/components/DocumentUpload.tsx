
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ExtractedInfo {
  patientName: string;
  dateOfBirth: string;
  diagnosis: string;
  treatment: string;
  doctor: string;
  date: string;
}

export const DocumentUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulation du processus d'upload et d'extraction
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Simulation de données extraites
          setTimeout(() => {
            setExtractedInfo({
              patientName: 'Ahmed Ben Salem',
              dateOfBirth: '15/03/1985',
              diagnosis: 'Hypertension artérielle',
              treatment: 'Amlodipine 10mg, Lisinopril 5mg',
              doctor: 'Dr. Fatma Khelifi',
              date: '12/06/2024',
            });
            setIsProcessing(false);
            toast({
              title: 'Document traité avec succès',
              description: 'Les informations ont été extraites automatiquement.',
            });
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <section id="upload" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Upload de Documents</h2>
        
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Uploader votre document</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Glissez votre document ici ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Formats supportés: PDF, JPG, PNG, DOCX
                </p>
                <Button variant="outline">
                  Choisir un fichier
                </Button>
              </div>
              
              <input
                id="fileInput"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={handleChange}
              />
              
              {isProcessing && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Traitement en cours...</span>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Informations Extraites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {extractedInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nom du patient</label>
                      <p className="text-sm font-semibold">{extractedInfo.patientName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date de naissance</label>
                      <p className="text-sm font-semibold">{extractedInfo.dateOfBirth}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Diagnostic</label>
                      <p className="text-sm font-semibold">{extractedInfo.diagnosis}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Médecin</label>
                      <p className="text-sm font-semibold">{extractedInfo.doctor}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Traitement</label>
                    <p className="text-sm font-semibold">{extractedInfo.treatment}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date du document</label>
                    <p className="text-sm font-semibold">{extractedInfo.date}</p>
                  </div>
                  <Button className="w-full mt-4">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le rapport
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun document uploadé. Les informations extraites apparaîtront ici.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
export default DocumentUpload;
