import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 10 pre-generated avatar options
const avatarOptions = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar1",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar2",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar3",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar4",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar5",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar6",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar7",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar8",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar9",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=avatar10",
];

// Interest tags
const interestTags = [
  "Follow all", "deletarune", "artists on tumblr", "ao3",
  "my chemical romance", "kpop demon hunters", "memes",
  "cats on whispr", "fl", "photography", "lgbtq", "pokemon",
  "my art", "illustration", "art work", "painting",
  "famous artwork from famous artists", "animation", "fanart"
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleAvatarContinue = () => {
    if (!selectedAvatar) {
      toast.error("Please select an avatar");
      return;
    }
    setStep(2);
  };

  const toggleInterest = (tag: string) => {
    const newInterests = new Set(selectedInterests);
    if (newInterests.has(tag)) {
      newInterests.delete(tag);
    } else {
      newInterests.add(tag);
    }
    setSelectedInterests(newInterests);
  };

  const handleInterestsContinue = async () => {
    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");

      // Save avatar to user profile
      const response = await fetch(`${API_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          avatar_url: selectedAvatar,
          interests: Array.from(selectedInterests),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success("Profile setup complete!");
      navigate("/dashboard/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link to="/" className="text-3xl font-black text-primary italic">t</Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-10">
        {step === 1 ? (
          // Step 1: Avatar Selection
          <>
            <h1 className="text-4xl font-black text-foreground italic mb-4">trendle</h1>
            <h2 className="text-2xl font-bold mb-2">Choose your avatar</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              Pick one of these avatars to represent you on Trendle. You can change this later in your settings.
            </p>

            {/* Avatar Grid */}
            <div className="grid grid-cols-5 gap-4 mb-8 max-w-lg">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={cn(
                    "relative rounded-full p-1 transition-all duration-200 hover:scale-110",
                    selectedAvatar === avatar
                      ? "ring-4 ring-primary"
                      : "ring-2 ring-transparent hover:ring-muted"
                  )}
                >
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={avatar} alt="Avatar option" />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  {selectedAvatar === avatar && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <Button
              variant="hero"
              size="xl"
              onClick={handleAvatarContinue}
              className="w-full max-w-md"
            >
              Next
            </Button>
          </>
        ) : (
          // Step 2: Interests Selection
          <>
            <h2 className="text-3xl font-bold mb-2">What are you into?</h2>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              Follow tags & topics you want to see...
            </p>

            {/* Interests Grid */}
            <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {interestTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleInterest(tag)}
                  className={cn(
                    "px-4 py-2 rounded-full font-medium transition-all duration-200",
                    selectedInterests.has(tag)
                      ? "bg-primary text-primary-foreground"
                      : "border-2 border-muted-foreground text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  + {tag}
                </button>
              ))}
            </div>

            <div className="flex gap-4 w-full max-w-md">
              <Button
                variant="outline"
                size="xl"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="hero"
                size="xl"
                onClick={handleInterestsContinue}
                disabled={saving}
                className="flex-1"
              >
                {saving ? "Saving..." : "Continue"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
