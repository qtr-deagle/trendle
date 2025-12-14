import { useEffect, useState } from "react";
import { Search, Eye, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: "unread" | "read" | "resolved";
  created_at: string;
  admin_username: string | null;
  username: string | null;
}

interface MessageDetail extends Message {
  message: string;
  admin_reply: string | null;
  replied_at: string | null;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("unread");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });

      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await fetch(`/api/admin/messages?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setTotalMessages(data.total);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
  }, [page, filterStatus]);

  const handleViewDetail = (msg: Message) => {
    setSelectedMessage({
      ...msg,
      message: "Message content here", // This should come from API
      admin_reply: null,
      replied_at: null
    });
    setShowDetailModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      toast({ title: "Error", description: "Reply cannot be empty", variant: "destructive" });
      return;
    }

    setReplying(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/messages/${selectedMessage.id}/reply`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ admin_reply: replyText })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Reply sent successfully" });
        setReplyText("");
        setShowDetailModal(false);
        fetchMessages(page);
      } else {
        toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    } finally {
      setReplying(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/messages/${messageId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "read" })
      });

      if (response.ok) {
        toast({ title: "Success", description: "Message marked as read" });
        fetchMessages(page);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update message", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "read":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-muted";
    }
  };

  const totalPages = Math.ceil(totalMessages / limit);

  return (
    <AdminLayout title="Messages Management">
      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email/name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-none"
            />
          </div>

          <Select value={filterStatus} onValueChange={(value) => {
            setFilterStatus(value);
            setPage(1);
          }}>
            <SelectTrigger className="w-40 bg-secondary border-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          Total: {totalMessages} messages | Page {page} of {totalPages}
        </p>
      </div>

      {/* Messages Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No messages found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/50">
                <TableHead className="text-muted-foreground font-semibold">From</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Email</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Subject</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id} className="border-border hover:bg-muted/50">
                  <TableCell className="font-medium text-sm">{msg.name}</TableCell>
                  <TableCell className="text-sm">{msg.email}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{msg.subject}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(msg.status)}>
                      {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetail(msg)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {msg.status === "unread" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(msg.id)}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
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

      {/* Message Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 my-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold">Message from {selectedMessage.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Subject</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-muted p-4 rounded text-sm">
                  Message content from API
                </div>
              </div>

              {selectedMessage.admin_reply && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground mb-2">Admin Reply</p>
                  <p className="text-sm">{selectedMessage.admin_reply}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Replied on {selectedMessage.replied_at ? new Date(selectedMessage.replied_at).toLocaleString() : ""}
                  </p>
                </div>
              )}

              {!selectedMessage.admin_reply && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium mb-2 block">Send Reply</label>
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-20 mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleSendReply}
                      disabled={replying}
                      className="flex-1"
                    >
                      {replying ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}

              {selectedMessage.admin_reply && (
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMessages;
