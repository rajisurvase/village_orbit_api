import { createContext, ReactNode, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { VillageConfigData } from "@/config/villageConfig";
import { useGetVillageConfigById, useVillages } from "@/hooks/useVillagehooks";
import { usePageVisibilityData } from "@/hooks/village/useService";
import { getSubdomainSlug, createSlugFromName } from "@/lib/subdomainUtils";
import { Village } from "@/services/village-service";

type VillageContextType = {
  config: VillageConfigData | null;
  loading: boolean;
  isPageVisible: (pageKey: string) => boolean;
};

export const VillageContext = createContext<VillageContextType>({
  config: null,
  loading: false,
  isPageVisible: () => true,
});

type VillageProviderProps = {
  children: ReactNode;
};

export const VillageProvider = ({
  children
}: VillageProviderProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // Fetch list of villages to map subdomain to village ID
  const { data: villagesList, isLoading: villagesListLoading } = useVillages();
  const [currentVillageId, setCurrentVillageId] = useState<string>("");

  // Detect village based on subdomain when villages list is loaded
  useEffect(() => {
    if (!villagesList || villagesList.length === 0) return;

    const subdomainSlug = getSubdomainSlug();
    
    if (subdomainSlug) {
      // Find village by slug match
      const matchingVillage = villagesList.find((v: Village) => {
        const villageSlug = createSlugFromName(v.name);
        return villageSlug === subdomainSlug;
      });

      if (matchingVillage && matchingVillage.id) {
        setCurrentVillageId(matchingVillage.id);
      }
    }
  }, [villagesList]);

  const{ data: pageVisibilityData} = usePageVisibilityData(true, currentVillageId)

  const { data: config, isLoading } = useGetVillageConfigById({
    id: currentVillageId, 
    language: currentLanguage
  })

const isPageVisible = (pageKey: string): boolean => {
  return pageVisibilityData?.some(
    (page) =>  page.pageKey === pageKey && page.isVisible
  );
};

  const value = useMemo(
    () => ({
      config: {
        ...config?.configData
      },
      loading: isLoading || villagesListLoading,
      isPageVisible,
    }),
    [JSON.stringify(config), villagesListLoading, currentVillageId]
  );

  return (
    <VillageContext.Provider
      value={value}
    >
      {children}
    </VillageContext.Provider>
  );
};
