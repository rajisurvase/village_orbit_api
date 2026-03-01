import { VillageContext } from "@/context/VillageContextConfig";
import { useContext, useEffect, useState } from "react";
import NotFound from "./NotFound";
import Services from "@/components/Services";
import SectionSkeleton from "@/components/ui/skeletons/SectionSkeleton";
import { supabase } from "@/integrations/supabase/client";

const ServicePage = () => {
  const { config, isPageVisible, loading } = useContext(VillageContext);
  const [services, setServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Fetch services from database
        const { data, error } = await supabase
          .from('village_services')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        // Group database services by category
        const dbGroupedServices = data?.reduce((acc: any, service: any) => {
          const category = service.category;
          if (!acc[category]) {
            acc[category] = {
              category: category,
              items: []
            };
          }
          acc[category].items.push({
            name: service.name,
            owner: service.owner,
            contact: service.contact,
            address: service.address,
            hours: service.hours,
            speciality: service.speciality,
            image: service.image_url
          });
          return acc;
        }, {});

        // Merge JSON-configured services with database services
        const jsonServices = config?.services || [];
        const mergedServices: any = {};

        // Add JSON services first (preserve original configuration)
        jsonServices.forEach((service: any) => {
          if (!mergedServices[service.category]) {
            mergedServices[service.category] = {
              category: service.category,
              items: []
            };
          }
          mergedServices[service.category].items.push(...service.items);
        });

        // Append database services (new entries)
        Object.keys(dbGroupedServices || {}).forEach((category) => {
          if (!mergedServices[category]) {
            mergedServices[category] = dbGroupedServices[category];
          } else {
            mergedServices[category].items.push(...dbGroupedServices[category].items);
          }
        });

        setServices(Object.values(mergedServices));
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setServicesLoading(false);
      }
    };

    if (config) {
      fetchServices();
    }
  }, [config]);

  if (loading || !config || servicesLoading) return <SectionSkeleton />;
  
  return isPageVisible("services") ? (
    <Services services={services} />
  ) : (
    <NotFound />
  );
};

export default ServicePage;
