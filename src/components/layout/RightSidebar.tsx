<<<<<<< HEAD
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const trendingBlogs = [
  { id: 1, name: "SB19", handle: "sb19official", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SB19" },
  { id: 2, name: "BINI", handle: "biniofficial", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BINI" },
  { id: 3, name: "ALMT", handle: "alamatofficial", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ALMT" },
  { id: 4, name: "G22", handle: "g22official", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=G22" },
  { id: 5, name: "D4V1D", handle: "d4v1dofficial", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=D4V1D" },
];

const RightSidebar = () => {
  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-sidebar border-l border-sidebar-border p-4 overflow-y-auto">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search trendle" 
          className="pl-10 bg-secondary border-none"
        />
      </div>

      {/* Trending Blogs */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-bold text-foreground mb-4">Trending Blogs</h3>
        
        <div className="space-y-3">
          {trendingBlogs.map((blog) => (
            <div 
              key={blog.id}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={blog.avatar} alt={blog.name} />
                  <AvatarFallback>{blog.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-sm">{blog.name}</p>
                  <p className="text-xs text-muted-foreground">@{blog.handle}</p>
                </div>
              </div>
              <Button variant="follow" size="sm" className="text-xs">
                Follow
              </Button>
            </div>
          ))}
        </div>

        <button className="text-primary text-sm font-medium mt-4 hover:underline transition-all">
          show more blogs
        </button>
      </div>

      {/* Footer Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
=======
import { Search, Loader2, RefreshCw, X, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface TrendingUser {
  id: number;
  username: string;
  display_name: string;
  avatar_url?: string;
  avatar?: string;
  followers?: number;
  following?: number;
}

const RightSidebar = () => {
  const { user: currentUser } = useAuth();
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<TrendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrendingUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchTrendingUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        "/explore/recommended-users",
        { method: "GET" },
        token
      );

      if (response.ok) {
        const data = await response.json();
        // Handle both possible response structures
        const users = data.users || data.recommended_users || [];
        setTrendingUsers(users.slice(0, 5)); // Show top 5
      } else {
        // If API fails, show empty list
        setTrendingUsers([]);
      }
    } catch (error) {
      console.error("Error fetching trending users:", error);
      setTrendingUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrendingUsers();
  }, []);

  // Listen for follow status changes from other components (e.g., unfollowing from Following tab)
  useEffect(() => {
    const handleFollowChange = () => {
      console.log("[RightSidebar] Follow status changed detected, refreshing trending users...");
      setTimeout(() => {
        fetchTrendingUsers(true);
      }, 300);
    };

    window.addEventListener("followStatusChanged", handleFollowChange);
    return () => {
      window.removeEventListener("followStatusChanged", handleFollowChange);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        `/users/search?q=${encodeURIComponent(query)}`,
        { method: "GET" },
        token
      );

      if (response.ok) {
        const data = await response.json();
        // Filter out current user from search results
        const filteredUsers = (data.users || []).filter(
          (user: TrendingUser) => user.username !== currentUser?.username
        );
        setSearchResults(filteredUsers.slice(0, 10)); // Show top 10 results
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const openAllUsersModal = async () => {
    setShowModal(true);
    setModalLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        "/explore/recommended-users?limit=1000",
        { method: "GET" },
        token
      );

      if (response.ok) {
        const data = await response.json();
        const users = data.users || data.recommended_users || [];
        setAllUsers(users);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
      setAllUsers([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleFollowChange = () => {
    // Refresh the list after a follow action to update the UI
    console.log("[RightSidebar] Follow action detected, refreshing trending users...");
    setTimeout(() => {
      fetchTrendingUsers(true);
    }, 300);
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-sidebar border-l border-sidebar-border flex flex-col">
      {/* Fixed Search Header */}
      <div className="p-4 border-b border-sidebar-border shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users" 
            className="pl-10 bg-secondary border-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-6 glass-card p-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Search Results</h3>
            {searchLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 shrink-0 ring-2 ring-border/30 group-hover:ring-primary/50 transition-all">
                        <AvatarImage src={user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.display_name} />
                        <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{user.display_name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </div>
                    <div className="ml-2 shrink-0">
                      <FollowButton 
                        targetUsername={user.username} 
                        size="sm"
                        showIcon={true}
                        onFollowChange={handleFollowChange}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            )}
          </div>
        )}

        {/* Trending Users */}
        <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            People Suggestions
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchTrendingUsers(true)}
            disabled={refreshing}
            className="h-8 w-8"
            title="Refresh trending users"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : trendingUsers.length > 0 ? (
          <>
            <div className="space-y-4">
              {trendingUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="w-12 h-12 shrink-0 ring-2 ring-border/30 group-hover:ring-primary/50 transition-all">
                      <AvatarImage src={user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.display_name} />
                      <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{user.display_name}</p>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      {user.followers !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">{user.followers} followers</p>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 shrink-0">
                    <FollowButton 
                      targetUsername={user.username} 
                      size="sm"
                      showIcon={true}
                      onFollowChange={handleFollowChange}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={openAllUsersModal}
              className="text-primary text-sm font-medium mt-4 hover:underline transition-all w-full text-center"
            >
              See All Suggestions
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No trending users yet. Explore and follow users to get started!
          </p>
        )}
        </div>
      </div>

      {/* Modal for All Users */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-border p-4 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                People Suggestions
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : allUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-primary/50 hover:bg-accent/30 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 shrink-0 ring-2 ring-border/30 group-hover:ring-primary/50 transition-all">
                          <AvatarImage src={user.avatar_url || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.display_name} />
                          <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{user.display_name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                          {user.followers !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">{user.followers} followers</p>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 shrink-0">
                        <FollowButton
                          targetUsername={user.username}
                          size="sm"
                          showIcon={true}
                          onFollowChange={handleFollowChange}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No users found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Links - Fixed at bottom */}
      <div className="border-t border-sidebar-border p-4 shrink-0 flex flex-wrap gap-3 text-xs text-muted-foreground">
>>>>>>> 86d481d (Finalized Project)
        <a href="#" className="hover:text-foreground transition-colors">About</a>
        <a href="#" className="hover:text-foreground transition-colors">Legal</a>
        <a href="#" className="hover:text-foreground transition-colors">FAQs</a>
        <a href="#" className="hover:text-foreground transition-colors">Help</a>
      </div>
    </aside>
  );
};

export default RightSidebar;
