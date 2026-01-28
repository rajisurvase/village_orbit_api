import { MapPin, Phone, Mail, Clock, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import ContactForm from "./ContactForm";
import { Link, useSearchParams } from "react-router-dom";
import DocumentsModal from "./DocumentsModal";
import { useState, useEffect, useRef } from "react";

const Contact = ({contact, documents=[], quickServices=[]}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    name: string;
    description?: string;
    documents: string[];
    tips?: string[];
    buttonText?: string;
  }>({name: "", documents: []});
  const quickServicesRef = useRef<HTMLDivElement>(null);

  const handleApplyClick = (service: any) => {
    // Support both old documents format and new quickServices format
    setSelectedService({
      name: service.name || service.title || "",
      description: service.description,
      documents: service.documents || service.requiredDocuments || [],
      tips: service.tips,
      buttonText: service.buttonText
    });
    setIsDocsModalOpen(true);
  };

  // Handle auto-opening service modal from URL query param
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      const allServices = quickServices.length > 0 ? quickServices : documents;
      const matchedService = allServices.find((service: any) => 
        service.id === serviceParam || 
        (service.title || service.name || "").toLowerCase().replace(/\s+/g, '-') === serviceParam
      );
      
      if (matchedService) {
        // Scroll to quick services section first
        setTimeout(() => {
          quickServicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Then open the modal after a short delay
          setTimeout(() => {
            handleApplyClick(matchedService);
          }, 500);
        }, 300);
      }
    }
  }, [searchParams, quickServices, documents]);

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
         <h2 className="text-4xl font-bold mb-4 text-gradient">
  {t("contact.title")}
</h2>
<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
  {t("contact.description")}
</p>

        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 animate-slide-up">
            {/* Office Information */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <MapPin className="h-6 w-6 text-primary" />
                  {t("contact.office")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-foreground leading-relaxed">
                    {contact.office.address}
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover-lift transition-all duration-300 animate-fade-in">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('contact.phone2')}</p>
                      <a 
                        href={`tel:${contact.office.phone}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {contact.office.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover-lift transition-all duration-300 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('contact.email2')}</p>
                      <p className="text-muted-foreground">{contact.office.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover-lift transition-all duration-300 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('contact.officeHours')}</p>
                      <p className="text-muted-foreground">{contact.office.hours}</p>
                    </div>
                  </div>
                </div>
                <Link to="https://www.google.com/maps/place/ShivanKhed,+Maharashtra+413514/@18.5749231,77.0643175" target="_blank" >
                <Button className="w-full transition-all duration-300 hover:scale-[1.02] animate-fade-in" size="lg" style={{ animationDelay: "300ms" }}>
                  <MapPin className="h-5 w-5 mr-2" />
                  {t('contact.getDirections')}
                </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <AlertCircle className="h-6 w-6 text-destructive" />
              {t('contact.getDirections')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-destructive/5 border border-destructive/20 hover-lift transition-all duration-300 animate-fade-in">
                    <p className="text-3xl mb-2">🚔</p>
                    <p className="font-semibold">{t('contact.police')}</p>
                    <a 
                      href={`tel:${contact.emergency.police}`}
                      className="text-destructive font-mono text-lg hover:underline block"
                    >
                      {contact.emergency.police}
                    </a>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20 hover-lift transition-all duration-300 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <p className="text-3xl mb-2">🚒</p>
                    <p className="font-semibold">{t('contact.fire')}</p>
                    <a 
                      href={`tel:${contact.emergency.fire}`}
                      className="text-warning font-mono text-lg hover:underline block"
                    >
                      {contact.emergency.fire}
                    </a>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20 hover-lift transition-all duration-300 animate-fade-in" style={{ animationDelay: "200ms" }}>
                    <p className="text-3xl mb-2">🚑</p>
                    <p className="font-semibold">{t('contact.ambulance')}</p>
                    <a 
                      href={`tel:${contact.emergency.ambulance}`}
                      className="text-success font-mono text-lg hover:underline block"
                    >
                      {contact.emergency.ambulance}
                    </a>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/20 hover-lift transition-all duration-300 animate-fade-in" style={{ animationDelay: "300ms" }}>
                    <p className="text-3xl mb-2">📞</p>
                    <p className="font-semibold">{t('contact.localEmergency')}</p>
                    <a 
                      href={`tel:${contact.emergency.local_emergency}`}
                      className="text-accent font-mono text-sm hover:underline block"
                    >
                      {contact.emergency.local_emergency}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="text-2xl">{t('contact.sendMessage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm villageId={contact?.villageId} />
              </CardContent>
            </Card>

            {/* Quick Services */}
            {(quickServices.length > 0 || documents.length > 0) && (
              <Card ref={quickServicesRef} id="quick-services" className="card-elegant mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    Quick Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {/* Use quickServices if available, fallback to old documents format */}
                    {(quickServices.length > 0 ? quickServices : documents).map((service: any, index: number) => (
                      <div 
                        key={service.id || service.name || index}
                        onClick={() => handleApplyClick(service)}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover-lift cursor-pointer transition-all duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium block">{service.title || service.name || ""}</span>
                          {service.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">{service.description}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors ml-2">
                          {service.buttonText || t('contact.apply')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <DocumentsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
        serviceName={selectedService.name}
        description={selectedService.description}
        documents={selectedService.documents}
        tips={selectedService.tips}
        buttonText={selectedService.buttonText}
      />
    </section>
  );
};

export default Contact;