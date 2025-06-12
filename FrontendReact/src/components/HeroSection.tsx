
import React from 'react';
import { Shield, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

 const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Votre Assistant Santé
          <span className="text-primary block">Intelligent</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Comprenez vos droits en santé, naviguez dans les procédures médicales et accédez facilement aux services de santé publique et privée en Tunisie.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8">
            Commencer une conversation
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8">
            Uploader un document
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Droits Protégés</h3>
            <p className="text-muted-foreground">Connaissez vos droits en matière de santé publique</p>
          </div>
          <div className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Accompagnement</h3>
            <p className="text-muted-foreground">Assistance personnalisée pour vos démarches</p>
          </div>
          <div className="text-center">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Documents Simplifiés</h3>
            <p className="text-muted-foreground">Analyse automatique de vos documents médicaux</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
