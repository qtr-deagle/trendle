import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import CreatePostBar from "@/components/post/CreatePostBar";
import PostCard from "@/components/post/PostCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  FileText, 
  Info, 
  Settings,
  MoreHorizontal
} from "lucide-react";

const mockCommunity = {
  id: "aesthetic",
  name: "Aesthetic Lovers",
  handle: "aestheticlovers",
  description: "This is a community for those that love aesthetic things of all kinds.",
  coverImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200",
  avatar: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200",
  members: 10790,
  posts: 100,
  isPublic: true,
  onlineMembers: 5,
  tags: ["aesthetic", "photography", "light academia", "love", "nature"],
};

const mockPosts = [
  {
    id: "1",
    author: {
      username: "lalalisalova",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lalalisalova",
    },
    content: "Mornings>>>>3",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    hashtags: [],
    likes: 8910,
    comments: 123,
    reposts: 456,
    createdAt: "2h ago",
  },
];

const CommunityDetail = () => {
  const navigate = useNavigate();
  const { handle } = useParams();
  const [isJoined, setIsJoined] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <MainLayout onLogout={handleLogout} hideRightSidebar>
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Cover Image */}
          <div className="relative h-48 rounded-t-xl overflow-hidden">
            <img
              src={mockCommunity.coverImage}
              alt={mockCommunity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            
            {/* Status & Actions */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-secondary/80 rounded-full text-xs font-medium">
                  {mockCommunity.isPublic ? "Public" : "Private"}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {mockCommunity.onlineMembers} members online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="hero" size="sm">
                  Invite
                </Button>
                <Button variant="ghost" size="icon" className="bg-secondary/80">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Community Name */}
            <div className="absolute bottom-4 left-4">
              <h1 className="text-3xl font-bold text-primary">{mockCommunity.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{mockCommunity.description}</p>
            </div>
          </div>

          {/* Posts Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Posts</h2>
            <CreatePostBar />
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 space-y-4">
          {/* Community Info Card */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={mockCommunity.avatar} alt={mockCommunity.name} />
                <AvatarFallback>{mockCommunity.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-foreground">{mockCommunity.name}</h3>
                <p className="text-sm text-muted-foreground">@{mockCommunity.handle}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Posts</span>
                </div>
                <span className="font-medium">{mockCommunity.posts}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Members</span>
                </div>
                <span className="font-medium">{mockCommunity.members.toLocaleString()}</span>
              </div>
              <Link 
                to={`/communities/${handle}/about`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>About this community</span>
              </Link>
              <Link 
                to={`/communities/${handle}/settings`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-2 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Community settings</span>
              </Link>
            </div>
          </div>

          {/* Community Tags */}
          <div className="glass-card p-4">
            <h3 className="font-bold text-foreground mb-3">Community tags</h3>
            <div className="flex flex-wrap gap-2">
              {mockCommunity.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/explore?tag=${tag}`}
                  className="px-3 py-1 bg-secondary rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CommunityDetail;
