import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import PostCard from "@/components/post/PostCard";
import { apiCallWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  UserMinus,
  Loader2,
  X,
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

interface UserPost {
  id: number;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  created_at: string;
  is_liked?: boolean;
}

interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface AccountProps {
  useViewSwitching?: boolean;
}

const Account = ({ useViewSwitching }: AccountProps) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [userAvatar, setUserAvatar] = useState(
    user?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
  );
  const [uploading, setUploading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [userTags, setUserTags] = useState<string[]>([]);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(
    user?.displayName || ""
  );
  const [editBio, setEditBio] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile stats on mount
  useEffect(() => {
    if (user) {
      fetchProfileStats();
      fetchUserPosts();
    }
  }, [user]);

  const fetchProfileStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        `/user/profile`,
        {
          method: "GET",
        },
        token
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setProfile(data.user);
          setEditDisplayName(data.user.display_name || "");
          setEditBio(data.user.bio || "");
        }
      }
    } catch (error) {
      console.error("Error fetching profile stats:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        `/user/${user?.username}/posts`,
        {
          method: "GET",
        },
        token
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.posts)) {
          setUserPosts(data.posts);
        }
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

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
        const token = localStorage.getItem("token");

        const response = await apiCallWithAuth(
          `/user/${user?.username}/following`,
          {
            method: "GET",
          },
          token
        );

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
        const token = localStorage.getItem("token");

        const response = await apiCallWithAuth(
          `/auth/me`,
          {
            method: "GET",
          },
          token
        );

        if (response.ok) {
          const data = await response.json();
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
    displayName:
      profile?.display_name ||
      user?.displayName ||
      user?.username ||
      "Current User",
    avatar: userAvatar,
    coverImage:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
    bio:
      profile?.bio ||
      "🌟 Welcome to my profile! | Digital creator | Coffee enthusiast ☕ | Always learning something new",
    followers: profile?.followers_count || 0,
    following: profile?.following_count || 0,
    posts: profile?.posts_count || 0,
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
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
      formData.append("avatar", file);

      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        `/user/avatar`,
        {
          method: "POST",
          body: formData,
        },
        token
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload avatar");
      }

      const data = await response.json();
      setUserAvatar(data.avatar_url);
      if (updateUser) {
        updateUser({ ...user!, avatar: data.avatar_url });
      }
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload avatar"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleEditProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        `/user/profile`,
        {
          method: "PUT",
          body: JSON.stringify({
            display_name: editDisplayName,
            bio: editBio,
          }),
        },
        token
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile({ ...profile!, display_name: editDisplayName, bio: editBio });
      if (updateUser) {
        updateUser({ ...user!, displayName: editDisplayName });
      }
      setEditingProfile(false);
      toast.success("Profile updated successfully!");
      fetchProfileStats();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  };

  const mockPosts = userPosts.map((post) => ({
    id: post.id.toString(),
    author: {
      username: mockUser.username,
      avatar: mockUser.avatar,
    },
    content: post.content,
    image: post.image,
    hashtags: [],
    likes: post.likes,
    comments: post.comments,
    reposts: post.reposts,
    createdAt: new Date(post.created_at).toLocaleDateString(),
  }));

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
              <AvatarFallback className="text-4xl">
                {mockUser.displayName?.[0]}
              </AvatarFallback>
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
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setEditingProfile(true)}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </div>

        {/* User Info */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-foreground">
            {mockUser.displayName}
          </h1>
          <p className="text-muted-foreground">@{mockUser.username}</p>
          <p className="mt-3 text-foreground">{mockUser.bio}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <Link
              to={`/profile/${mockUser.username}/followers`}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              <span className="font-bold text-foreground">
                {mockUser.followers.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-1">Followers</span>
            </Link>
            <Link
              to={`/profile/${mockUser.username}/following`}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              <span className="font-bold text-foreground">
                {mockUser.following.toLocaleString()}
              </span>
              <span className="text-muted-foreground ml-1">Following</span>
            </Link>
            <div>
              <span className="font-bold text-foreground">
                {mockUser.posts}
              </span>
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
            {loadingPosts ? (
              <div className="text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">
                  Loading your posts...
                </p>
              </div>
            ) : userPosts.length > 0 ? (
              mockPosts.map((post) => <PostCard key={post.id} {...post} />)
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>You haven't created any posts yet</p>
              </div>
            )}
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
                <p className="text-muted-foreground mt-4">
                  Loading your following list...
                </p>
              </div>
            ) : followingUsers.length > 0 ? (
              <div className="space-y-3">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold">
                    Following ({followingUsers.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    People you follow
                  </p>
                </div>

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
                        <AvatarFallback>
                          {followUser.display_name?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/profile/${followUser.username}`}
                          className="font-semibold hover:text-primary transition-colors block truncate"
                        >
                          {followUser.display_name}
                        </Link>
                        <p className="text-sm text-muted-foreground truncate">
                          @{followUser.username}
                        </p>

                        {followUser.bio && (
                          <p className="text-sm text-foreground mt-2 line-clamp-1">
                            {followUser.bio}
                          </p>
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
                <p className="text-lg font-medium text-foreground mb-2">
                  You're not following anyone yet
                </p>
                <p className="text-muted-foreground mb-6">
                  Start following people to see them here
                </p>
                <Button onClick={() => navigate("/explore")}>
                  Explore Users
                </Button>
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
                <p className="text-muted-foreground mt-4">
                  Loading your interests...
                </p>
              </div>
            ) : userTags.length > 0 ? (
              <div className="max-w-2xl">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Your Interests</h3>
                  <p className="text-sm text-muted-foreground">
                    Tags you selected during onboarding
                  </p>
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
                <p className="text-lg font-medium text-foreground mb-2">
                  No interests selected
                </p>
                <p className="text-muted-foreground mb-6">
                  Add your interests to personalize your feed and connect with
                  similar users
                </p>
                <Button
                  onClick={() => navigate("/onboarding")}
                  className="gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Add Interests
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Edit Profile
              </h2>
              <button
                onClick={() => setEditingProfile(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Display Name
                </label>
                <Input
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bio
                </label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingProfile(false)}
                >
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleEditProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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
