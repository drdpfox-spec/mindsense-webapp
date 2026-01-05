import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Pill,
  Plus,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
} from "lucide-react";

type PrescriptionStatus = "draft" | "pending" | "sent" | "filled" | "cancelled" | "error";

const statusConfig: Record<PrescriptionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  draft: { label: "Draft", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  pending: { label: "Pending", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  sent: { label: "Sent", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  filled: { label: "Filled", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  error: { label: "Error", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

export default function Prescriptions() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);

  const { data: prescriptions, isLoading, refetch } = trpc.prescriptions.getAll.useQuery();
  const { data: pharmacyResults } = trpc.pharmacies.search.useQuery(
    { query: pharmacySearch, limit: 10 },
    { enabled: pharmacySearch.length >= 2 }
  );

  const createMutation = trpc.prescriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Prescription created successfully");
      setIsCreateDialogOpen(false);
      refetch();
      // Reset form
      setSelectedPharmacy(null);
      setPharmacySearch("");
    },
    onError: (error) => {
      toast.error(`Failed to create prescription: ${error.message}`);
    },
  });

  const cancelMutation = trpc.prescriptions.cancel.useMutation({
    onSuccess: () => {
      toast.success("Prescription cancelled");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel prescription: ${error.message}`);
    },
  });

  const seedPharmaciesMutation = trpc.pharmacies.seedMockData.useMutation({
    onSuccess: (data) => {
      toast.success(`Seeded ${data.count} pharmacies`);
    },
    onError: (error) => {
      toast.error(`Failed to seed pharmacies: ${error.message}`);
    },
  });

  const handleCreatePrescription = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedPharmacy) {
      toast.error("Please select a pharmacy");
      return;
    }

    createMutation.mutate({
      providerName: formData.get("providerName") as string,
      providerNpi: formData.get("providerNpi") as string || undefined,
      medicationName: formData.get("medicationName") as string,
      dosage: formData.get("dosage") as string,
      instructions: formData.get("instructions") as string,
      quantity: parseInt(formData.get("quantity") as string),
      refills: parseInt(formData.get("refills") as string) || 0,
      daysSupply: parseInt(formData.get("daysSupply") as string) || undefined,
      pharmacyNcpdpId: selectedPharmacy.ncpdpId,
      pharmacyName: selectedPharmacy.name,
      pharmacyAddress: selectedPharmacy.address,
      pharmacyPhone: selectedPharmacy.phone,
      isControlledSubstance: formData.get("isControlledSubstance") === "true",
    });
  };

  const handleCancelPrescription = (id: number) => {
    if (confirm("Are you sure you want to cancel this prescription?")) {
      cancelMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Prescriptions</h1>
          <p className="text-muted-foreground">
            View and manage your electronic prescriptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seedPharmaciesMutation.mutate()}
            disabled={seedPharmaciesMutation.isPending}
          >
            Seed Pharmacies
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Prescription</DialogTitle>
                <DialogDescription>
                  Fill in the prescription details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="providerName">Provider Name *</Label>
                    <Input
                      id="providerName"
                      name="providerName"
                      placeholder="Dr. Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="providerNpi">Provider NPI</Label>
                    <Input
                      id="providerNpi"
                      name="providerNpi"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicationName">Medication Name *</Label>
                  <Input
                    id="medicationName"
                    name="medicationName"
                    placeholder="Lisinopril"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      name="dosage"
                      placeholder="10mg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="30"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refills">Refills</Label>
                    <Input
                      id="refills"
                      name="refills"
                      type="number"
                      placeholder="0"
                      defaultValue="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daysSupply">Days Supply</Label>
                    <Input
                      id="daysSupply"
                      name="daysSupply"
                      type="number"
                      placeholder="30"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions *</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Take one tablet daily with food"
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isControlledSubstance">Controlled Substance</Label>
                  <Select name="isControlledSubstance" defaultValue="false">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pharmacy *</Label>
                  {selectedPharmacy ? (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{selectedPharmacy.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedPharmacy.address}, {selectedPharmacy.city},{" "}
                              {selectedPharmacy.state} {selectedPharmacy.zipCode}
                            </p>
                            {selectedPharmacy.phone && (
                              <p className="text-sm text-muted-foreground">
                                {selectedPharmacy.phone}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPharmacy(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search pharmacies by name, city, or zip code..."
                          value={pharmacySearch}
                          onChange={(e) => setPharmacySearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      {pharmacyResults && pharmacyResults.length > 0 && (
                        <Card>
                          <CardContent className="p-2">
                            <div className="space-y-1">
                              {pharmacyResults.map((pharmacy) => (
                                <button
                                  key={pharmacy.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPharmacy(pharmacy);
                                    setPharmacySearch("");
                                  }}
                                  className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                                >
                                  <p className="font-medium text-sm">{pharmacy.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {pharmacy.address}, {pharmacy.city}, {pharmacy.state}{" "}
                                    {pharmacy.zipCode}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {pharmacySearch.length >= 2 && pharmacyResults?.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No pharmacies found. Try a different search term.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Prescription"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {prescriptions && prescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No prescriptions yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first prescription to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {prescriptions?.map((prescription) => {
            const status = prescription.status as PrescriptionStatus;
            const config = statusConfig[status];

            return (
              <Card key={prescription.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        {prescription.medicationName}
                      </CardTitle>
                      <CardDescription>
                        Prescribed by {prescription.providerName}
                      </CardDescription>
                    </div>
                    <Badge variant={config.variant} className="flex items-center gap-1">
                      {config.icon}
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dosage</p>
                      <p className="font-medium">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{prescription.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Refills</p>
                      <p className="font-medium">{prescription.refills}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Supply</p>
                      <p className="font-medium">{prescription.daysSupply || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                    <p className="text-sm">{prescription.instructions}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pharmacy</p>
                    <p className="text-sm font-medium">{prescription.pharmacyName}</p>
                    {prescription.pharmacyAddress && (
                      <p className="text-sm text-muted-foreground">
                        {prescription.pharmacyAddress}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {prescription.prescribedAt && (
                        <span>
                          Prescribed on{" "}
                          {new Date(prescription.prescribedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {(status === "pending" || status === "sent") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelPrescription(prescription.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
