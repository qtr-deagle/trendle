import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Community {
  id: number;
  name: string;
  description: string;
  image: string;
  members: number;
  isMember?: boolean;
  createdAt: string;
}

interface CommunitiesProps {
  useViewSwitching?: boolean;
}

const Communities = ({ useViewSwitching = false }: CommunitiesProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        "/communities",
        {
          method: "GET",
        },
        token
      );

      const data = await response.json();
      if (data.success && Array.isArray(data.communities)) {
        setCommunities(data.communities);
      } else {
        setError("Failed to load communities");
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Failed to load communities");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query.trim()) {
      fetchCommunities();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/communities/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setCommunities(data.communities || []);
      }
    } catch (err) {
      console.error("Error searching communities:", err);
    }
  };

  const toggleJoin = async (communityId: number, isMember: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isMember
        ? `/api/community/${communityId}/leave`
        : `/api/community/${communityId}/join`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Update local state
        setCommunities((prev) =>
          prev.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  isMember: !isMember,
                  members: isMember ? c.members - 1 : c.members + 1,
                }
              : c
          )
        );

        toast.success(isMember ? "Left community" : "Joined community");
      } else {
        toast.error("Failed to update community membership");
      }
    } catch (err) {
      console.error("Error updating membership:", err);
      toast.error("Failed to update membership");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const content = (
    <div className="py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">
          Browse Communities
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="hero" asChild>
            <Link to="/communities/create">
              <Plus className="w-4 h-4 mr-2" />
              Create a community
            </Link>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-3xl mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {/* Communities Grid */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No communities found"
                : "No communities available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communities.map((community) => (
              <div
                key={community.id}
                className="rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all glass-card"
              >
                {/* Community Image */}
                <div className="relative h-40 overflow-hidden bg-muted">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() => navigate(`/communities/${community.id}`)}
                  />
                </div>

                {/* Community Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 cursor-pointer hover:text-primary transition-colors">
                    {community.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {community.description}
                  </p>

                  {/* Members Count */}
                  <div className="text-xs text-muted-foreground mb-4">
                    {community.members.toLocaleString()} members
                  </div>

                  {/* Join/Leave Button */}
                  <Button
                    variant={community.isMember ? "secondary" : "hero"}
                    className="w-full"
                    onClick={() =>
                      toggleJoin(community.id, community.isMember || false)
                    }
                  >
                    {community.isMember ? "Leave Community" : "Join Community"}
                  </Button>
                </div>
              </div>
            ))}
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

export default Communities;
