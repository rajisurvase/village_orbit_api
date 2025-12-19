import { useContext } from "react";
import { VillageContext } from "@/context/VillageContextConfig";
import { usePageSEO } from "@/hooks/usePageSEO";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";
import GovtSchemes from "@/components/GovtSchemes";

const GovtSchemesPage = () => {
  const { config, loading } = useContext(VillageContext);

  usePageSEO({
    title: `Government Schemes - ${config?.village?.name || 'Village'} Gram Panchayat`,
    description: `Information about government welfare schemes, beneficiary programs, and official application links for ${config?.village?.name || 'Village'}. Access PM-KISAN, PMAY, Ayushman Bharat and more.`,
    keywords: ['government schemes', 'सरकारी योजना', 'शासकीय योजना', 'beneficiary schemes', 'लाभार्थी योजना', 'PM-KISAN', 'PMAY', 'Ayushman Bharat', 'welfare schemes']
  });

  if (loading || !config) return <SectionSkeleton />;

  return <GovtSchemes />;
};

export default GovtSchemesPage;
