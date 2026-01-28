import { createContext, ReactNode, useMemo } from "react";
import { VillageConfig } from "@/hooks/useVillageConfig";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { GetVillageById } from "@/services/village-service";
import { VILLAGES } from "@/config/villageConfig";

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
  villageName?: string;
};

export const VillageProvider = ({
  children,
  villageName = "Shivankhed",
}: VillageProviderProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  let id = VILLAGES.shivankhed.id;
  const { isPageVisible } = usePageVisibility();

  const { data: config, isLoading } = useQuery({
    queryKey: ["villageConfig", id, currentLanguage],
    queryFn: () => GetVillageById({ id, language: currentLanguage }),
    enabled: Boolean(id) && Boolean(currentLanguage),
    select(data) {
      return data.data;
    },
  });

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
