import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

interface SearchUser {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}

const UserSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query && query.length >= 2) {
      handleSearch();
    } else {
      setResults([]);
      setSearched(false);
    }
  }, [query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to search users");
        navigate("/login");
        return;
      }

      const response = await apiCallWithAuth(
        `/users/search?q=${encodeURIComponent(query)}`,
        { method: "GET" },
        token
      );

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(data.users || []);
      setSearched(true);
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const username = results.find((u) => u.id === userId)?.username;
      const endpoint = isFollowing
        ? `/user/${username}/unfollow`
        : `/user/${username}/follow`;

      const response = await apiCallWithAuth(
        endpoint,
        { method: "POST" },
        token
      );

      if (!response.ok) throw new Error("Failed to update follow status");

      // Update local state
      setResults((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFollowing: !isFollowing } : u
        )
      );

      toast.success(isFollowing ? "Unfollowed" : "Following");
    } catch (err) {
      console.error("Follow error:", err);
      toast.error("Failed to update follow status");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search users by username or name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchParams({ q: e.target.value });
              }}
              className="pl-12 h-12 text-lg"
              autoFocus
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No users found matching "{query}"
            </p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((searchUser) => (
            <div
              key={searchUser.id}
              className="glass-card p-6 flex items-center justify-between"
            >
              <div
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => navigate(`/profile/${searchUser.username}`)}
              >
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={searchUser.avatar}
                    alt={searchUser.username}
                  />
                  <AvatarFallback>
                    {searchUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {searchUser.display_name}
                  </h3>
                  <p className="text-muted-foreground">
                    @{searchUser.username}
                  </p>
                  {searchUser.bio && (
                    <p className="text-sm text-foreground mt-2">
                      {searchUser.bio}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{searchUser.followers} followers</span>
                    <span>{searchUser.following} following</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() =>
                  handleFollow(searchUser.id, searchUser.isFollowing)
                }
                variant={searchUser.isFollowing ? "outline" : "default"}
              >
                {searchUser.isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserSearch;
