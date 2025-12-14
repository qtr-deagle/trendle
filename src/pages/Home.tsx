import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreatePostBar from "@/components/post/CreatePostBar";
import PostCard from "@/components/post/PostCard";
import { cn } from "@/lib/utils";

const tabs = ["For you", "Following", "Your Tags"];

const mockPosts = [
  {
    id: "1",
    author: {
      username: "renzored",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=renzored",
    },
    content: "You know, before the 2024 US presidential election \"no rules, just right\" was just the slogan for outback steakhouse. I didn't know it was going to be the future of politics in America.",
    hashtags: ["no rules just right", "politics"],
    likes: 42,
    comments: 12,
    reposts: 8,
    createdAt: "2h ago",
  },
  {
    id: "2",
    author: {
      username: "bloombound",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bloombound",
    },
    content: "\"And sometimes I have kept my feelings to myself because I could find no language to describe them in.\"\n\n— Jane Austen",
    hashtags: ["life", "quotes", "life quotes", "love", "motivation", "spilled thoughts", "poetry", "life lesson"],
    likes: 2,
    comments: 4,
    reposts: 1,
    createdAt: "5h ago",
  },
  {
    id: "3",
    author: {
      username: "artlover",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=artlover",
    },
    content: "Just discovered this amazing digital artist. Their use of color and light is absolutely mesmerizing! 🎨✨",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    hashtags: ["art", "digital art", "inspiration"],
    likes: 156,
    comments: 23,
    reposts: 45,
    createdAt: "1d ago",
  },
];

interface HomeProps {
  useViewSwitching?: boolean;
}

const Home = ({ useViewSwitching = false }: HomeProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("For you");

  const handleLogout = () => {
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
        {mockPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );

  if (useViewSwitching) {
    return content;
  }

  return (
    <MainLayout onLogout={handleLogout}>
      {content}
    </MainLayout>
  );
};

export default Home;
