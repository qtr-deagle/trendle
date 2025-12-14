import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const trendingBlogs = [
  { id: 1, name: "SB19", handle: "sb19official", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SB19" },
  { id: 2, name: "BINI", handle: "biniofficial", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BINI" },
  { id: 3, name: "ALMT", handle: "alamatofficial", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ALMT" },
  { id: 4, name: "G22", handle: "g22official", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=G22" },
  { id: 5, name: "D4V1D", handle: "d4v1dofficial", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=D4V1D" },
];

const RightSidebar = () => {
  return (
    <aside className="fixed right-0 top-0 h-screen w-80 bg-sidebar border-l border-sidebar-border p-4 overflow-y-auto">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search trendle" 
          className="pl-10 bg-secondary border-none"
        />
      </div>

      {/* Trending Blogs */}
      <div className="glass-card p-4">
        <h3 className="text-lg font-bold text-foreground mb-4">Trending Blogs</h3>
        
        <div className="space-y-3">
          {trendingBlogs.map((blog) => (
            <div 
              key={blog.id}
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={blog.avatar} alt={blog.name} />
                  <AvatarFallback>{blog.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground text-sm">{blog.name}</p>
                  <p className="text-xs text-muted-foreground">@{blog.handle}</p>
                </div>
              </div>
              <Button variant="follow" size="sm" className="text-xs">
                Follow
              </Button>
            </div>
          ))}
        </div>

        <button className="text-primary text-sm font-medium mt-4 hover:underline transition-all">
          show more blogs
        </button>
      </div>

      {/* Footer Links */}
      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <a href="#" className="hover:text-foreground transition-colors">About</a>
        <a href="#" className="hover:text-foreground transition-colors">Legal</a>
        <a href="#" className="hover:text-foreground transition-colors">FAQs</a>
        <a href="#" className="hover:text-foreground transition-colors">Help</a>
      </div>
    </aside>
  );
};

export default RightSidebar;
