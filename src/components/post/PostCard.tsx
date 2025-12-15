import { useState } from "react";
import { MessageCircle, Repeat2, Heart, Share, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  id: string;
  author: {
    id: number;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  hashtags: string[];
  likes: number;
  comments: number;
  reposts: number;
  createdAt: string;
  isLiked?: boolean;
  matchingFollowers?: Array<{
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    matching_tags: string[];
  }>;
  onDelete?: () => void;
}

const PostCard = ({
  id,
  author,
  content,
  image,
  hashtags,
  likes,
  comments,
  reposts,
  isLiked = false,
  matchingFollowers,
  onDelete,
}: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const isOwner = user?.id === author.id;

  console.log('[PostCard] Received hashtags:', hashtags, 'Length:', hashtags?.length);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in");
        return;
      }

      const response = await apiCallWithAuth(
        "/post",
        {
          method: "DELETE",
          body: JSON.stringify({ post_id: id }),
        },
        token
      );

      if (!response.ok) throw new Error("Failed to delete post");

      toast.success("Post deleted successfully");
      onDelete?.();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in");
        return;
      }

      const endpoint = liked ? `/post/${id}/unlike` : `/post/${id}/like`;
      const response = await apiCallWithAuth(
        endpoint,
        { method: "POST" },
        token
      );

      if (!response.ok) throw new Error("Failed to like post");

      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    } catch (err) {
      console.error("Like error:", err);
      toast.error("Failed to like post");
    }
  };

  return (
    <article className="glass-card p-6 animate-fade-in card-hover">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to={`/profile/${author.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-primary transition-all">
            <AvatarImage src={author.avatar} alt={author.username} />
            <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {author.username}
          </span>
        </Link>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground text-lg leading-relaxed">{content}</p>
      </div>

      {/* Image */}
      {image && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <img
            src={image}
            alt="Post content"
            className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {hashtags.map((tag) => (
            <Link
              key={tag}
              to={`/explore?tag=${tag}`}
              className="hashtag text-sm"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Matching Followers */}
      {matchingFollowers && matchingFollowers.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {matchingFollowers.length} of your follower{matchingFollowers.length !== 1 ? 's' : ''} like{matchingFollowers.length !== 1 ? '' : 's'} this content:
          </p>
          <div className="flex flex-wrap gap-2">
            {matchingFollowers.slice(0, 5).map((follower) => (
              <Link
                key={follower.id}
                to={`/user/${follower.username}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background rounded-full hover:bg-primary/10 transition-colors group"
                title={`${follower.display_name}\nInterests: ${follower.matching_tags.join(', ')}`}
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={follower.avatar} alt={follower.display_name} />
                  <AvatarFallback>{follower.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                  {follower.display_name.split(' ')[0]}
                </span>
              </Link>
            ))}
            {matchingFollowers.length > 5 && (
              <div className="flex items-center px-2.5 py-1.5 text-xs text-muted-foreground">
                +{matchingFollowers.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactions */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <Button
          variant="interaction"
          size="sm"
          className="gap-2"
          onClick={() => navigate(`/post/${id}`)}
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments}</span>
        </Button>
        <Button variant="interaction" size="sm" className="gap-2">
          <Repeat2 className="w-5 h-5" />
          <span>{reposts}</span>
        </Button>
        <Button
          variant="interaction"
          size="sm"
          className={`gap-2 ${liked ? "text-red-500" : ""}`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </Button>
        <Button variant="interaction" size="sm" className="ml-auto">
          <Share className="w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default PostCard;
