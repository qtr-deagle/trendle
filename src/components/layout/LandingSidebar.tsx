import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Users, LogIn, UserPlus, Shield, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: Users, label: "Communities", path: "/communities" },
];

const authItems = [
  { icon: LogIn, label: "Log in", path: "/login", highlight: true },
  { icon: UserPlus, label: "Register", path: "/signup" },
  { icon: Shield, label: "Admin Login", path: "/admin" },
];

const LandingSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col p-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-4 py-6">
        <span className="text-3xl font-black text-foreground italic">trendle</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
              isActive(item.path)
                ? "bg-foreground/10 text-foreground font-bold"
                : "text-muted-foreground hover:bg-foreground/5"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Auth Section */}
      <div className="space-y-1 mb-4 pb-4 border-t border-sidebar-border pt-4">
        {authItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
              (item as any).highlight
                ? "bg-blue-950 text-white font-bold hover:bg-blue-900"
                : isActive(item.path)
                ? "bg-foreground/10 text-foreground font-bold"
                : "text-muted-foreground hover:bg-foreground/5"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Create Button */}
      <div className="space-y-4 pb-4">
        <Button variant="hero" size="lg" className="w-full" asChild>
          <Link to="/signup">
            <PenSquare className="w-5 h-5" />
            Create
          </Link>
        </Button>
      </div>
    </aside>
  );
};

export default LandingSidebar;
