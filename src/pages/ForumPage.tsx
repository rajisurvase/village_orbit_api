import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useApiAuth } from "@/hooks/useApiAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePageSEO } from "@/hooks/usePageSEO";
import { CUSTOM_ROUTES } from "@/custom-routes";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
  likes_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
}

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
  usePageSEO({
    title: "Community Forum",
    description: "Join village discussions and connect with community members",
  });
  
  const { user } = useApiAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", image_url: "" });
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", post.user_id)
            .maybeSingle();
          return { ...post, profiles: profile };
        })
      );

      // Fetch likes and comments count for each post
      const postsWithStats = await Promise.all(
        postsWithProfiles.map(async (post) => {
          const [likesResult, commentsResult, userLikeResult] = await Promise.all([
            supabase.from("post_likes").select("id", { count: "exact" }).eq("post_id", post.id),
            supabase.from("comments").select("id", { count: "exact" }).eq("post_id", post.id),
            user?.userId ? supabase.from("post_likes").select("id").eq("post_id", post.id).eq("user_id", user.userId).maybeSingle() : Promise.resolve({ data: null }),
          ]);

          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            user_has_liked: !!userLikeResult.data,
          };
        })
      );

      setPosts(postsWithStats);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        })
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
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      navigate(CUSTOM_ROUTES.AUTH);
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("posts").insert({
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        image_url: newPost.image_url.trim() || null,
        user_id: user?.userId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      setNewPost({ title: "", content: "", image_url: "" });
      setShowCreatePost(false);
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user?.userId);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user?.userId });
      }
      fetchPosts();
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
      fetchPosts();
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
      fetchPosts();
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
        <p className="text-muted-foreground">Connect with your village community</p>
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
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
              />
              <Input
                placeholder="Image URL (optional)"
                value={newPost.image_url}
                onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreatePost}>Post</Button>
                <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {!user && (
        <Card className="p-6 mb-8 text-center">
          <p className="mb-4">Please log in to create posts and interact with the community</p>
          <Button onClick={() => navigate(CUSTOM_ROUTES.AUTH)}>Log In</Button>
        </Card>
      )}

      {loading ? (
        <p className="text-center">Loading posts...</p>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar>
                  <AvatarFallback>
                    {post.profiles?.full_name?.charAt(0) || post.profiles?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{post.profiles?.full_name || post.profiles?.email || "User"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {user?.userId && post.user_id === user.userId && (
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
                  {post.image_url && (
                    <img
                      src={post.image_url}
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
                  onClick={() => handleLikePost(post.id, post.user_has_liked || false)}
                  className={post.user_has_liked ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 mr-1 ${post.user_has_liked ? "fill-current" : ""}`} />
                  {post.likes_count}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments_count}
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
                        onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      />
                      <Button onClick={() => handleAddComment(post.id)}>Post</Button>
                    </div>
                  )}
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-muted/50 p-3 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.profiles?.full_name?.charAt(0) || comment.profiles?.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {comment.profiles?.full_name || comment.profiles?.email || "User"}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
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
