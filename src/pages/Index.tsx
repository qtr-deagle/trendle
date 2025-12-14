import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass, Users, Shield, LogIn } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left Section - Navigation */}
      <div className="w-72 p-8 flex flex-col flex-shrink-0">
        <h1 className="text-4xl font-black text-foreground italic mb-12">trendle</h1>
        
        <nav className="space-y-2 mb-8">
          <Link to="/explore" className="nav-link">
            <Compass className="w-5 h-5" />
            <span>Explore</span>
          </Link>
          <Link to="/communities" className="nav-link">
            <Users className="w-5 h-5" />
            <span>Communities</span>
          </Link>
        </nav>

        <div className="space-y-3">
          <Button variant="hero" size="lg" className="w-full" asChild>
            <Link to="/signup">Sign up</Link>
          </Button>
          <Button variant="default" size="lg" className="w-full bg-primary hover:bg-primary/90" asChild>
            <Link to="/login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Log in
            </Link>
          </Button>
          <Button variant="ghost" size="lg" className="w-full text-muted-foreground hover:text-foreground" asChild>
            <Link to="/admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin Login
            </Link>
          </Button>
        </div>
      </div>

      {/* Middle Section - Content Preview */}
      <div className="flex-1 p-8 overflow-y-auto pb-32">
        {/* Trending Header */}
        <div className="flex items-center gap-8 mb-6">
          <span className="text-primary font-semibold border-b-2 border-primary pb-2">Trending</span>
          <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">More ⊕</span>
        </div>

        {/* Trending Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-trending-1 to-pink-700 rounded-xl p-4 h-24 flex items-end transition-all hover:scale-105 cursor-pointer relative">
            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">1</span>
            <span className="font-bold text-sm">kpop demon hunters</span>
          </div>
          <div className="bg-gradient-to-br from-trending-3 to-green-700 rounded-xl p-4 h-24 flex items-end transition-all hover:scale-105 cursor-pointer relative">
            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">3</span>
            <span className="font-bold text-sm">pokemon</span>
          </div>
          <div className="bg-gradient-to-br from-trending-2 to-purple-700 rounded-xl p-4 h-24 flex items-end transition-all hover:scale-105 cursor-pointer relative">
            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">2</span>
            <span className="font-bold text-sm">no im not a human</span>
          </div>
          <div className="bg-gradient-to-br from-trending-4 to-orange-700 rounded-xl p-4 h-24 flex items-end transition-all hover:scale-105 cursor-pointer relative">
            <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold">4</span>
            <span className="font-bold text-sm">dandys world</span>
          </div>
        </div>

        {/* Sample Post */}
        <div className="glass-card p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-xl">🌸</div>
            <span className="font-semibold">bloombound</span>
            <span className="text-muted-foreground ml-auto">•••</span>
          </div>
          
          <blockquote className="text-xl text-foreground mb-4 leading-relaxed">
            "And sometimes I have kept my feelings to myself because I could find no language to describe them in."
          </blockquote>
          <p className="text-muted-foreground mb-4">— Jane Austen</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {["life", "quotes", "life quotes", "love", "motivation", "spilled thoughts", "poetry"].map((tag) => (
              <span key={tag} className="hashtag text-sm">#{tag}</span>
            ))}
          </div>
          
          <div className="flex items-center gap-6 pt-4 border-t border-border text-muted-foreground">
            <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">💬 4</span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">🔁 1</span>
            <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">❤️ 2</span>
            <span className="ml-auto hover:text-primary transition-colors cursor-pointer">📤</span>
          </div>
        </div>
      </div>

      {/* Right Section - Trending Blogs */}
      <div className="w-80 p-8 flex-shrink-0 overflow-y-auto pb-32">
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search trendle" 
            className="w-full bg-secondary rounded-full px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="glass-card p-4">
          <h3 className="text-lg font-bold mb-4">Trending Blogs</h3>
          
          <div className="space-y-4">
            {[
              { name: "SB19", handle: "sb19official" },
              { name: "BINI", handle: "biniofficial" },
              { name: "ALMT", handle: "alamatofficial" },
              { name: "G22", handle: "g22official" },
              { name: "D4V1D", handle: "jandeybrcsmalapokszxc" },
            ].map((blog) => (
              <div key={blog.handle} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent" />
                  <div>
                    <p className="font-semibold text-sm">{blog.name}</p>
                    <p className="text-xs text-muted-foreground">@{blog.handle}</p>
                  </div>
                </div>
                <span className="text-primary text-sm font-medium cursor-pointer hover:underline">Follow</span>
              </div>
            ))}
          </div>
          
          <button className="text-primary text-sm font-medium mt-4 hover:underline">
            show more blogs
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">About</a>
          <a href="#" className="hover:text-foreground transition-colors">Legal</a>
          <a href="#" className="hover:text-foreground transition-colors">FAQs</a>
          <a href="#" className="hover:text-foreground transition-colors">Help</a>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-4 z-10">
        <div className="flex items-center justify-center gap-4">
          <Button variant="hero" size="lg" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/login">Log in</Link>
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Join over thousands people using Trendle to find their communities and make friends.
        </p>
      </div>
    </div>
  );
};

export default Index;
