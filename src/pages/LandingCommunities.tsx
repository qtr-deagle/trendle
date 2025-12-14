import { useState } from "react";
import { Search, Users } from "lucide-react";
import LandingLayout from "@/components/layout/LandingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const mockCommunities = [
  {
    id: 1,
    name: "Gaming Central",
    description: "For all gaming enthusiasts",
    members: "1.2M",
    posts: "45.8K",
    image: "https://images.unsplash.com/photo-1538481143235-93ac8f3bde8d?w=400",
    isJoined: false,
  },
  {
    id: 2,
    name: "Art & Design",
    description: "Share and discuss creative work",
    members: "2.5M",
    posts: "127.3K",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400",
    isJoined: false,
  },
  {
    id: 3,
    name: "Tech News",
    description: "Latest technology updates",
    members: "890K",
    posts: "23.4K",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400",
    isJoined: false,
  },
  {
    id: 4,
    name: "Book Club",
    description: "Discuss your favorite books",
    members: "450K",
    posts: "12.1K",
    image: "https://images.unsplash.com/photo-150784272343-583f20270319?w=400",
    isJoined: false,
  },
  {
    id: 5,
    name: "Music Lovers",
    description: "Share playlists and recommendations",
    members: "3.1M",
    posts: "156.7K",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    isJoined: false,
  },
  {
    id: 6,
    name: "Photography",
    description: "Showcase photography work",
    members: "1.8M",
    posts: "89.2K",
    image: "https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400",
    isJoined: false,
  },
];

const LandingCommunities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState(mockCommunities);

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleJoin = (id: number) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  return (
    <LandingLayout>
      <div className="py-6 px-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">Join communities and connect with people who share your interests</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-background border-2"
          />
        </div>

        {/* Communities Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="border rounded-lg overflow-hidden hover:border-foreground/50 transition-colors bg-background/50"
              >
                {/* Cover Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={community.image}
                    alt={community.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{community.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{community.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {community.members} members
                    </div>
                    <div>{community.posts} posts</div>
                  </div>

                  {/* Join Button */}
                  <Button
                    variant={community.isJoined ? "default" : "outline"}
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => toggleJoin(community.id)}
                  >
                    {community.isJoined ? "Joined" : "Join"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default LandingCommunities;
