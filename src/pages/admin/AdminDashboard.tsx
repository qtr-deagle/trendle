import { useEffect, useState } from "react";
import { ArrowRight, AlertCircle, MessageSquare, Users, FileText, Folder, Tag } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AdminLayout from "@/components/admin/AdminLayout";

interface DashboardMetrics {
  totalUsers: number;
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
  flaggedContent: number;
  totalMessages: number;
  unreadMessages: number;
  totalCategories: number;
  totalTags: number;
  bannedUsers: number;
  recentActivities: Activity[];
}

interface Activity {
  id: number;
  type: string;
  username: string;
  avatar_url: string | null;
  timestamp: string;
}

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      user_join: "New User",
      post_created: "New Post",
      report_created: "New Report"
    };
    return labels[type] || type;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_join":
        return <Users className="w-4 h-4" />;
      case "post_created":
        return <FileText className="w-4 h-4" />;
      case "report_created":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-8">Loading metrics...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold">{metrics?.totalUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <p className="text-3xl font-bold">{metrics?.totalPosts || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Reports</p>
              <p className="text-3xl font-bold">{metrics?.pendingReports || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unread Messages</p>
              <p className="text-3xl font-bold">{metrics?.unreadMessages || 0}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-amber-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{metrics?.flaggedContent || 0}</p>
          <p className="text-xs text-muted-foreground">Flagged Content</p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{metrics?.totalMessages || 0}</p>
          <p className="text-xs text-muted-foreground">Messages</p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{metrics?.totalCategories || 0}</p>
          <p className="text-xs text-muted-foreground">Categories</p>
        </Card>

        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{metrics?.totalTags || 0}</p>
          <p className="text-xs text-muted-foreground">Tags</p>
        </Card>

        <Card className="p-4 text-center bg-destructive/5">
          <p className="text-2xl font-bold text-destructive">{metrics?.bannedUsers || 0}</p>
          <p className="text-xs text-muted-foreground">Banned Users</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/users">View Users</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/reports">View Reports</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/messages">View Messages</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/categories">Manage Categories</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href="/admin/tags">Manage Tags</a>
          </Button>
          <Button asChild className="w-full">
            <a href="/admin/reports">Review Flagged</a>
          </Button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activities</h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/50">
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics?.recentActivities && metrics.recentActivities.length > 0 ? (
                metrics.recentActivities.map((activity, index) => (
                  <TableRow key={index} className="border-border">
                    <TableCell className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="text-sm">{getActivityTypeLabel(activity.type)}</span>
                    </TableCell>
                    <TableCell className="text-sm">{activity.username}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No recent activities
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {metrics && metrics.pendingReports > 0 && (
              <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{metrics.pendingReports} Pending Reports</p>
                  <p className="text-xs text-muted-foreground">Awaiting moderation</p>
                </div>
              </div>
            )}
            {metrics && metrics.unreadMessages > 0 && (
              <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{metrics.unreadMessages} Unread Messages</p>
                  <p className="text-xs text-muted-foreground">User inquiries to review</p>
                </div>
              </div>
            )}
            {metrics && metrics.bannedUsers > 0 && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{metrics.bannedUsers} Banned Users</p>
                  <p className="text-xs text-muted-foreground">Inactive accounts</p>
                </div>
              </div>
            )}
            {metrics && metrics.flaggedContent > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{metrics.flaggedContent} Flagged Content</p>
                  <p className="text-xs text-muted-foreground">Requires review</p>
                </div>
              </div>
            )}
            {metrics && metrics.pendingReports === 0 && metrics.unreadMessages === 0 && metrics.bannedUsers === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Content Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Categories</p>
                <p className="text-xs text-muted-foreground">{metrics?.totalCategories || 0} active</p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <a href="/admin/categories">Manage</a>
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Tags</p>
                <p className="text-xs text-muted-foreground">{metrics?.totalTags || 0} total</p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <a href="/admin/tags">Manage</a>
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Reports</p>
                <p className="text-xs text-muted-foreground">{metrics?.totalReports || 0} total</p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <a href="/admin/reports">Review</a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
