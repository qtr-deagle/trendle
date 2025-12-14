import { useState } from "react";
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
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InboxProps {
  useViewSwitching?: boolean;
}

const mockConversations = [
  {
    id: "1",
    user: {
      name: "SB19",
      handle: "sb19official",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SB19",
      isOnline: true,
    },
    lastMessage: "Hey! Thanks for the follow 💙",
    timestamp: "2m ago",
    unread: 2,
  },
  {
    id: "2",
    user: {
      name: "BINI",
      handle: "biniofficial",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BINI",
      isOnline: false,
    },
    lastMessage: "Check out our new post!",
    timestamp: "1h ago",
    unread: 0,
  },
  {
    id: "3",
    user: {
      name: "Art Lover",
      handle: "artlover",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=artlover",
      isOnline: true,
    },
    lastMessage: "That artwork is amazing! 🎨",
    timestamp: "3h ago",
    unread: 0,
  },
];

const mockMessages = [
  {
    id: "1",
    senderId: "sb19official",
    content: "Hey there! 👋",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    senderId: "me",
    content: "Hi! I love your music!",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    senderId: "sb19official",
    content: "Thank you so much! That means a lot to us 💙",
    timestamp: "10:33 AM",
  },
  {
    id: "4",
    senderId: "sb19official",
    content: "Hey! Thanks for the follow 💙",
    timestamp: "10:35 AM",
  },
];

const Inbox = ({ useViewSwitching = false }: InboxProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");

  const handleLogout = () => {
    navigate("/");
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Would send message here
      setNewMessage("");
    }
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
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors",
                selectedConversation.id === conversation.id && "bg-secondary"
              )}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                  <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                </Avatar>
                {conversation.user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground truncate">{conversation.user.name}</p>
                  <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 && (
                <span className="w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground">
                  {conversation.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation.user.avatar} alt={selectedConversation.user.name} />
              <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{selectedConversation.user.name}</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.senderId === "me" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                  message.senderId === "me"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-foreground rounded-bl-none"
                )}
              >
                <p>{message.content}</p>
                <p className={cn(
                  "text-xs mt-1",
                  message.senderId === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Smile className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="hero" size="icon" onClick={handleSendMessage}>
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (useViewSwitching) {
    return content;
  }

  return (
    <MainLayout onLogout={handleLogout} hideRightSidebar useViewSwitching={useViewSwitching}>
      {content}
    </MainLayout>
  );
};

export default Inbox;
