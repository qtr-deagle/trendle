import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(true);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setOpen(false);
    navigate("/dashboard/home");
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be less than 100MB");
      return;
    }

    // TODO: Implement video upload when backend supports it
    toast.info("Video uploads coming soon!");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // Only allow 1 image per post

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Create local preview
    const preview = URL.createObjectURL(file);
    setImageFiles([file]);
    setImagePreviews([preview]);

    // Upload to server
    setIsUploading(true);
    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      setUploadedImageUrl(data.image_url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
      // Clear preview on error
      setImageFiles([]);
      setImagePreviews([]);
      setUploadedImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreviews.length > 0) {
      URL.revokeObjectURL(imagePreviews[0]);
    }
    setImageFiles([]);
    setImagePreviews([]);
    setUploadedImageUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handlePost = async () => {
    if (!content.trim() && !uploadedImageUrl) {
      toast.error("Please add some content or upload an image");
      return;
    }

    setIsPosting(true);
    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("token");

      const payload: {
        content: string;
        image_url: string | null;
        tags?: string[];
      } = {
        content: content.trim(),
        image_url: uploadedImageUrl,
      };

      if (tags.length > 0) {
        payload.tags = tags;
      }

      const response = await fetch(`${API_URL}/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      toast.success("Post created successfully!");
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create post"
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Create Post</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new post with text, images, or video
        </DialogDescription>
        {/* Header with User Info */}
        <DialogHeader className="flex items-center gap-4 pb-4 border-b border-sidebar-border">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback>{user?.username?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user?.username}</p>
            <p className="text-xs text-muted-foreground">Share your thoughts</p>
          </div>
        </DialogHeader>

        {/* Content Area */}
        <div className="space-y-6 py-6">
          {/* Text Content */}
          <textarea
            placeholder="Go ahead, put anything."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[100px] bg-secondary text-foreground placeholder-muted-foreground rounded-lg p-4 border border-sidebar-border focus:outline-none focus:border-primary resize-none"
          />

          {/* Image Upload Section */}
          <div className="space-y-3">
            {imagePreviews.length > 0 ? (
              <div className="relative rounded-lg overflow-hidden bg-secondary">
                <img
                  src={imagePreviews[0]}
                  alt="Preview"
                  className="w-full max-h-[300px] object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading || isPosting}
                className="w-full py-8 border-2 border-dashed border-sidebar-border rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Upload a photo
                </span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                #
              </span>
              <Input
                placeholder="add tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="pl-7 bg-secondary border-sidebar-border focus:border-primary"
              />
            </div>

            {/* Tag List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 pt-4 border-t border-sidebar-border">
          <Button variant="outline" onClick={handleClose} disabled={isPosting}>
            Close
          </Button>
          <Button className="ml-auto" onClick={handlePost} disabled={isPosting}>
            {isPosting ? "Posting..." : "Post now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
