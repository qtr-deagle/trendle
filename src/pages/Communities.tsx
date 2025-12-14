import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ChevronDown } from "lucide-react";

const mockCommunities = [
  {
    id: "aesthetic",
    name: "Aesthetic",
    handle: "aesthetic",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    members: 10790,
    isJoined: false,
  },
  {
    id: "music",
    name: "Music",
    handle: "music",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    members: 25430,
    isJoined: true,
  },
  {
    id: "memes",
    name: "Memes",
    handle: "memes",
    image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400",
    members: 89210,
    isJoined: false,
  },
  {
    id: "gaming",
    name: "Gaming",
    handle: "gaming",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400",
    members: 156780,
    isJoined: true,
  },
  {
    id: "art",
    name: "Art & Design",
    handle: "artdesign",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400",
    members: 45600,
    isJoined: false,
  },
  {
    id: "tech",
    name: "Technology",
    handle: "tech",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
    members: 78900,
    isJoined: false,
  },
];

interface CommunitiesProps {
  useViewSwitching?: boolean;
}

const Communities = ({ useViewSwitching = false }: CommunitiesProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState(mockCommunities);

  const handleLogout = () => {
    navigate("/");
  };

  const toggleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const content = (
    <div className="py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Browse Communities</h1>
        <div className="flex items-center gap-4">
          <Button variant="hero" asChild>
            <Link to="/communities/create">
              <Plus className="w-4 h-4 mr-2" />
              Create a community
            </Link>
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredCommunities.map((community) => (
          <Link
            key={community.id}
            to={`/communities/${community.handle}`}
            className="group cursor-pointer"
          >
            <div className="relative h-56 rounded-xl overflow-hidden">
              <img
                src={community.image}
                alt={community.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              
              {/* Community Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {community.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {community.members.toLocaleString()} members
                    </p>
                  </div>
                  <Button
                    variant={community.isJoined ? "outline" : "hero"}
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleJoin(community.id);
                    }}
                  >
                    {community.isJoined ? "Joined" : "Join"}
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-8">
        <Button variant="outline" className="gap-2">
          Load more
          <ChevronDown className="w-4 h-4" />
        </Button>
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
