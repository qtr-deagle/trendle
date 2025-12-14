import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Post {
  id: number;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  createdAt: string;
  isLiked: boolean;
  comments_list?: Comment[];
}

interface Comment {
  id: number;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar: string;
  };
  content: string;
  likes: number;
  createdAt: string;
}

interface PostDetailProps {
  useViewSwitching?: boolean;
}

const PostDetail = ({ useViewSwitching = false }: PostDetailProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        `/post/${id}`,
        {
          method: "GET",
        },
        token
      );

      if (!response.ok) {
        if (response.status === 404) {
          setError("Post not found");
        } else {
          setError("Failed to load post");
        }
        return;
      }

      const data = await response.json();
      if (data.success && data.post) {
        setPost(data.post);
        setIsLiked(data.post.isLiked || false);
        setLikeCount(data.post.likes);
      } else {
        setError("Failed to load post");
      }
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please log in to like posts");
      return;
    }

    try {
      const endpoint = isLiked ? `/post/${id}/unlike` : `/post/${id}/like`;
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        endpoint,
        {
          method: "POST",
        },
        token
      );

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        toast.success(isLiked ? "Post unliked" : "Post liked");
      } else {
        toast.error("Failed to update like");
      }
    } catch (err) {
      console.error("Error updating like:", err);
      toast.error("Failed to update like");
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please log in to comment");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      setSubmittingComment(true);
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        `/post/${id}/comment`,
        {
          method: "POST",
          body: JSON.stringify({
            content: commentText,
          }),
        },
        token
      );

      if (response.ok) {
        setCommentText("");
        toast.success("Comment added!");
        // Refresh post to get new comment
        fetchPostDetail();
      } else {
        toast.error("Failed to add comment");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const content = (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <div className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b border-border px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      ) : post ? (
        <div className="border-b border-border px-4 py-6">
          {/* Author Header */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="w-12 h-12 ring-2 ring-transparent hover:ring-primary transition-all cursor-pointer">
              <AvatarImage
                src={post.author.avatar}
                alt={post.author.username}
              />
              <AvatarFallback>
                {post.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <button className="hover:opacity-80 text-left">
                <p className="font-bold text-lg">{post.author.display_name}</p>
                <p className="text-muted-foreground">@{post.author.username}</p>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-xl leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Image */}
          {post.image && (
            <div className="mb-6 rounded-2xl overflow-hidden bg-muted">
              <img
                src={post.image}
                alt="Post content"
                className="w-full h-auto object-cover max-h-96"
              />
            </div>
          )}

          {/* Date and Stats */}
          <div className="pb-6 border-b border-border">
            <p className="text-muted-foreground text-sm mb-4">
              {formatDate(post.createdAt)}
            </p>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <span className="font-bold">{post.comments}</span>
                <span className="text-muted-foreground">Comments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{post.reposts}</span>
                <span className="text-muted-foreground">Reposts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{likeCount}</span>
                <span className="text-muted-foreground">Likes</span>
              </div>
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="flex justify-around py-6 border-b border-border">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 rounded-full"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-full"
            >
              <Repeat2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLike}
              className={cn(
                "flex-1 rounded-full",
                isLiked
                  ? "text-red-500 hover:bg-red-500/10"
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              )}
            >
              <Heart
                className="w-5 h-5"
                fill={isLiked ? "currentColor" : "none"}
              />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 rounded-full"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>

          {/* Add Comment Section */}
          {user && (
            <div className="py-6 border-b border-border">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                    }
                    alt={user.username}
                  />
                  <AvatarFallback>
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="mb-2 rounded-full"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || submittingComment}
                    className="ml-auto"
                  >
                    {submittingComment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Reply"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {post.comments_list && post.comments_list.length > 0 && (
            <div className="py-6">
              <h3 className="font-bold text-lg mb-6">Comments</h3>
              <div className="space-y-6">
                {post.comments_list.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={comment.author.avatar}
                        alt={comment.author.username}
                      />
                      <AvatarFallback>
                        {comment.author.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-2xl">
                        <p className="font-bold">
                          {comment.author.display_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{comment.author.username}
                        </p>
                        <p className="mt-2">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(comment.createdAt)}</span>
                        <button className="hover:underline">Like</button>
                        <span>{comment.likes} likes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {post.comments === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                No comments yet. Be the first!
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  if (useViewSwitching) {
    return content;
  }

  return <MainLayout onLogout={handleLogout}>{content}</MainLayout>;
};

export default PostDetail;
