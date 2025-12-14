import { useState } from "react";
import { Search } from "lucide-react";
import LandingLayout from "@/components/layout/LandingLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const trendingCategories = [
  {
    id: "trending",
    name: "Trending",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
    tags: ["Follow all", "delatarune", "artists on tumblr", "ao3", "my chemical romance", "kpop demon hunters", "memes", "cats on whispr", "fl", "photography", "lgbtq", "pokemon"],
  },
  {
    id: "art",
    name: "#art",
    followers: "35.2M",
    recentPosts: "8,701",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400",
    tags: ["Follow all", "my art", "illustration", "photography", "art work", "painting", "famous artwork from famous artists", "animation", "fanart"],
  },
  {
    id: "animals",
    name: "#animals",
    followers: "10.8M",
    recentPosts: "402",
    image: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400",
    tags: ["Follow all", "cats", "kittens", "baby animals", "pets", "puppies", "wild animals", "insects"],
  },
];

const LandingExplore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <LandingLayout>
      <div className="py-6 px-4">
        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-background border-2"
          />
        </div>

        {/* Left sidebar - Interests */}
        <div className="grid grid-cols-[250px_1fr] gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">What are you into?</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Follow tags & topics you want to see...
            </p>

            {/* Interest bubbles placeholder */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-16 h-10 border-2 border-dashed border-muted rounded-full"
                />
              ))}
            </div>

            <Button variant="hero" size="lg">
              Next
            </Button>
          </div>

          {/* Categories */}
          <div className="space-y-8">
            {trendingCategories.map((category) => (
              <div key={category.id} className="flex gap-6">
                {/* Category Card */}
                <div className="relative w-48 h-40 rounded-xl overflow-hidden flex-shrink-0 group cursor-pointer">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    {category.followers && (
                      <div className="text-xs text-muted-foreground">
                        <p>{category.followers} followers</p>
                        <p>{category.recentPosts} recent posts</p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs bg-background/50 hover:bg-background/80"
                    >
                      + Follow
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 content-start">
                  {category.tags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedInterests.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleInterest(tag)}
                      className="rounded-full"
                    >
                      + {tag}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default LandingExplore;
