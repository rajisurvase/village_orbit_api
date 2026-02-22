import { createContext, ReactNode, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { VillageConfigData, VILLAGES } from "@/config/villageConfig";
import { useGetVillageConfigById } from "@/hooks/useVillagehooks";
import { usePageVisibilityData } from "@/hooks/village/useService";

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

  let id = VILLAGES.shivankhed.id;
  const{data: pageVisibilityData} = usePageVisibilityData(true, id)


  const { data: config, isLoading } = useGetVillageConfigById({
    id, 
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
      loading: isLoading,
      isPageVisible,
    }),
    [JSON.stringify(config)]
  );

  return (
    <VillageContext.Provider
      value={value}
    >
      {children}
    </VillageContext.Provider>
  );
};
