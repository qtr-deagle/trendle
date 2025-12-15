import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  is_sent_by_current: boolean;
}

interface Conversation {
  id: number;
  user: {
    name: string;
    handle: string;
    avatar: string;
    bio: string;
  };
  lastMessage: string;
  timestamp: string;
}

const Messaging = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    searchParams.get("userId") ? parseInt(searchParams.get("userId")!) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchFollowers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages();
      setSearchParams({ userId: selectedUserId.toString() });
    }
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await apiCallWithAuth(
        "/messages/conversations",
        { method: "GET" },
        token
      );

      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await apiCallWithAuth(
        "/messages/followers",
        { method: "GET" },
        token
      );

      if (!response.ok) throw new Error("Failed to fetch followers");
      const data = await response.json();
      setFollowers(data.followers || []);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !selectedUserId) return;

      const response = await apiCallWithAuth(
        `/messages?user_id=${selectedUserId}`,
        { method: "GET" },
        token
      );

      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data.messages || []);

      // Mark as read
      await apiCallWithAuth(
        "/messages/read",
        {
          method: "PUT",
          body: JSON.stringify({ sender_id: selectedUserId }),
        },
        token
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedUserId) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await apiCallWithAuth(
        "/message/send",
        {
          method: "POST",
          body: JSON.stringify({
            recipient_id: selectedUserId,
            content: messageContent,
          }),
        },
        token
      );

      if (!response.ok) throw new Error("Failed to send message");

      setMessageContent("");
      fetchMessages(); // Refresh messages
      toast.success("Message sent");
    } catch (err) {
      console.error("Send error:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedUser = followers.find((f) => f.id === selectedUserId);

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-120px)] gap-4">
        {/* Conversations List */}
        <div className="w-80 border-r border-border overflow-y-auto">
          <div className="space-y-2 p-4">
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : followers.length === 0 ? null : (
                followers.map((follower) => (
                  <button
                    key={follower.id}
                    onClick={() => setSelectedUserId(follower.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedUserId === follower.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={follower.avatar_url}
                          alt={follower.username}
                        />
                        <AvatarFallback>
                          {follower.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {follower.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{follower.username}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-border p-4 sticky top-0 bg-background/95 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={selectedUser.avatar_url}
                      alt={selectedUser.username}
                    />
                    <AvatarFallback>
                      {selectedUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedUser.display_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.is_sent_by_current ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.is_sent_by_current
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border"
              >
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={sending || !messageContent.trim()}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">Select a conversation to start messaging</p>
                <p className="text-sm">Follow users to message them</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messaging;
