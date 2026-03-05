import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "./apiClient";
import { AddServiceFormData } from "@/schema/service";

export type ServiceCategory = {
  id?: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  type?: "ADD" | "EDIT" | "DELETE";
};

export const GetAllCategories = async () => {
  const response = await apiClient.get<ApiResponse<ServiceCategory[]>>(
    apiConfig.endpoints.services.categories,
  );
  return response.data;
};

export const GetServiceById = async (serviceId: string) => {
  const response = await apiClient.get<ApiResponse<IService>>(
    apiConfig.endpoints.services.byId(serviceId),
  );
  return response.data;
};

export const CreateUpdateCategory = async (payload: ServiceCategory) => {
  const { id, type, ...rest } = payload;
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

export const DeleteCategory = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<null>>(
    `${apiConfig.endpoints.services.categories}/${id}`,
  );
  return response.data;
}


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

export const CreateService = async (
  payload: AddServiceFormData & { imageUrl: string; villageId: string, id?: string, },
) => {
  const { id, ...rest } = payload;
  if (id) {
    const response = await apiClient.put<ApiResponse<IService>>(
      `${apiConfig.endpoints.services.byId(id)}`,
      rest,
    );
    return response.data;
  } else {
    const response = await apiClient.post<ApiResponse<IService>>(
      apiConfig.endpoints.services.create,
      rest,
    );
    return response.data;
  }
};

export const DeleteService = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<null>>(
    `${apiConfig.endpoints.services.delete(id)}`,
  );
  return response.data;
}