import { createContext, ReactNode, useMemo } from "react";
import { VillageConfig } from "@/hooks/useVillageConfig";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useTranslation } from "react-i18next";
import { VILLAGES } from "@/config/villageConfig";
import { useGetVillageConfigById } from "@/hooks/useVillagehooks";

type VillageContextType = {
  config: VillageConfig | null;
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
  const { isPageVisible } = usePageVisibility();

  const { data: config, isLoading } = useGetVillageConfigById({
    id, 
    language: currentLanguage
  })

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
