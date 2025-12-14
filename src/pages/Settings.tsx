import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    id: "account",
    icon: User,
    label: "Account",
    description: "Manage your account details",
    path: "/settings/account",
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    description: "Configure notification preferences",
    path: "/settings/notifications",
  },
  {
    id: "privacy",
    icon: Lock,
    label: "Privacy",
    description: "Control your privacy settings",
    path: "/settings/privacy",
  },
  {
    id: "appearance",
    icon: Palette,
    label: "Appearance",
    description: "Customize the look and feel",
    path: "/settings/appearance",
  },
  {
    id: "language",
    icon: Globe,
    label: "Language",
    description: "Change your language preferences",
    path: "/settings/language",
  },
  {
    id: "security",
    icon: Shield,
    label: "Security",
    description: "Manage security settings",
    path: "/settings/security",
  },
  {
    id: "help",
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get help with your account",
    path: "/settings/help",
  },
];

interface SettingsProps {
  useViewSwitching?: boolean;
}

const Settings = ({ useViewSwitching = false }: SettingsProps) => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const handleLogout = () => {
    navigate("/");
  };

  const content = (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      {/* Quick Settings */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
            </div>
            <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="glass-card overflow-hidden">
        {settingsSections.map((section, index) => (
          <Link
            key={section.id}
            to={section.path}
            className={cn(
              "flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors cursor-pointer group",
              index !== settingsSections.length - 1 && "border-b border-border"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <section.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {section.label}
                </p>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="mt-8">
        <Button 
          variant="ghost" 
          className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log out
        </Button>
      </div>

      {/* App Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Trendle v1.0.0</p>
        <p className="mt-1">© 2024 Trendle. All rights reserved.</p>
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

export default Settings;
