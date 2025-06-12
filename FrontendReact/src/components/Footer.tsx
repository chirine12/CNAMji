
import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

 const Footer = () => {
  return (
    <footer className="bg-secondary/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-bold">CNAMji</h3>
            </div>
            <p className="text-muted-foreground">
              Votre assistant intelligent pour naviguer dans le système de santé tunisien.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Assistant Chatbot</li>
              <li>Analyse de Documents</li>
              <li>Localisation Services</li>
              <li>Prise de RDV</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>Droits des Patients</li>
              <li>Procédures Médicales</li>
              <li>Urgences Médicales</li>
              <li>FAQ</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@cnamji.tn</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+216 70 123 456</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 CNAMji. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
