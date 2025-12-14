import { useState } from "react";
import LandingLayout from "@/components/layout/LandingLayout";
import PostCard from "@/components/post/PostCard";
import { cn } from "@/lib/utils";
import { Type, Image, Quote, Link, Music, Play, ChevronDown } from "lucide-react";

const tabs = ["For you", "Following", "Your Tags"];

const contentTypes = [
  { label: "Text", icon: Type },
  { label: "Photo", icon: Image },
  { label: "Quote", icon: Quote },
  { label: "Link", icon: Link },
  { label: "Audio", icon: Music },
  { label: "Video", icon: Play },
];

const followedTags = [
  {
    id: "1",
    name: "animals",
    image: "https://images.unsplash.com/photo-1577720643272-265e434b4b0f?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "bts",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "gaming",
    image: "https://images.unsplash.com/photo-1538481572228-8aafb7d14a2b?w=200&h=200&fit=crop",
  },
  {
    id: "4",
    name: "kpop",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
  },
];

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

const followingPosts = [
  {
    id: "f1",
    author: {
      username: "lolaremedios",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lolaremedios",
    },
    content: "It's Tuesday, and here are some of {y}our favorite magical girls to celebrate. Whether they are fighting crime, extra-terrestrials, or in fact, time, these gals bring order to our chaos. Moon prism power, make up!",
    image: "https://images.unsplash.com/photo-1609467176434-5310f0d0a4f1?w=800",
    hashtags: ["magicalgrils", "anime", "fanart"],
    likes: 2773,
    comments: 258,
    reposts: 450,
    createdAt: "3h ago",
  },
  {
    id: "f2",
    author: {
      username: "creativewriting",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creativewriting",
    },
    content: "Just finished reading the most incredible fantasy novel. The world-building is immaculate and the characters feel so real.",
    hashtags: ["books", "reading", "fantasy"],
    likes: 234,
    comments: 45,
    reposts: 89,
    createdAt: "5h ago",
  },
  {
    id: "f3",
    author: {
      username: "musiclover",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=musiclover",
    },
    content: "New album dropped today and it's absolutely fire 🔥🎵 Already on my 10th listen!",
    hashtags: ["music", "newmusic", "artist"],
    likes: 892,
    comments: 156,
    reposts: 234,
    createdAt: "6h ago",
  },
];

const yourTagsPosts = [
  {
    id: "t1",
    author: {
      username: "redjacs",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=redjacs",
    },
    content: "Are We Breaking Apart, Or Is There Enough Left to Bind Us?",
    image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=800",
    hashtags: ["photography", "art"],
    likes: 523,
    comments: 89,
    reposts: 145,
    createdAt: "2h ago",
  },
  {
    id: "t2",
    author: {
      username: "gamerlife",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamerlife",
    },
    content: "Just speedrunned this game in 45 minutes! New personal record!",
    hashtags: ["gaming", "speedrun"],
    likes: 678,
    comments: 120,
    reposts: 234,
    createdAt: "4h ago",
  },
  {
    id: "t3",
    author: {
      username: "musicpro",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=musicpro",
    },
    content: "Dropped a new beat prod! Check it out and let me know what you think 🎵",
    hashtags: ["music", "production"],
    likes: 445,
    comments: 67,
    reposts: 89,
    createdAt: "6h ago",
  },
];

const Landing = () => {
  const [activeTab, setActiveTab] = useState("For you");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);

  const toggleContentType = (type: string) => {
    setSelectedContentTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const getPostsForTab = () => {
    if (activeTab === "Following") {
      return followingPosts;
    } else if (activeTab === "Your Tags") {
      return yourTagsPosts;
    }
    return mockPosts;
  };

  return (
    <LandingLayout>
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

        {/* Filter by Tags Button - Only show on Your Tags tab */}
        {activeTab === "Your Tags" && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors mb-6">
            <span>Filter by tags</span>
            <ChevronDown size={16} />
          </button>
        )}

        {/* Content Type Filter */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {contentTypes.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => toggleContentType(label)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200",
                selectedContentTypes.includes(label)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tags You Follow - Only show on Your Tags tab */}
        {activeTab === "Your Tags" && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tags you follow</h2>
              <button className="text-primary text-sm font-medium hover:underline">
                Manage
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {followedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="relative rounded-lg overflow-hidden cursor-pointer group h-24"
                >
                  <img
                    src={tag.image}
                    alt={tag.name}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <span className="text-white font-semibold">#{tag.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {getPostsForTab().map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </LandingLayout>
  );
};

export default Landing;
