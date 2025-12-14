import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PostCard from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Edit, 
  Share,
  Grid,
  Heart,
  Users,
  Upload,
  Tag,
  UserPlus,
  UserMinus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs = [
  { id: "posts", label: "Posts", icon: Grid },
  { id: "likes", label: "Likes", icon: Heart },
  { id: "following", label: "Following", icon: Users },
  { id: "tags", label: "Your Tags", icon: Tag },
];

interface FollowingUser {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
}

interface AccountProps {
  useViewSwitching?: boolean;
}

const Account = ({ useViewSwitching }: AccountProps) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [userAvatar, setUserAvatar] = useState(user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`);
  const [uploading, setUploading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar when user changes
  useEffect(() => {
    if (user?.avatar) {
      setUserAvatar(user.avatar);
    }
  }, [user?.avatar]);

  // Fetch following users
  useEffect(() => {
    const fetchFollowing = async () => {
      if (activeTab !== "following") return;
      
      setLoadingFollowing(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/user/${user?.username}/following`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFollowingUsers(data.following || []);
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      } finally {
        setLoadingFollowing(false);
      }
    };

    if (activeTab === "following") {
      fetchFollowing();
    }
  }, [activeTab, user?.username]);

  // Fetch user tags
  useEffect(() => {
    const fetchTags = async () => {
      if (activeTab !== "tags") return;
      
      setLoadingTags(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Parse interests/tags from user data
          const tags = data.user?.interests || [];
          setUserTags(Array.isArray(tags) ? tags : []);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setLoadingTags(false);
      }
    };

    if (activeTab === "tags") {
      fetchTags();
    }
  }, [activeTab]);

  const mockUser = {
    username: user?.username || "currentuser",
    displayName: user?.displayName || user?.username || "Current User",
    avatar: userAvatar,
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    bio: "🌟 Welcome to my profile! | Digital creator | Coffee enthusiast ☕ | Always learning something new",
    followers: 1234,
    following: 567,
    posts: 89,
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/user/avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload avatar");
      }

      const data = await response.json();
      setUserAvatar(data.avatar_url);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

const mockPosts = [
  {
    id: "1",
    author: {
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    content: "Just had an amazing day exploring the city! 🌆 The sunset views were absolutely breathtaking.",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800",
    hashtags: ["sunset", "citylife", "photography"],
    likes: 156,
    comments: 23,
    reposts: 12,
    createdAt: "2h ago",
  },
  {
    id: "2",
    author: {
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    content: "New week, new goals! Let's make it count. 💪",
    hashtags: ["motivation", "goals", "newweek"],
    likes: 89,
    comments: 15,
    reposts: 5,
    createdAt: "1d ago",
  },
];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const content = (
    <div className="max-w-3xl mx-auto">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 rounded-b-xl overflow-hidden">
        <img
          src={mockUser.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="absolute -top-16 left-6 group">
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative block rounded-full hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={mockUser.avatar} alt={mockUser.displayName} />
              <AvatarFallback className="text-4xl">{mockUser.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings">
              <Settings className="w-5 h-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <Share className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* User Info */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-foreground">{mockUser.displayName}</h1>
          <p className="text-muted-foreground">@{mockUser.username}</p>
          <p className="mt-3 text-foreground">{mockUser.bio}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <Link to={`/profile/${mockUser.username}/followers`} className="hover:text-primary transition-colors cursor-pointer">
              <span className="font-bold text-foreground">{mockUser.followers.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </Link>
            <Link to={`/profile/${mockUser.username}/following`} className="hover:text-primary transition-colors cursor-pointer">
              <span className="font-bold text-foreground">{mockUser.following.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </Link>
            <div>
              <span className="font-bold text-foreground">{mockUser.posts}</span>
              <span className="text-muted-foreground ml-1">Posts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all relative",
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "posts" && (
          <div className="space-y-6">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
        
        {activeTab === "likes" && (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Posts you've liked will appear here</p>
          </div>
        )}
        
        {activeTab === "following" && (
          <div>
            {loadingFollowing ? (
              <div className="text-center py-16">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground mt-4">Loading your following list...</p>
              </div>
            ) : followingUsers.length > 0 ? (
              <div className="space-y-3">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Following ({followingUsers.length})</h3>
                  <p className="text-sm text-muted-foreground">People you follow</p>
                </div>
                
                {followingUsers.map((followUser) => (
                  <div 
                    key={followUser.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="w-14 h-14 ring-2 ring-border/50 group-hover:ring-primary/50 transition-all">
                        <AvatarImage 
                          src={followUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${followUser.username}`}
                          alt={followUser.display_name}
                        />
                        <AvatarFallback>{followUser.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/profile/${followUser.username}`}
                          className="font-semibold hover:text-primary transition-colors block truncate"
                        >
                          {followUser.display_name}
                        </Link>
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
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-2 ml-2 shrink-0"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span className="hidden sm:inline">Following</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-foreground mb-2">You're not following anyone yet</p>
                <p className="text-muted-foreground mb-6">Start following people to see them here</p>
                <Button onClick={() => navigate("/explore")}>Explore Users</Button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "tags" && (
          <div>
            {loadingTags ? (
              <div className="text-center py-16">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
                <p className="text-muted-foreground mt-4">Loading your interests...</p>
              </div>
            ) : userTags.length > 0 ? (
              <div className="max-w-2xl">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Your Interests</h3>
                  <p className="text-sm text-muted-foreground">Tags you selected during onboarding</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {userTags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="secondary"
                      className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 rounded-full"
                    >
                      <Tag className="w-3.5 h-3.5 mr-2" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/onboarding")}
                  className="mt-8"
                >
                  Edit Interests
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <Tag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-foreground mb-2">No interests selected</p>
                <p className="text-muted-foreground mb-6">Add your interests to personalize your feed and connect with similar users</p>
                <Button onClick={() => navigate("/onboarding")} className="gap-2">
                  <Tag className="w-4 h-4" />
                  Add Interests
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (useViewSwitching) {
    return content;
  }

  return (
    <MainLayout onLogout={handleLogout} useViewSwitching={useViewSwitching}>
      {content}
    </MainLayout>
  );
};

export default Account;
