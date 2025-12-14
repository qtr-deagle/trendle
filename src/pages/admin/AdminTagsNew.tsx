import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Merge2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCallWithAuth } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/admin/AdminLayout";

interface Tag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  usage_count: number;
  is_active: boolean;
  is_nsfw: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  is_nsfw: boolean;
  is_active: boolean;
}

const AdminTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<number | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [tagToMerge, setTagToMerge] = useState<number | null>(null);
  const [mergeTarget, setMergeTarget] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    is_nsfw: false,
    is_active: true,
  });
  const { toast } = useToast();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await apiCallWithAuth(
        "/admin/tags",
        {
          method: "GET",
        },
        token
      );

      if (response.ok) {
        const data = await response.json();
        setTags(data.tags);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
      is_nsfw: tag.is_nsfw,
      is_active: tag.is_active,
    });
    setEditingId(tag.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast({
        title: "Error",
        description: "Name and slug are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      if (editingId) {
        // Update
        const response = await apiCallWithAuth(
          `/admin/tags/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(formData),
          },
          token
        );

        if (response.ok) {
          toast({ title: "Success", description: "Tag updated" });
          fetchTags();
          setShowForm(false);
          setEditingId(null);
        }
      } else {
        // Create
        const response = await apiCallWithAuth(
          "/admin/tags",
          {
            method: "POST",
            body: JSON.stringify(formData),
          },
          token
        );

        if (response.ok) {
          toast({ title: "Success", description: "Tag created" });
          fetchTags();
          setShowForm(false);
        }
      }

      setFormData({
        name: "",
        slug: "",
        description: "",
        is_nsfw: false,
        is_active: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save tag",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!tagToDelete) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/tags/${tagToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast({ title: "Success", description: "Tag deleted" });
        fetchTags();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setTagToDelete(null);
    }
  };

  const handleMerge = async () => {
    if (!tagToMerge || !mergeTarget) {
      toast({
        title: "Error",
        description: "Please select both source and target tag",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`/api/admin/tags/${tagToMerge}/merge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merge_into_tag_id: parseInt(mergeTarget) }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Tags merged successfully" });
        fetchTags();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to merge tags",
        variant: "destructive",
      });
    } finally {
      setShowMergeDialog(false);
      setTagToMerge(null);
      setMergeTarget("");
    }
  };

  return (
    <AdminLayout title="Tags Management">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tags ({tags.length})</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "New Tag"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Tag" : "Create Tag"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Tag name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Slug *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="tag-slug"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Tag description"
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <label className="text-sm font-medium">NSFW</label>
                <Switch
                  checked={formData.is_nsfw}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_nsfw: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <label className="text-sm font-medium">Active</label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Update Tag" : "Create Tag"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: "",
                    slug: "",
                    description: "",
                    is_nsfw: false,
                    is_active: true,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search tags by name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-secondary border-none"
        />
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="text-center py-8">Loading tags...</div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tags found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <Card key={tag.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">#{tag.name}</h3>
                    {tag.is_nsfw && <Badge variant="destructive">NSFW</Badge>}
                    <Badge variant={tag.is_active ? "default" : "secondary"}>
                      {tag.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    /{tag.slug}
                  </p>
                </div>
              </div>

              {tag.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {tag.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 p-2 bg-muted rounded">
                <span>
                  Used {tag.usage_count} time{tag.usage_count !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(tag)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTagToMerge(tag.id);
                    setShowMergeDialog(true);
                  }}
                >
                  <Merge2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setTagToDelete(tag.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Tags</AlertDialogTitle>
            <AlertDialogDescription>
              Merge "{tags.find((t) => t.id === tagToMerge)?.name || "Tag"}"
              into another tag. The source tag will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Merge Into</label>
            <Select value={mergeTarget} onValueChange={setMergeTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Select target tag..." />
              </SelectTrigger>
              <SelectContent>
                {tags
                  .filter((t) => t.id !== tagToMerge)
                  .map((tag) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name} (used {tag.usage_count} times)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge} className="flex-1">
              Merge
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminTags;
