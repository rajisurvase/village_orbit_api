import Contact from "@/components/Contact";
import { VillageContext } from "@/context/VillageContextConfig";
import { useContext } from "react";
import NotFound from "./NotFound";
import { usePageSEO } from "@/hooks/usePageSEO";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";

const ContactUsPage = () => {
  const { config, isPageVisible, loading } = useContext(VillageContext);

  usePageSEO({
    title: `Contact Us - ${config?.village.name || 'Village'} Gram Panchayat`,
    description: `Contact ${config?.village.name || 'Village'} Gram Panchayat. Office address, phone numbers, email, working hours, and emergency contact information.`,
    keywords: ['contact', 'gram panchayat office', 'phone number', 'email', 'address', 'emergency contacts']
  });

  if (loading || !config) return <SectionSkeleton />;
  
  return isPageVisible("contact") ? (
    <Contact 
      contact={config.contact} 
      documents={config.documents}
      quickServices={config.quickServices || []}
      villageId={config.villageId!}
    />
  ) : (
    <NotFound />
  );
};

export default ContactUsPage;
