import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "./apiClient";

type ServiceCategory = {
  id?: string;
  name: string;
  display_order: number;
  isActive: boolean;
};

export const GetAllCategories = async () => {
  const response = await apiClient.get<ApiResponse<ServiceCategory[]>>(
    apiConfig.endpoints.services.categories,
  );
  return response.data;
};

export const CreateUpdateCategory = async (payload: ServiceCategory) => {
  const { id, ...rest } = payload;
  let response;
  if (id) {
    response = await apiClient.put<ApiResponse<ServiceCategory>>(
      `${apiConfig.endpoints.services.categories}/${id}`,
      rest,
    );
  } else {
    response = await apiClient.post<ApiResponse<ServiceCategory>>(
      apiConfig.endpoints.services.categories,
      rest,
    );
    return response.data;
  }
};

export interface IGetServiceListPayload {
  villageId: string;
  category?: string;
  search?: string;
  page: number;
  limit: number;
  sortOrder: "asc" | "desc";
}

export type IService = {
  id: string;
  villageId: string;
  category: string;
  name: string;
  owner: string;
  contact: string;
  address: string;
  hours: string;
  speciality: string;
  imageUrl: string;
};

export const GetAllServices = async (queryParams: IGetServiceListPayload) => {
  const response = await apiClient.get<
    ApiResponse<{
      services: IService[];
      total: number;
      limit: number;
      totalpages: number;
      page: number;
    }>
  >(apiConfig.endpoints.services.list, true, { params: queryParams });
  return response.data;
};

export const CreateService = async (payload: {}) => {
  const response = await apiClient.post<ApiResponse<any>>(
    apiConfig.endpoints.services.create,
    payload,
  );
  return response.data;
};
