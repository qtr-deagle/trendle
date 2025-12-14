<<<<<<< HEAD
import { useState } from "react";
import { useNavigate } from "react-router-dom";
=======
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
>>>>>>> 86d481d (Finalized Project)
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PostCard from "@/components/post/PostCard";
<<<<<<< HEAD
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = ["Posts", "Likes", "Following"];

=======
import FollowButton from "@/components/FollowButton";
import { apiCallWithAuth } from "@/lib/api";
import { MoreHorizontal, Loader2, UserMinus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs = ["Posts", "Likes", "Following"];

interface FollowingUser {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  followers?: number;
  following?: number;
}

>>>>>>> 86d481d (Finalized Project)
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
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
=======
  const { user } = useAuth();
  const { username } = useParams<{ username: string }>();
  const [activeTab, setActiveTab] = useState("Posts");
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const profileUsername = username || "lolaremedios";
  const displayName = profileUsername.charAt(0).toUpperCase() + profileUsername.slice(1);

  // Fetch following list
  useEffect(() => {
    const fetchFollowing = async () => {
      if (activeTab !== "Following") return;
      
      setLoadingFollowing(true);
      try {
        const token = localStorage.getItem("token");
        const response = await apiCallWithAuth(
          `/user/following`,
          { method: "GET" },
          token
        );

        if (response.ok) {
          const data = await response.json();
          setFollowingUsers(data.following || []);
        } else {
          setFollowingUsers([]);
        }
      } catch (error) {
        console.error("Error fetching following list:", error);
        setFollowingUsers([]);
      } finally {
        setLoadingFollowing(false);
      }
    };

    if (activeTab === "Following") {
      fetchFollowing();
    }
  }, [activeTab, profileUsername]);

  const handleUnfollow = async (targetUsername: string, targetId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        `/user/${targetUsername}/unfollow`,
        { method: "POST" },
        token
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unfollow");
      }

      setFollowingUsers((prev) => prev.filter((u) => u.id !== targetId));
      toast.success("Unfollowed successfully");
      
      // Dispatch custom event so RightSidebar and other components update instantly
      window.dispatchEvent(
        new CustomEvent("followStatusChanged", {
          detail: { username: targetUsername, isFollowing: false },
        })
      );
    } catch (error) {
      console.error("Unfollow error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to unfollow user");
    }
  };
>>>>>>> 86d481d (Finalized Project)

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
<<<<<<< HEAD
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=lolaremedios" />
              <AvatarFallback>LR</AvatarFallback>
=======
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUsername}`} />
              <AvatarFallback>{displayName[0]}</AvatarFallback>
>>>>>>> 86d481d (Finalized Project)
            </Avatar>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
<<<<<<< HEAD
              <h1 className="text-2xl font-bold">@lolaremedios</h1>
=======
              <h1 className="text-2xl font-bold">@{profileUsername}</h1>
>>>>>>> 86d481d (Finalized Project)
              <p className="text-muted-foreground mt-2">
                baka lamig lang yan i-lola remedios mo na yan
              </p>
            </div>
            <div className="flex items-center gap-2">
<<<<<<< HEAD
              <Button
                variant={isFollowing ? "outline" : "hero"}
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
=======
              <FollowButton targetUsername={profileUsername} />
>>>>>>> 86d481d (Finalized Project)
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
<<<<<<< HEAD
            {mockUserPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
=======
            {activeTab === "Posts" && (
              mockUserPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            )}

            {activeTab === "Following" && (
              <>
                {loadingFollowing ? (
                  <div className="text-center py-16">
                    <div className="inline-block">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mt-4">Loading following list...</p>
                  </div>
                ) : followingUsers.length > 0 ? (
                  <div className="space-y-4">
                    {followingUsers.map((followUser) => (
                      <div
                        key={followUser.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <Avatar className="w-14 h-14 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all">
                            <AvatarImage
                              src={
                                followUser.avatar_url ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${followUser.username}`
                              }
                              alt={followUser.display_name}
                            />
                            <AvatarFallback>{followUser.display_name?.[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold hover:text-primary transition-colors block truncate">
                              {followUser.display_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">@{followUser.username}</p>

                            {followUser.bio && (
                              <p className="text-sm text-foreground mt-2 line-clamp-1">{followUser.bio}</p>
                            )}

                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{followUser.followers} followers</span>
                              <span>{followUser.following} following</span>
                            </div>
                          </div>
                        </div>

                        {user?.username === profileUsername && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 ml-2 shrink-0"
                            onClick={() => handleUnfollow(followUser.username, followUser.id)}
                          >
                            <UserMinus className="w-4 h-4" />
                            <span className="hidden sm:inline">Following</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium text-foreground mb-2">Not following anyone yet</p>
                    <p className="text-muted-foreground">Follow users to see them here</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "Likes" && (
              <div className="text-center py-16 text-muted-foreground">
                No liked posts yet
              </div>
            )}
>>>>>>> 86d481d (Finalized Project)
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
