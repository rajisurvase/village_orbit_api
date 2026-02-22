import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "./apiClient";

export type ForumPostPayload  = {
  villageId: string;
  page: number;
  size: number;
  search?: string;
}

type IForumPost ={
    id: string,
    authorName:  string,
    likesCount : number,
    createdAt: string,
    likedByCurrentUser: boolean,
    commentsCount : number,
    userId: string,
    title: string;
  content: string;
  imageUrl: string;
  villageId: string;
} 
export const GetAllForumsPosts = async (payload: ForumPostPayload) => {
  const { villageId, ...rest } = payload;
  const response = await apiClient.get<ApiResponse< {totalPages: number, content: IForumPost[], size: number }>>(
    `${apiConfig.endpoints.posts.create}/${villageId}`,
    true,
    { params: rest },
  );
  return response.data;
};

export const CreateForumPost = async ({
  title,
  content,
  imageUrl,
  villageId,
}: Pick<IForumPost, "title" | "content" | "imageUrl" | "villageId">) => {
  const response = await apiClient.post(
    `${apiConfig.endpoints.posts.create}/${villageId}`,
    { title, content, imageUrl },
  );
  return response.data;
};
