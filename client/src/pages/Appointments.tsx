import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Edit, Trash2, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Appointments() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    appointmentType: "",
    provider: "",
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  const utils = trpc.useUtils();

  const { data: appointments, isLoading } = trpc.appointments.list.useQuery();
  const { data: upcoming } = trpc.appointments.upcoming.useQuery();

  const createMutation = trpc.appointments.create.useMutation({
    onSuccess: () => {
      utils.appointments.list.invalidate();
      utils.appointments.upcoming.invalidate();
      toast.success("Appointment scheduled");
      handleCloseDialog();
    },
  });

  const updateMutation = trpc.appointments.update.useMutation({
    onSuccess: () => {
      utils.appointments.list.invalidate();
      utils.appointments.upcoming.invalidate();
      toast.success("Appointment updated");
      handleCloseDialog();
    },
  });

  const deleteMutation = trpc.appointments.delete.useMutation({
    onSuccess: () => {
      utils.appointments.list.invalidate();
      utils.appointments.upcoming.invalidate();
      toast.success("Appointment cancelled");
    },
  });

  const handleSave = () => {
    if (!formData.appointmentType || !formData.provider || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }

    const appointmentDate = new Date(`${formData.date}T${formData.time}`);

    if (editingAppt) {
      updateMutation.mutate({
        appointmentId: editingAppt,
        ...formData,
        appointmentDate,
      });
    } else {
      createMutation.mutate({
        ...formData,
        appointmentDate,
      });
    }
  };

  const handleEdit = (appt: any) => {
    setEditingAppt(appt.id);
    const date = new Date(appt.appointmentDate);
    setFormData({
      appointmentType: appt.appointmentType,
      provider: appt.provider,
      date: date.toISOString().split("T")[0],
      time: date.toTimeString().slice(0, 5),
      location: appt.location || "",
      notes: appt.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (appointmentId: number) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      deleteMutation.mutate({ appointmentId });
    }
  };

  const handleNewAppointment = () => {
    setEditingAppt(null);
    setFormData({
      appointmentType: "",
      provider: "",
      date: "",
      time: "",
      location: "",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAppt(null);
    setFormData({
      appointmentType: "",
      provider: "",
      date: "",
      time: "",
      location: "",
      notes: "",
    });
  };

  const getAppointmentBadge = (type: string) => {
    const colors: Record<string, string> = {
      psychiatrist: "bg-purple-100 text-purple-800",
      therapy: "bg-blue-100 text-blue-800",
      medication: "bg-green-100 text-green-800",
      checkup: "bg-amber-100 text-amber-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingAppts = appointments?.filter(
    (a) => new Date(a.appointmentDate) >= now
  ) || [];
  const pastAppts = appointments?.filter(
    (a) => new Date(a.appointmentDate) < now
  ) || [];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Manage your healthcare appointments
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewAppointment}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAppt ? "Edit Appointment" : "Schedule New Appointment"}
                </DialogTitle>
                <DialogDescription>
                  {editingAppt
                    ? "Update appointment details"
                    : "Schedule a new healthcare appointment"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type *</Label>
                  <Input
                    id="type"
                    placeholder="e.g., Psychiatrist, Therapy"
                    value={formData.appointmentType}
                    onChange={(e) =>
                      setFormData({ ...formData, appointmentType: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    placeholder="e.g., Dr. Smith"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., 123 Main St, Suite 200"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  {editingAppt ? "Update" : "Schedule"} Appointment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppts.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppts.length > 0 ? (
            upcomingAppts.map((appt) => (
              <Card key={appt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{appt.provider}</CardTitle>
                      <CardDescription>
                        <Badge className={getAppointmentBadge(appt.appointmentType)}>
                          {appt.appointmentType}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(appt)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(appt.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(appt.appointmentDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {appt.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{appt.location}</span>
                    </div>
                  )}
                  {appt.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{appt.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button onClick={handleNewAppointment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppts.length > 0 ? (
            pastAppts.map((appt) => (
              <Card key={appt.id} className="opacity-75">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{appt.provider}</CardTitle>
                      <CardDescription>
                        <Badge className={getAppointmentBadge(appt.appointmentType)}>
                          {appt.appointmentType}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(appt.appointmentDate).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No past appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
