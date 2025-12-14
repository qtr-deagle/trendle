import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post/PostCard";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Posts", "Likes", "Following"];

const mockUserPosts = [
  {
    id: "1",
    author: {
      username: "lolaremedios",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lolaremedios",
    },
    content: "baka lamig lang yan i-lola remedios mo na yan",
    hashtags: ["health", "lolaremedios"],
    likes: 89,
    comments: 12,
    reposts: 5,
    createdAt: "2h ago",
  },
];

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <MainLayout onLogout={handleLogout}>
      <div className="max-w-2xl mx-auto">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-green-600 via-green-500 to-green-400 relative">
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
          >
            Edit appearance
          </Button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=lolaremedios" />
              <AvatarFallback>LR</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">@lolaremedios</h1>
              <p className="text-muted-foreground mt-2">
                baka lamig lang yan i-lola remedios mo na yan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isFollowing ? "outline" : "hero"}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Stats in sidebar */}
          <div className="flex gap-6 text-sm mb-6">
            <div>
              <span className="font-bold">1</span>
              <span className="text-muted-foreground ml-1">Posts</span>
            </div>
            <div>
              <span className="font-bold">2</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold">5</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 font-medium transition-all duration-200 relative",
                  activeTab === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {mockUserPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
