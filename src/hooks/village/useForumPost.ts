import { ForumPostPayload, GetAllForumsPosts } from "@/services/forum"
import { useQuery } from "@tanstack/react-query"



export const useForumPostList = (payload : ForumPostPayload)=> {
    return useQuery({
        queryKey : ["forumPosts", payload],
        queryFn : ()=> GetAllForumsPosts(payload),
        enabled : !!payload.villageId
    })
}