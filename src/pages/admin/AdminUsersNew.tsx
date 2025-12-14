import { useEffect, useState } from "react";
import { Search, Eye, Ban, RotateCcw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface UserDetail extends User {
  avatar_url: string | null;
  bio: string | null;
  posts_count: number;
  followers: number;
  following: number;
}

const AdminUsersNew = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userToAction, setUserToAction] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"ban" | "activate" | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async (searchVal = "", filterVal = "all", pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (searchVal) {
        params.append("search", searchVal);
      } else if (filterVal !== "all") {
        params.append("status", filterVal === "active" ? "active" : "inactive");
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.total);
      } else {
        toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers("", filter, page);
  }, [page, filter]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
    fetchUsers(value, filter, 1);
  };

  const handleViewDetail = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setShowDetailModal(true);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch user details", variant: "destructive" });
    }
  };

  const handleActionClick = (user: User, action: "ban" | "activate") => {
    setUserToAction(user);
    setActionType(action);
    setShowActionDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!userToAction || !actionType) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userToAction.id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ is_active: actionType === "activate" })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${actionType === "ban" ? "banned" : "activated"} successfully`
        });
        fetchUsers(searchQuery, filter, page);
      } else {
        toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user status", variant: "destructive" });
    } finally {
      setShowActionDialog(false);
      setUserToAction(null);
      setActionType(null);
    }
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <AdminLayout title="User Management">
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search username/email/name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-secondary border-none"
            />
          </div>
          <Select value={filter} onValueChange={(value) => {
            setFilter(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-40 bg-secondary border-none">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Total: {totalUsers} users | Page {page} of {totalPages}
        </p>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/50">
                <TableHead className="text-muted-foreground font-semibold">User ID</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Username</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Joined</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{user.id}</TableCell>
                  <TableCell className="text-sm">{user.username}</TableCell>
                  <TableCell className="text-sm">{user.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetail(user.id)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {user.is_active ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleActionClick(user, "ban")}
                          title="Ban user"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActionClick(user, "activate")}
                          title="Activate user"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, page - 2) + i;
            if (pageNum > totalPages) return null;
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{selectedUser.username}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Display Name</p>
                <p className="font-medium">{selectedUser.display_name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="text-sm">{selectedUser.bio || "No bio"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedUser.posts_count}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedUser.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{selectedUser.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="text-sm">{new Date(selectedUser.created_at).toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                  {selectedUser.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {selectedUser.is_active ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleActionClick(selectedUser, "ban");
                      setShowDetailModal(false);
                    }}
                    className="flex-1"
                  >
                    Ban User
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleActionClick(selectedUser, "activate");
                      setShowDetailModal(false);
                    }}
                    className="flex-1"
                  >
                    Activate User
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Action Confirmation Dialog */}
      <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "ban" ? "Ban User" : "Activate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "ban"
                ? `Are you sure you want to ban @${userToAction?.username}? They will no longer be able to access the platform.`
                : `Are you sure you want to activate @${userToAction?.username}? They will be able to access the platform again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionType === "ban" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              className="flex-1"
            >
              {actionType === "ban" ? "Ban" : "Activate"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsersNew;
