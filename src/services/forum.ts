import apiConfig from "@/config/apiConfig";
import apiClient, { ApiResponse } from "./apiClient";

export type ForumPostPayload  = {
  villageId: string;
  page: number;
  size: number;
  search?: string;
}

interface IComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  authorName : string | null;
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
  const response = await apiClient.get<ApiResponse< {totalPages: number, content: IForumPost[], size: number }>>(
    `${apiConfig.endpoints.posts.create}`,
    true,
    { params: payload },
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

export const actionForumPost = async ({
  postId,
  type,
}: {
  postId: string;
  type: "LIKE" | "DELETE";
}) => {

  const url = apiConfig.endpoints.posts[type === "DELETE" ? "delete" : "like"](postId);

  const actionMap = {
    LIKE: () => apiClient.post(url, true),
    DELETE: () => apiClient.delete(url, true),
  };

  const response = await actionMap[type]();
  return response.data;
};

export const addCommentToPost = async ({
  postId,
  content
}: {
  postId: string;
  content: string;
}) => {
  const response = await apiClient.post(
    apiConfig.endpoints.posts.comments(postId),
    { content },
    true,
  );
  return response.data;
}

export const GetAllCommentsForPost = async (payload: { postId: string, page: number, size: number }) => {
  const { postId, page, size } = payload;
  const response = await apiClient.get<ApiResponse<{ content: IComment[] }>>(
    apiConfig.endpoints.posts.comments(postId),
    true,
    { params: { page,  size } },
  );
  return response.data;
}