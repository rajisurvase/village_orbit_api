import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "../apiClient";

export interface MarketPrice {
  id: string
  villageId: string
  cropName: string
  price: number
  unit: string
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

interface PaginatedMarketPricesResponse {
  total: number;
  size: number;
  totalPages: number;
  page: number;
  prices: MarketPrice[];
}

export const GetAllMarketPrices = async ({page, size}: {page: number, size: number}) => {
    const response = await apiClient.get<ApiResponse<PaginatedMarketPricesResponse>>(apiConfig.endpoints.market_prices.list, true, {params : {page, size}});
    return response.data;
}