import { GetFullFilePath } from "@/services/commonService";
import { GetVillageById, GetVillagesList } from "@/services/village-service";
import { useQuery } from "@tanstack/react-query";


export const useVillages = () => {
    return useQuery({
    queryKey: ["villages"],
    queryFn: GetVillagesList,
    select(data) {
      return data.data;
    },
  });
}

export const useGetVillageConfigById = (params: { id: string; language: string }) => {
  const { id, language: currentLanguage } = params;
  return useQuery({
      queryKey: ["villageConfig", id, currentLanguage],
      queryFn: () => GetVillageById({ id, language: currentLanguage }),
      enabled: Boolean(id) && Boolean(currentLanguage),
      select(data) {
        return data.data;
      },
    });
}


export const useGetFullFilePath = (filePath: string) => {
  return useQuery({
    queryKey: ["fullFilePath", filePath],
    queryFn: () => GetFullFilePath(filePath),
    enabled: Boolean(filePath),
    select(data) {
      return data.data
    },
  })
}