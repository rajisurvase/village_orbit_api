import { GetVillagePageVisibility } from "@/services/village-service";
import {
  GetAllCategories,
  GetAllServices,
} from "@/services/village-service-category";
import { useQuery } from "@tanstack/react-query";

export const useServiceCategory = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: GetAllCategories,
    select(data) {
      return data.data;
    },
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: GetAllServices,
    select(data) {
      return data.data;
    },
  });
};


export const usePageVisibilityData = (enabled: boolean) => {
  return useQuery({
    queryKey: ["page-visibility"],
    queryFn: GetVillagePageVisibility,
    enabled,
    select(data) {
      return data.data;
    }
  });
}