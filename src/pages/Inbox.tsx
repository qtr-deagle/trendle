import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  PenSquare,
  MoreHorizontal,
  Send,
  ImageIcon,
  Smile,
  Heart,
  Loader2,
} from "lucide-react";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  isOnline?: boolean;
}

interface Conversation {
  id: number;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface InboxProps {
  useViewSwitching?: boolean;
}

const Inbox = ({ useViewSwitching = false }: InboxProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        "/messages/conversations",
        {
          method: "GET",
        },
        token
      );

      const data = await response.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        if (data.conversations.length > 0) {
          setSelectedConversation(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        `/message/conversation/${userId}`,
        {
          method: "GET",
        },
        token
      );

      const data = await response.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) {
      return;
    }

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("token");

      const response = await apiCallWithAuth(
        "/message/send",
        {
          method: "POST",
          body: JSON.stringify({
            recipient_id: selectedConversation.id,
            content: newMessage,
          }),
        },
        token
      );

      if (response.ok) {
        // Add message to local state
        const newMsg: Message = {
          id: Math.random(),
          senderId: user.id || 0,
          recipientId: selectedConversation.id,
          content: newMessage,
          isRead: true,
          createdAt: new Date().toISOString(),
        };
        setMessages([...messages, newMsg]);
        setNewMessage("");

        // Update last message in conversation
        setConversations(
          conversations.map((c) =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: newMessage, timestamp: "now" }
              : c
          )
        );
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const content = (
    <div className="flex h-[calc(100vh-2rem)] gap-0 -mx-4 -my-6">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <Button variant="ghost" size="icon">
            <PenSquare className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground text-sm">
                No messages yet. Follow users to start messaging!
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors",
                  selectedConversation?.id === conversation.id && "bg-secondary"
                )}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                    />
                    <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                  </Avatar>
                  {conversation.user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground truncate">
                      {conversation.user.name}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {(conversation.unread ?? 0) > 0 && (
                  <span className="w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
                    {conversation.unread}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={selectedConversation.user.avatar}
                  alt={selectedConversation.user.name}
                />
                <AvatarFallback>
                  {selectedConversation.user.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {selectedConversation.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.user.isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.senderId === user?.id
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                      message.senderId === user?.id
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-secondary text-foreground rounded-bl-none"
                    )}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.senderId === user?.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sendingMessage}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <Heart className="w-5 h-5" />
              </Button>
              <Button
                variant="hero"
                size="icon"
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
              >
                {sendingMessage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );

  if (useViewSwitching) {
    return content;
  }

  return (
    <MainLayout
      onLogout={handleLogout}
      hideRightSidebar
      useViewSwitching={useViewSwitching}
    >
      {content}
    </MainLayout>
  );
};

export default Inbox;
