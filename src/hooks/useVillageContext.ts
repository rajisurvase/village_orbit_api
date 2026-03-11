import { useContext } from "react";
import { VillageContext } from "@/context/VillageContextConfig";

export const useVillageContext = () => {
  const context = useContext(VillageContext);

  if (!context) {
    throw new Error("useVillageContext must be used within VillageProvider");
  }

  return {
    config: context.config,
    loading: context.loading,
    isPageVisible: context.isPageVisible,
  };
};
