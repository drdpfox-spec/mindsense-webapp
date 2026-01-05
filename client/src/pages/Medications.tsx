import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pill, Plus, Edit, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Medications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    prescribedBy: "",
  });

  const utils = trpc.useUtils();

  const { data: medications, isLoading } = trpc.medications.list.useQuery();

  const createMutation = trpc.medications.create.useMutation({
    onSuccess: () => {
      utils.medications.list.invalidate();
      toast.success("Medication added");
      handleCloseDialog();
    },
  });

  const updateMutation = trpc.medications.update.useMutation({
    onSuccess: () => {
      utils.medications.list.invalidate();
      toast.success("Medication updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = trpc.medications.delete.useMutation({
    onSuccess: () => {
      utils.medications.list.invalidate();
      toast.success("Medication deleted");
    },
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.dosage.trim() || !formData.frequency.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingMed) {
      updateMutation.mutate({ medicationId: editingMed, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (med: any) => {
    setEditingMed(med.id);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      prescribedBy: med.prescribedBy || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (medicationId: number) => {
    if (confirm("Are you sure you want to delete this medication?")) {
      deleteMutation.mutate({ medicationId });
    }
  };

  const handleNewMedication = () => {
    setEditingMed(null);
    setFormData({
      name: "",
      dosage: "",
      frequency: "",
      prescribedBy: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMed(null);
    setFormData({
      name: "",
      dosage: "",
      frequency: "",
      prescribedBy: "",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medications</h1>
            <p className="text-muted-foreground mt-1">
              Manage your medication schedule and adherence
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewMedication}>
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMed ? "Edit Medication" : "Add New Medication"}
                </DialogTitle>
                <DialogDescription>
                  {editingMed
                    ? "Update medication details"
                    : "Add a new medication to your list"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medication Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sertraline"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage *</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 50mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Once daily"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescribedBy">Prescribed By</Label>
                  <Input
                    id="prescribedBy"
                    placeholder="e.g., Dr. Smith"
                    value={formData.prescribedBy}
                    onChange={(e) =>
                      setFormData({ ...formData, prescribedBy: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingMed ? "Update" : "Add"} Medication
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {medications && medications.length > 0 ? (
          medications.map((med) => (
            <Card key={med.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{med.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(med)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(med.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {med.prescribedBy && `Prescribed by ${med.prescribedBy}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Dosage</p>
                  <Badge variant="secondary">{med.dosage}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{med.frequency}</span>
                </div>
                {med.startDate && (
                  <p className="text-xs text-muted-foreground">
                    Started: {new Date(med.startDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Pill className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No medications added yet</p>
              <Button onClick={handleNewMedication}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Medication
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
