
import React from 'react';
import { Hospital, Phone, MapPin, Clock, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HealthServices = () => {
  const services = [
    {
      icon: Hospital,
      title: 'Hôpitaux Publics',
      description: 'Trouvez les hôpitaux publics près de chez vous',
      action: 'Localiser',
    },
    {
      icon: Phone,
      title: 'Urgences Médicales',
      description: 'Numéros d\'urgence et premiers secours',
      action: 'Contacter',
    },
    {
      icon: FileText,
      title: 'Procédures Administratives',
      description: 'Guide des démarches administratives en santé',
      action: 'Consulter',
    },
    {
      icon: Users,
      title: 'Droits des Patients',
      description: 'Connaissez vos droits en tant que patient',
      action: 'Découvrir',
    },
    {
      icon: MapPin,
      title: 'Pharmacies de Garde',
      description: 'Trouvez les pharmacies ouvertes près de vous',
      action: 'Localiser',
    },
    {
      icon: Clock,
      title: 'Prendre RDV',
      description: 'Système de prise de rendez-vous en ligne',
      action: 'Réserver',
    },
  ];

  return (
    <section id="services" className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Services de Santé</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <service.icon className="w-6 h-6 text-primary" />
                  <span className="text-lg">{service.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {service.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold mb-4">Besoin d'aide urgente ?</h3>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-red-600 hover:bg-red-700">
              <Phone className="w-5 h-5 mr-2" />
              Urgences: 190
            </Button>
            <Button variant="outline" size="lg">
              <Hospital className="w-5 h-5 mr-2" />
              SAMU: 71 348 648
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HealthServices;
