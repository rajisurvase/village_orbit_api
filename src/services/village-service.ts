import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "./apiClient";
import { VillageConfig } from "@/hooks/useVillageConfig";

export type GetVillageByIdResponse = {
  id: string;
  villageName: string;
  villageId: string;
  language: string;
  configData: VillageConfig;
};

export const GetVillageById = async (payload: {
  id: string;
  language: string;
}) => {
  const { id, language } = payload;
  const village = await apiClient.get<ApiResponse<GetVillageByIdResponse>>(
    apiConfig.endpoints.villages.config(id),
    true,
    { params: { language } }
  );
  return village.data;
};

export const UpdateVillageConfigById = async (payload:GetVillageByIdResponse) => {
  const { id, language, villageId, ...configData } = payload;
  const response = await apiClient.put<ApiResponse<GetVillageByIdResponse>>(
    apiConfig.endpoints.villages.config(villageId),
    { ...configData, language }
  );
  return response.data;
};

export type Village = {
  id?: string;
  name: string;
  state: string;
  district: string;
  pincode: string;
  established?: string;
  area?: string;
  latitude?: string;
  longitude?: string;
  altitude?: string;
  description: string;
  vision: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const GetVillagesList = async () => {
  const villages = await apiClient.get<ApiResponse<Village[]>>(
    apiConfig.endpoints.villages.list,
    true
  );
  return villages.data;
};

export const CreateUpdateVillage = async (
  villageData: Omit<Village, "createdAt" | "updatedAt" | "isActive">
) => {
  const { id, ...rest } = villageData;
  let response;
  if (id) {
    response = await apiClient.put<ApiResponse<Village>>(
      apiConfig.endpoints.villages.byId(id),
      villageData
    );
  } else {
    response = await apiClient.post<ApiResponse<Village>>(
      apiConfig.endpoints.villages.list,
      rest
    );
  }
  return response.data;
};

export const DeleteVillage = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<null>>(
    apiConfig.endpoints.villages.byId(id)
  );
  return response.data;
};

export const UploadVillageFile = async ({ file, villageId }) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("villageId", villageId);

  const response = await apiClient.post<ApiResponse<{ fileUrl: string }>>(
    apiConfig.endpoints.villages.fileUpload,
    formData
  );
  return response.data;
};

export type PageVisibilityType = {
  id: string;
  villageName: string;
  pageKey: string;
  pageLabel: string;
  isVisible: boolean;
  villageId : string;
}

export const GetVillagePageVisibility = async (villageId : string) => {
  const response = await apiClient.get<ApiResponse<PageVisibilityType[]>>(
    apiConfig.endpoints.page_visibility.get(villageId),
    true
  );
  return response.data;
}

export const UpdateVillagePageVisibility = async (payload: {pageKey: string, villageId : string, isVisible: boolean}) => {
  const {pageKey, villageId, isVisible} = payload;
  const response = await apiClient.put<ApiResponse<PageVisibilityType>>(
    `${apiConfig.endpoints.page_visibility.get(villageId)}/${pageKey}`,
    { isVisible },
    true
  );
  return response.data;
}