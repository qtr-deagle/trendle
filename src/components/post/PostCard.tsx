import { MessageCircle, Repeat2, Heart, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PostCardProps {
  id: string;
  author: {
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
}: PostCardProps) => {
  return (
    <article className="glass-card p-6 animate-fade-in card-hover">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to={`/profile/${author.username}`} className="flex items-center gap-3 group">
          <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-primary transition-all">
            <AvatarImage src={author.avatar} alt={author.username} />
            <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {author.username}
          </span>
        </Link>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          •••
        </Button>
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

      {/* Interactions */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <Button variant="interaction" size="sm" className="gap-2">
          <MessageCircle className="w-5 h-5" />
          <span>{comments}</span>
        </Button>
        <Button variant="interaction" size="sm" className="gap-2">
          <Repeat2 className="w-5 h-5" />
          <span>{reposts}</span>
        </Button>
        <Button variant="interaction" size="sm" className="gap-2">
          <Heart className="w-5 h-5" />
          <span>{likes}</span>
        </Button>
        <Button variant="interaction" size="sm" className="ml-auto">
          <Share className="w-5 h-5" />
        </Button>
      </div>
    </article>
  );
};

export default PostCard;
