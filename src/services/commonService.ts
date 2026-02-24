import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "./apiClient"

export const GetFullFilePath = async(filePath: string) => {
    const res = await apiClient.get<ApiResponse<{url : string}>>(apiConfig.endpoints.file(filePath))
    return res.data;
}