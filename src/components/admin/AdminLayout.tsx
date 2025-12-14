import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  MessageSquare,
  FolderOpen,
  Tag,
  Bell,
  History,
  LogOut,
} from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "User", path: "/admin/users" },
  { icon: AlertTriangle, label: "Reports", path: "/admin/reports" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  {
    icon: FolderOpen,
    label: "Categories management",
    path: "/admin/categories",
  },
  { icon: Tag, label: "Tags setter", path: "/admin/tags" },
  { icon: History, label: "Audit Logs", path: "/admin/logs" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, adminLogout } = useAdmin();

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully");
      navigate("/admin");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col fixed h-screen">
        <div className="p-6">
          <Link to="/">
            <h1 className="text-3xl font-black text-foreground italic">
              trendle
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin User */}
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <span className="text-xl">◆</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {admin?.username || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {admin?.email}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-72">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="relative">
            <Bell className="w-6 h-6 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center text-white">
              3
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
