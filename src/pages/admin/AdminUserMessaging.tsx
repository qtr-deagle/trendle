import { useEffect, useState } from "react";
import { Search, Send, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  email: string;
}

interface ConversationUser extends User {
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const AdminUserMessaging = () => {
  const [users, setUsers] = useState<ConversationUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ConversationUser | null>(
    null
  );
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchResults, setSearchResults] = useState<ConversationUser[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast({
          title: "Error",
          description: "No admin authentication token found",
          variant: "destructive",
        });
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/admin/users?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(
        `${apiUrl}/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };

  const handleSelectUser = (user: ConversationUser) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (!messageText.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        toast({
          title: "Error",
          description: "No admin authentication token found",
          variant: "destructive",
        });
        return;
      }

      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const endpoint = `${apiUrl}/admin/message-user/${selectedUser.id}`;
      console.log("Sending message to:", endpoint);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageText,
        }),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Message sent successfully:", data);
        toast({
          title: "Success",
          description: "Message sent to user",
        });
        setMessageText("");
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error response:", errorData);
        toast({
          title: "Error",
          description:
            errorData.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const displayUsers = searchResults.length > 0 ? searchResults : users;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Message Users</h1>
          <p className="text-muted-foreground">
            Send direct messages to users
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <Card className="lg:col-span-1 flex flex-col h-[600px]">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : displayUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {displayUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedUser?.id === user.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={user.avatar_url}
                            alt={user.username}
                          />
                          <AvatarFallback>
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {user.display_name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Message Compose */}
          <Card className="lg:col-span-2 flex flex-col h-[600px]">
            {selectedUser ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={selectedUser.avatar_url}
                        alt={selectedUser.username}
                      />
                      <AvatarFallback>
                        {selectedUser.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {selectedUser.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{selectedUser.username}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                      This message will appear in the user's inbox as coming from
                      the admin
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t space-y-3">
                  <Textarea
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-24 resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="w-full"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a user to send a message
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserMessaging;
