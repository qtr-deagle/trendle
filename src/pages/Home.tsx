<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect, useCallback } from "react";
>>>>>>> 86d481d (Finalized Project)
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreatePostBar from "@/components/post/CreatePostBar";
import PostCard from "@/components/post/PostCard";
import { cn } from "@/lib/utils";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const tabs = ["For you", "Following", "Your Tags"];

interface Post {
  id: number;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar: string;
  };
  content: string;
  image: string | null;
  likes: number;
  comments: number;
  reposts: number;
  createdAt: string;
  isLiked: boolean;
<<<<<<< HEAD
=======
  tags?: string[];
  matching_followers?: Array<{
    id: number;
    username: string;
    display_name: string;
    avatar: string;
    matching_tags: string[];
  }>;
>>>>>>> 86d481d (Finalized Project)
}

interface HomeProps {
  useViewSwitching?: boolean;
}

const Home = ({ useViewSwitching }: HomeProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("For you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

<<<<<<< HEAD
  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
=======
  const fetchPosts = useCallback(async () => {
>>>>>>> 86d481d (Finalized Project)
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
<<<<<<< HEAD
        // Show default/mock posts if not authenticated
=======
>>>>>>> 86d481d (Finalized Project)
        setLoading(false);
        return;
      }

<<<<<<< HEAD
      const response = await apiCallWithAuth(
        "/posts/feed?limit=20&offset=0",
        {
          method: "GET",
        },
        token
      );
=======
      let endpoint = "/posts/feed?limit=50&offset=0";

      // Determine which endpoint to use based on active tab
      if (activeTab === "For you") {
        endpoint = "/posts/all?limit=50&offset=0"; // Get all posts
      } else if (activeTab === "Following") {
        endpoint = "/posts/following?limit=50&offset=0"; // Get only following posts
      } else if (activeTab === "Your Tags") {
        endpoint = "/posts/feed?limit=50&offset=0"; // Keep existing for tags
      }

      console.log(`[Home] Fetching posts for tab: ${activeTab}, endpoint: ${endpoint}`);

      const response = await apiCallWithAuth(endpoint, { method: "GET" }, token);
>>>>>>> 86d481d (Finalized Project)

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  };
=======
  }, [activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, fetchPosts]);

  // Listen for follow status changes to refresh all tabs
  useEffect(() => {
    const handleFollowChange = () => {
      console.log("[Home] Follow status changed, refetching posts...");
      if (activeTab === "For you" || activeTab === "Following" || activeTab === "Your Tags") {
        setTimeout(() => {
          fetchPosts();
        }, 300);
      }
    };

    window.addEventListener("followStatusChanged", handleFollowChange);
    return () => {
      window.removeEventListener("followStatusChanged", handleFollowChange);
    };
  }, [activeTab, fetchPosts]);
>>>>>>> 86d481d (Finalized Project)

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const content = (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-border">
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

      {/* Create Post Bar */}
      <CreatePostBar />

      {/* Posts Feed */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
<<<<<<< HEAD
              No posts yet. Follow users to see their posts!
=======
              {activeTab === "Following"
                ? "No posts yet. Follow users to see their posts!"
                : activeTab === "Your Tags"
                ? "No posts with your selected genres yet. Keep exploring to find content you love!"
                : "No posts yet. Start following users or explore to see posts!"}
>>>>>>> 86d481d (Finalized Project)
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id.toString()}
              author={{
                id: post.author.id,
                username: post.author.username,
                avatar: post.author.avatar,
              }}
              content={post.content}
              image={post.image}
<<<<<<< HEAD
              hashtags={[]}
=======
              hashtags={post.tags || []}
>>>>>>> 86d481d (Finalized Project)
              likes={post.likes}
              comments={post.comments}
              reposts={post.reposts}
              createdAt={post.createdAt}
              isLiked={post.isLiked}
<<<<<<< HEAD
=======
              matchingFollowers={activeTab === "Your Tags" ? post.matching_followers || [] : undefined}
>>>>>>> 86d481d (Finalized Project)
              onDelete={() => fetchPosts()}
            />
          ))
        )}
      </div>
    </div>
  );

  if (useViewSwitching) {
    return content;
  }

  return <MainLayout onLogout={handleLogout}>{content}</MainLayout>;
};

export default Home;
