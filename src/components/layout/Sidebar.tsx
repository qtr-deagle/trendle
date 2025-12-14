import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Users, Mail, User, Settings, PenSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useViewContext } from "@/contexts/ViewContext";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard/home", viewType: "home" as const },
  { icon: Compass, label: "Explore", path: "/dashboard/explore", viewType: "explore" as const },
  { icon: Users, label: "Communities", path: "/dashboard/communities", viewType: "communities" as const },
  { icon: Mail, label: "Inbox", path: "/dashboard/inbox", viewType: "inbox" as const },
  { icon: User, label: "Account", path: "/dashboard/account", viewType: "account" as const },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", viewType: "settings" as const },
];

interface SidebarProps {
  onLogout?: () => void;
  useViewSwitching?: boolean;
}

const Sidebar = ({ onLogout, useViewSwitching = false }: SidebarProps) => {
  const location = useLocation();
  const viewContext = useViewContext();

  const handleNavClick = (item: (typeof navItems)[0]) => {
    if (useViewSwitching) {
      viewContext.setView(item.viewType);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col p-4">
      {/* Logo */}
      <Link to="/dashboard/home" className="flex items-center gap-2 px-4 py-6">
        <span className="text-3xl font-black text-foreground italic">trendle</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = useViewSwitching
            ? viewContext.activeView === item.viewType
            : location.pathname === item.path;
          
          // When useViewSwitching is true, render all items as buttons for view switching
          // Otherwise render as Links for normal routing
          const isButton = useViewSwitching;
          const Component = isButton ? "button" : Link;

          const componentProps = isButton
            ? {
                type: "button" as const,
                onClick: () => handleNavClick(item),
                className: cn(
                  "nav-link",
                  isActive && "nav-link-active",
                  "w-full text-left"
                ),
              }
            : {
                to: item.path,
                className: cn(
                  "nav-link",
                  isActive && "nav-link-active"
                ),
              };

          return (
            <Component
              key={item.path}
              {...(componentProps as any)}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Component>
          );
        })}
      </nav>

      {/* Create Button */}
      <div className="space-y-4 pb-4">
        <Button variant="hero" size="lg" className="w-full" asChild>
          <Link to="/create">
            <PenSquare className="w-5 h-5" />
            Create
          </Link>
        </Button>

        {onLogout && (
          <Button variant="ghost" size="default" className="w-full text-destructive hover:text-destructive" onClick={onLogout}>
            <LogOut className="w-5 h-5" />
            Log out
          </Button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
