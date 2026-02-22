import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApiAuth } from "@/hooks/useApiAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CUSTOM_ROUTES } from "@/custom-routes";
import { useMutation } from "@tanstack/react-query";
import { CreateForumPost } from "@/services/forum";
import { useForumPostList } from "@/hooks/village/useForumPost";
import { VILLAGES } from "@/config/villageConfig";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export default function ForumPage() {
  const { user } = useApiAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const { mutateAsync, isPending } = useMutation({
    mutationFn: CreateForumPost,
  });

  const {
    data: forumPosts,
    isLoading,
    refetch,
  } = useForumPostList({
    villageId:  VILLAGES.shivankhed.id,
    page: 1,
    size: 10,
  });

  const { content = [] } = forumPosts?.data || {};

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", comment.user_id)
            .maybeSingle();

          return { ...comment, profiles: profile };
        }),
      );

      setComments(commentsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    mutateAsync(
      {
        ...newPost,
        villageId: user.villageId,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Post created successfully",
          });
          setNewPost({ title: "", content: "", imageUrl: "" });
          setShowCreatePost(false);
          refetch();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleLikePost = async (postId: string, hasLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      });
      navigate(CUSTOM_ROUTES.AUTH);
      return;
    }

    try {
      if (hasLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user?.userId);
      } else {
        await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user?.userId });
      }
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      navigate(CUSTOM_ROUTES.AUTH);
      return;
    }

    if (!newComment.trim()) return;

    try {
      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user?.userId,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      fetchComments(postId);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleComments = (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
      setComments([]);
    } else {
      setSelectedPost(postId);
      fetchComments(postId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community Forum</h1>
        <p className="text-muted-foreground">
          Connect with your village community
        </p>
      </div>

      {user && (
        <Card className="p-6 mb-8">
          {!showCreatePost ? (
            <Button onClick={() => setShowCreatePost(true)} className="w-full">
              Create New Post
            </Button>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Post Title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
              />
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                rows={4}
              />
              <Input
                placeholder="Image URL (optional)"
                value={newPost.imageUrl}
                onChange={(e) =>
                  setNewPost({ ...newPost, imageUrl: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Button
                  disabled={
                    !newPost.title.trim() ||
                    !newPost.content.trim() ||
                    isPending
                  }
                  onClick={handleCreatePost}
                >
                  Post
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePost(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {!user && (
        <Card className="p-6 mb-8 text-center">
          <p className="mb-4">
            Please log in to create posts and interact with the community
          </p>
          <Button onClick={() => navigate(CUSTOM_ROUTES.AUTH)}>Log In</Button>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center">Loading posts...</p>
      ) : content.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No posts yet. Be the first to share something!
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {content.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarFallback>
                    {post.authorName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {post.authorName || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {user?.userId && post.userId === user.userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mt-2">{post.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="mt-4 rounded-lg max-w-full h-auto"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleLikePost(post.id, post.likedByCurrentUser || false)
                  }
                  className={post.likedByCurrentUser ? "text-red-500" : ""}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${post.likedByCurrentUser ? "fill-current" : ""}`}
                  />
                  {post.likesCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(post.id)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.commentsCount}
                </Button>
              </div>

              {selectedPost === post.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  {user && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddComment(post.id)
                        }
                      />
                      <Button onClick={() => handleAddComment(post.id)}>
                        Post
                      </Button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 bg-muted/50 p-3 rounded-lg"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.profiles?.full_name?.charAt(0) ||
                              comment.profiles?.email?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {comment.profiles?.full_name ||
                              comment.profiles?.email ||
                              "User"}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(comment.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
