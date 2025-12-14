import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [tagline, setTagline] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [privacy, setPrivacy] = useState("public");

  const handleLogout = () => {
    navigate("/");
  };

  const addTag = () => {
    if (tagInput.trim() && tags.length < 10) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || !handle.trim() || !tagline.trim() || tags.length === 0) {
      toast.error("Please fill in all required fields and add at least one tag.");
      return;
    }
    toast.success("Community created successfully!");
    navigate("/communities");
  };

  return (
    <MainLayout onLogout={handleLogout}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-foreground mb-8">New community</h1>

        {/* Community Details */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">Community Details</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose a short, descriptive name, a handle for the URL, and add a tagline that helps people understand what the community is about.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="title">Title <span className="text-muted-foreground">Required</span></Label>
                <span className="text-sm text-muted-foreground">{title.length} / 50</span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 50))}
                placeholder="Enter community title"
                className="bg-transparent border-border"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="handle">Handle <span className="text-muted-foreground">Required</span></Label>
                <span className="text-sm text-muted-foreground">{handle.length} / 30</span>
              </div>
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.slice(0, 30).toLowerCase().replace(/\s/g, ""))}
                placeholder="community-handle"
                className="bg-transparent border-border"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="tagline">Tagline <span className="text-muted-foreground">Required</span></Label>
                <span className="text-sm text-muted-foreground">{tagline.length} / 300</span>
              </div>
              <Textarea
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value.slice(0, 300))}
                placeholder="What is this community about?"
                className="bg-transparent border-border min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">Tags</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Add up to 10 related tags to help describe your community. At least one tag is required.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => removeTag(index)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length < 10 && (
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="#add tag"
                  className="w-32 h-8 text-sm bg-transparent border-border"
                />
                <Button variant="ghost" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">Privacy</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Choose how people can see what's in your community.
          </p>

          <RadioGroup value={privacy} onValueChange={setPrivacy} className="space-y-4">
            <div 
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                privacy === "public" ? "border-primary bg-primary/10" : "border-border hover:border-muted"
              }`}
              onClick={() => setPrivacy("public")}
            >
              <RadioGroupItem value="public" id="public" />
              <div>
                <Label htmlFor="public" className="font-medium cursor-pointer">Public community</Label>
                <p className="text-sm text-muted-foreground">
                  Anyone can see posts within this community. Only members can see comments and reactions.
                </p>
              </div>
            </div>

            <div 
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                privacy === "private" ? "border-primary bg-primary/10" : "border-border hover:border-muted"
              }`}
              onClick={() => setPrivacy("private")}
            >
              <RadioGroupItem value="private" id="private" />
              <div>
                <Label htmlFor="private" className="font-medium cursor-pointer">Private community</Label>
                <p className="text-sm text-muted-foreground">
                  Only approved members can see posts, comments, and reactions.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button variant="ghost" asChild>
            <Link to="/communities">Cancel</Link>
          </Button>
          <Button variant="hero" onClick={handleSubmit}>
            Create Community
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateCommunity;
