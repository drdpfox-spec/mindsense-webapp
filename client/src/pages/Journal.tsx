import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Journal() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const utils = trpc.useUtils();

  const { data: entries, isLoading } = trpc.journal.list.useQuery({ limit: 50 });

  const createMutation = trpc.journal.create.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      toast.success("Journal entry created");
      setIsDialogOpen(false);
      setContent("");
    },
  });

  const updateMutation = trpc.journal.update.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      toast.success("Journal entry updated");
      setIsDialogOpen(false);
      setEditingEntry(null);
      setContent("");
    },
  });

  const deleteMutation = trpc.journal.delete.useMutation({
    onSuccess: () => {
      utils.journal.list.invalidate();
      toast.success("Journal entry deleted");
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (editingEntry) {
      updateMutation.mutate({ entryId: editingEntry, content });
    } else {
      createMutation.mutate({ content });
    }
  };

  const handleEdit = (entry: { id: number; content: string }) => {
    setEditingEntry(entry.id);
    setContent(entry.content);
    setIsDialogOpen(true);
  };

  const handleDelete = (entryId: number) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      deleteMutation.mutate({ entryId });
    }
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setContent("");
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Health Journal</h1>
            <p className="text-muted-foreground mt-1">
              Track your thoughts, feelings, and experiences
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewEntry}>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? "Edit Journal Entry" : "New Journal Entry"}
                </DialogTitle>
                <DialogDescription>
                  {editingEntry
                    ? "Update your journal entry"
                    : "Write about your day, feelings, or any observations"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Entry Content</Label>
                  <Textarea
                    id="content"
                    placeholder="What's on your mind today?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingEntry(null);
                    setContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingEntry ? "Update" : "Save"} Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {entries && entries.length > 0 ? (
          entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <CardDescription>
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                {entry.updatedAt !== entry.createdAt && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Last edited: {new Date(entry.updatedAt).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No journal entries yet</p>
              <Button onClick={handleNewEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
