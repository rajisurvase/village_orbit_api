import { useContext, memo } from "react";
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from 'react-i18next';
import { VillageContext } from "@/context/VillageContextConfig";

const Footer = () => {
  const { config } = useContext(VillageContext);
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  if (!config?.village || !config?.contact?.office) return null;
  
  const { village, contact } = config;

  const quickLinks = [
    { name: t('footer.aboutVillage'), href: "/about#map" },
    { name: t('footer.panchayatMembers'), href: "/panchayat" },
    { name: t('footer.governmentSchemes'), href: "/govt-schemes" },
    { name: t('footer.developmentWorks'), href: "/Development" },
  ];

  const services = [
    { name: t('footer.birthCertificate'), href: "/contact-us?service=birth-certificate" },
    { name: t('footer.deathCertificate'), href: "/contact-us?service=death-certificate" },
    { name: t('footer.propertyTax'), href: "/contact-us?service=property-tax" },
   // { name: t('footer.rtiApplication'), href: "#contact" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground safe-area-bottom">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Village Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold">
                  शि
                </div>
                <div>
                  <h3 className="text-xl font-bold">{village.name}</h3>
                  <p className="text-primary-foreground/80 text-sm">
                    {village.state}, {village.district}
                  </p>
                </div>
              </div>
              <p className="text-primary-foreground/70 leading-relaxed text-sm">
                {t('footer.aboutDescription')}
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">{t('footer.followUs')}</h4>
              <div className="flex gap-2">
                {[
                  { icon: Facebook, href: "https://www.facebook.com/groups/673158324075461" },
              
                  { icon: Instagram, href: "https://www.instagram.com/shivankhedkhurd/" },
                  { icon: Youtube, href: "https://youtube.com/@shivankhedkhurd?si=LH83a-cus6k1K-IS" }
                ].map((social, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    asChild
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <social.icon className="h-5 w-5" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.contactInfo')}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-primary-foreground/70 flex-shrink-0" />
                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  Gram Panchayat Office, {village.name}<br />
                  {village.district}, {village.state} - {village.pincode}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-foreground/70 flex-shrink-0" />
                <a
                  href={`tel:${contact.office.phone}`}
                  className="text-primary-foreground/70 hover:text-primary-foreground text-sm"
                >
                  {contact.office.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-foreground/70 flex-shrink-0" />
                <a
                  href={`mailto:${contact.office.email}`}
                  className="text-primary-foreground/70 hover:text-primary-foreground text-sm"
                >
                  {contact.office.email}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary-foreground/70 flex-shrink-0" />
                <a
                  href={'https://villageorbit.in/'}
                  className="text-primary-foreground/70 hover:text-primary-foreground text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {contact.office.website}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-primary-foreground/20" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-center md:text-left">
            <p className="text-primary-foreground/70 text-xs sm:text-sm">
              {t('footer.copyright', { year: currentYear, village: village.name })}
            </p>
            <p className="text-primary-foreground/50 text-[10px] sm:text-xs mt-1">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
            <a
              href="#privacy"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              {t('footer.privacyPolicy')}
            </a>
            <a
              href="#terms"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              {t('footer.termsOfService')}
            </a>
            <a
              href="#rti"
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              {t('footer.rtiGuidelines')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);