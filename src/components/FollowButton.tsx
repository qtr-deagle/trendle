import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { apiCallWithAuth } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUsername: string;
  onFollowChange?: (isFollowing: boolean) => void;
  disabled?: boolean;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const FollowButton = ({
  targetUsername,
  onFollowChange,
  disabled = false,
  showIcon = true,
  className = "",
  size = "md",
}: FollowButtonProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check follow status on mount and when targetUsername changes
  useEffect(() => {
    if (isAuthenticated && targetUsername && user?.username !== targetUsername) {
      checkFollowStatus();
    } else {
      setInitialLoading(false);
    }
  }, [isAuthenticated, targetUsername, user?.username]);

  // Listen for follow status changes from other components
  useEffect(() => {
    const handleFollowStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { username, isFollowing: newFollowStatus } = customEvent.detail;
      
      // If this event is for the same user we're tracking, update our state immediately
      if (username === targetUsername) {
        console.log(`[FollowButton] Detected follow status change for ${targetUsername}: ${newFollowStatus}`);
        setIsFollowing(newFollowStatus);
      }
    };

    window.addEventListener("followStatusChanged", handleFollowStatusChange);
    return () => {
      window.removeEventListener("followStatusChanged", handleFollowStatusChange);
    };
  }, [targetUsername]);

  const checkFollowStatus = async (): Promise<boolean> => {
    try {
      setInitialLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("[FollowButton] No token found, setting isFollowing to false");
        setIsFollowing(false);
        setInitialLoading(false);
        return false;
      }

      console.log(`[FollowButton] Checking follow status for ${targetUsername}`);
      
      const response = await apiCallWithAuth(
        `/user/${targetUsername}/follow-status`,
        {
          method: "GET",
        },
        token
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`[FollowButton] Follow status response:`, data);
        setIsFollowing(data.isFollowing);
        return data.isFollowing;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[FollowButton] Follow status check failed with status ${response.status}:`, errorData);
        setIsFollowing(false);
        return false;
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
      setIsFollowing(false);
      return false;
    } finally {
      setInitialLoading(false);
    }
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to follow users");
      return;
    }

    if (user?.username === targetUsername) {
      toast.error("You cannot follow yourself");
      return;
    }

    setLoading(true);
    const previousFollowStatus = isFollowing;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const endpoint = isFollowing
        ? `/user/${targetUsername}/unfollow`
        : `/user/${targetUsername}/follow`;

      console.log(`[FollowButton] Attempting to ${isFollowing ? 'unfollow' : 'follow'} ${targetUsername}`);

      const response = await apiCallWithAuth(
        endpoint,
        {
          method: "POST",
        },
        token
      );

      // Handle response status
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        
        console.error(`[FollowButton] API error: ${response.status}`, data);
        
        // Check if the error is "already following"
        if (response.status === 400 && data.error?.includes("already following")) {
          // If we get "already following" but our state says we're not following, sync state
          console.log("[FollowButton] Syncing state: setting isFollowing to true");
          setIsFollowing(true);
          throw new Error("You are already following this user");
        }
        
        throw new Error(data.error || "Failed to update follow status");
      }

      console.log(`[FollowButton] API success for ${endpoint}`);
      
      // Update the state immediately based on the action taken
      const newFollowState = !previousFollowStatus;
      setIsFollowing(newFollowState);
      
      console.log(`[FollowButton] State updated: ${previousFollowStatus} -> ${newFollowState}`);
      
      onFollowChange?.(newFollowState);

      // Dispatch a custom event so other components can listen and update
      window.dispatchEvent(
        new CustomEvent("followStatusChanged", {
          detail: { username: targetUsername, isFollowing: newFollowState },
        })
      );

      toast.success(
        newFollowState ? "Now following user" : "Unfollowed user"
      );
    } catch (error) {
      console.error("Follow action error:", error);
      // Revert to previous state on error
      setIsFollowing(previousFollowStatus);
      
      toast.error(
        error instanceof Error ? error.message : "Failed to update follow status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if not authenticated or if it's the current user
  if (!isAuthenticated || user?.username === targetUsername) {
    return null;
  }

  // Show loading state while checking
  if (initialLoading) {
    return (
      <Button
        disabled
        variant="outline"
        size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        className={className}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleFollowClick}
      disabled={disabled || loading}
      variant={isFollowing ? "outline" : "hero"}
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
      className={`gap-2 ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : showIcon ? (
        isFollowing ? (
          <UserMinus className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )
      ) : null}
      <span>{isFollowing ? "Following" : "Follow"}</span>
    </Button>
  );
};

export default FollowButton;
