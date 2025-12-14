import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiCallWithAuth } from "@/lib/api";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
  Sun,
  Loader2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const settingsSections = [
  {
    id: "account",
    icon: User,
    label: "Account",
    description: "Manage your account details",
    path: "/account",
  },
  {
    id: "help",
    icon: HelpCircle,
    label: "Help & Support",
    description: "Get help with your account",
    path: "#",
  },
];

interface SettingsProps {
  useViewSwitching?: boolean;
}

interface UserSettings {
  dark_mode: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  privacy_level: string;
  two_factor_enabled: boolean;
}

const Settings = ({ useViewSwitching = false }: SettingsProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    dark_mode: true,
    email_notifications: true,
    push_notifications: false,
    language: "en",
    privacy_level: "public",
    two_factor_enabled: false,
  });
  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [accountPassword, setAccountPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        "/settings",
        {
          method: "GET",
        },
        token
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = async (key: keyof UserSettings, value: any) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const updatedSettings = { ...settings, [key]: value };

      const response = await apiCallWithAuth(
        "/settings",
        {
          method: "PUT",
          body: JSON.stringify({ [key]: value }),
        },
        token
      );

      if (response.ok) {
        setSettings(updatedSettings);
        toast.success("Setting updated!");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update setting"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAccountUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        "/settings/account",
        {
          method: "PUT",
          body: JSON.stringify({
            email: accountEmail,
            ...(accountPassword && { password: accountPassword }),
          }),
        },
        token
      );

      if (response.ok) {
        toast.success("Account updated successfully!");
        setAccountPassword("");
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update account");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update account"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const content = (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading settings...</p>
        </div>
      ) : (
        <>
          {/* Appearance Settings */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Appearance
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  {settings.dark_mode ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Toggle dark/light theme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.dark_mode}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("dark_mode", checked)
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Language</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.language === "en" ? "English" : "Spanish"}
                    </p>
                  </div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    handleSettingsChange("language", e.target.value)
                  }
                  disabled={saving}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Notifications
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("email_notifications", checked)
                  }
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Push Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.push_notifications}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("push_notifications", checked)
                  }
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Privacy
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Profile Privacy
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {settings.privacy_level === "public"
                        ? "Public - Anyone can see your profile"
                        : "Private - Only followers can see your profile"}
                    </p>
                  </div>
                </div>
                <select
                  value={settings.privacy_level}
                  onChange={(e) =>
                    handleSettingsChange("privacy_level", e.target.value)
                  }
                  disabled={saving}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="glass-card p-6 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Security
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {settings.two_factor_enabled
                        ? "Enabled - Your account is protected"
                        : "Disabled - Enhance your security"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.two_factor_enabled}
                  onCheckedChange={(checked) =>
                    handleSettingsChange("two_factor_enabled", checked)
                  }
                  disabled={saving}
                />
              </div>

              <div className="pt-4">
                <h3 className="font-medium text-foreground mb-3">
                  Update Account Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password (optional)
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        disabled={saving}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleAccountUpdate}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Account Changes
                  </Button>
                </div>
              </div>
            </div>
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
        </>
      )}
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
