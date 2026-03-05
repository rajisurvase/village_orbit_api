import { VillageContext } from "@/context/VillageContextConfig";
import { useContext } from "react";
import NotFound from "./NotFound";
import Services from "@/components/Services";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";

const ServicePage = () => {
  const { config, isPageVisible, loading } = useContext(VillageContext);

  if (loading) return <SectionSkeleton />;

  return isPageVisible("services") ? (
    <Services services={config.services} />
  ) : (
    <NotFound />
  );
};

export default ServicePage;
