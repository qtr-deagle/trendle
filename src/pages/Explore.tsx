import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiCallWithAuth, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import FollowButton from "@/components/FollowButton";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
}

interface Hashtag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  followers: string;
}

interface SearchResult {
  users: Array<{
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    bio: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    usage_count: number;
  }>;
  posts: Array<{
    id: number;
    author: {
      id: number;
      username: string;
      display_name: string;
      avatar: string;
    };
    content: string;
    image?: string;
    createdAt: string;
  }>;
}

interface ExploreProps {
  useViewSwitching?: boolean;
}

const Explore = ({ useViewSwitching = false }: ExploreProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    // Fetch trending data on mount
    Promise.all([fetchCategories(), fetchTrendingHashtags()]);
  }, []);

  useEffect(() => {
    // Debounce search
    if (searchQuery.trim().length > 0) {
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        "/explore/categories",
        {
          method: "GET",
        },
        token
      );

      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await apiCallWithAuth(
        "/explore/trending-hashtags",
        {
          method: "GET",
        },
        token
      );

      const data = await response.json();
      if (data.success) {
        setHashtags(data.hashtags || []);
      }
    } catch (err) {
      console.error("Error fetching hashtags:", err);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/search?query=${encodeURIComponent(
          searchQuery
        )}&type=all&limit=20`,
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
        setSearchResults(data.results);
      }
    } catch (err) {
      console.error("Error searching:", err);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const content = (
    <div className="py-6 px-4">
      {/* Search Bar */}
      <div className="relative max-w-3xl mx-auto mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users, posts, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-background border-2"
        />
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="max-w-3xl mx-auto mb-8 space-y-8">
          {/* Search Users */}
          {searchResults.users && searchResults.users.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Users</h3>
              <div className="space-y-3">
                {searchResults.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors border border-border/50"
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    />
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      <p className="font-semibold hover:text-primary transition-colors">{user.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-foreground mt-1 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                    <FollowButton 
                      targetUsername={user.username}
                      size="sm"
                      showIcon={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Tags */}
          {searchResults.tags && searchResults.tags.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {searchResults.tags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant="outline"
                    onClick={() => navigate(`/explore?tag=${tag.slug}`)}
                    className="rounded-full"
                  >
                    #{tag.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Posts */}
          {searchResults.posts && searchResults.posts.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4">Posts</h3>
              <div className="space-y-4">
                {searchResults.posts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="p-4 rounded-lg border border-border hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-sm">
                          {post.author.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{post.author.username}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trending Section - Hidden when searching */}
      {!searchResults && (
        <>
          <div className="max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-6">Trending Now</h2>

            {/* Trending Hashtags */}
            {hashtags.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {hashtags.slice(0, 10).map((tag) => (
                    <Button
                      key={tag.id}
                      variant="outline"
                      onClick={() => setSearchQuery(tag.name)}
                      className="rounded-full"
                    >
                      #{tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categoryLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : categories.length > 0 ? (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Browse Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.slice(0, 9).map((category) => (
                    <div
                      key={category.id}
                      onClick={() =>
                        navigate(`/explore?category=${category.slug}`)
                      }
                      className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted cursor-pointer transition-all"
                    >
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}

      {/* Loading state for search */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* No results message */}
      {searchResults &&
        searchResults.users.length === 0 &&
        searchResults.tags.length === 0 &&
        searchResults.posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found for "{searchQuery}"
            </p>
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

export default Explore;
