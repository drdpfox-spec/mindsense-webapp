import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2, Phone, Mail, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function CareTeam() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    specialty: "",
    phone: "",
    email: "",
  });

  const utils = trpc.useUtils();

  const { data: careTeam, isLoading } = trpc.careTeam.list.useQuery();

  const createMutation = trpc.careTeam.create.useMutation({
    onSuccess: () => {
      utils.careTeam.list.invalidate();
      toast.success("Care team member added");
      handleCloseDialog();
    },
  });

  const updateMutation = trpc.careTeam.update.useMutation({
    onSuccess: () => {
      utils.careTeam.list.invalidate();
      toast.success("Care team member updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = trpc.careTeam.delete.useMutation({
    onSuccess: () => {
      utils.careTeam.list.invalidate();
      toast.success("Care team member removed");
    },
  });

  const handleSave = () => {
    if (!formData.name || !formData.role) {
      toast.error("Please fill in name and role");
      return;
    }

    if (editingMember) {
      updateMutation.mutate({ memberId: editingMember, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      specialty: member.specialty || "",
      phone: member.phone || "",
      email: member.email || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (memberId: number) => {
    if (confirm("Are you sure you want to remove this care team member?")) {
      deleteMutation.mutate({ memberId });
    }
  };

  const handleNewMember = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      specialty: "",
      phone: "",
      email: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMember(null);
    setFormData({
      name: "",
      role: "",
      specialty: "",
      phone: "",
      email: "",
    });
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      psychiatrist: "bg-purple-100 text-purple-800",
      therapist: "bg-blue-100 text-blue-800",
      nurse: "bg-green-100 text-green-800",
      "case-manager": "bg-amber-100 text-amber-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading care team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Care Team</h1>
            <p className="text-muted-foreground mt-1">
              Manage your healthcare providers and support team
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Care Team Member" : "Add New Care Team Member"}
                </DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Update care team member details"
                    : "Add a new healthcare provider to your care team"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Dr. Sarah Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Psychiatrist, Therapist"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    placeholder="e.g., Cognitive Behavioral Therapy"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., dr.johnson@clinic.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  {editingMember ? "Update" : "Add"} Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {careTeam && careTeam.length > 0 ? (
          careTeam.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>
                      <Badge className={getRoleBadge(member.role)}>{member.role}</Badge>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(member.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.specialty && (
                  <p className="text-sm text-muted-foreground">{member.specialty}</p>
                )}
                <div className="space-y-2">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${member.phone}`} className="hover:underline">
                        {member.phone}
                      </a>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${member.email}`} className="hover:underline">
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No care team members added yet</p>
              <Button onClick={handleNewMember}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Provider
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
