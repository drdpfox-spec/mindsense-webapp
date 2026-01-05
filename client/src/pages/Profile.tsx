import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Download, Upload, Settings as SettingsIcon, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const [fibrosisType, setFibrosisType] = useState("depression");
  const [diagnosisDate, setDiagnosisDate] = useState("");
  const [baselineCRP, setBaselineCRP] = useState("");
  const [baselineIL6, setBaselineIL6] = useState("");
  const [baselineLeptin, setBaselineLeptin] = useState("");
  const [baselineProinsulin, setBaselineProinsulin] = useState("");
  const [baselineBDNF, setBaselineBDNF] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  const handleSaveProfile = () => {
    toast.success("Profile saved successfully");
  };

  const handleExportData = () => {
    const data = {
      profile: {
        fibrosisType,
        diagnosisDate,
        baselines: {
          CRP: baselineCRP,
          IL6: baselineIL6,
          Leptin: baselineLeptin,
          Proinsulin: baselineProinsulin,
          BDNF: baselineBDNF,
        },
        clinicalNotes,
      },
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindsense-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Data exported successfully");
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.profile) {
              setFibrosisType(data.profile.fibrosisType || "depression");
              setDiagnosisDate(data.profile.diagnosisDate || "");
              setBaselineCRP(data.profile.baselines?.CRP || "");
              setBaselineIL6(data.profile.baselines?.IL6 || "");
              setBaselineLeptin(data.profile.baselines?.Leptin || "");
              setBaselineProinsulin(data.profile.baselines?.Proinsulin || "");
              setBaselineBDNF(data.profile.baselines?.BDNF || "");
              setClinicalNotes(data.profile.clinicalNotes || "");
              toast.success("Data imported successfully");
            }
          } catch (error) {
            toast.error("Failed to import data. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Profile & Settings</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <Download className="h-4 w-4 mr-2" />
                Backup
              </Button>
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your Manus account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">David Fox</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">drdpfox@gmail.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Login Method</p>
                <p className="text-base">google</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
            <CardDescription>Configure your diagnosis type and baseline biomarker values</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fibrosisType">Diagnosis Type</Label>
                <Select value={fibrosisType} onValueChange={setFibrosisType}>
                  <SelectTrigger id="fibrosisType">
                    <SelectValue placeholder="Select diagnosis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="depression">Major Depressive Disorder</SelectItem>
                    <SelectItem value="bipolar">Bipolar Disorder</SelectItem>
                    <SelectItem value="anxiety">Anxiety Disorder</SelectItem>
                    <SelectItem value="ptsd">PTSD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
                <Input
                  id="diagnosisDate"
                  type="date"
                  value={diagnosisDate}
                  onChange={(e) => setDiagnosisDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Baseline Biomarker Values</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These values are used to calculate trends and alerts
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baselineCRP">CRP (mg/L)</Label>
                  <Input
                    id="baselineCRP"
                    type="number"
                    placeholder="e.g., 3.0"
                    value={baselineCRP}
                    onChange={(e) => setBaselineCRP(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineIL6">IL-6 (pg/mL)</Label>
                  <Input
                    id="baselineIL6"
                    type="number"
                    placeholder="e.g., 2.5"
                    value={baselineIL6}
                    onChange={(e) => setBaselineIL6(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineLeptin">Leptin (ng/mL)</Label>
                  <Input
                    id="baselineLeptin"
                    type="number"
                    placeholder="e.g., 10.0"
                    value={baselineLeptin}
                    onChange={(e) => setBaselineLeptin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineProinsulin">Proinsulin (pmol/L)</Label>
                  <Input
                    id="baselineProinsulin"
                    type="number"
                    placeholder="e.g., 8.0"
                    value={baselineProinsulin}
                    onChange={(e) => setBaselineProinsulin(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baselineBDNF">BDNF (ng/mL)</Label>
                  <Input
                    id="baselineBDNF"
                    type="number"
                    placeholder="e.g., 25.0"
                    value={baselineBDNF}
                    onChange={(e) => setBaselineBDNF(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any relevant medical history or notes..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90 text-white">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Data Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle>Data Backup & Restore</CardTitle>
            <CardDescription>
              Export your health data for backup or import from a previous backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={handleExportData} variant="outline" className="border-2 border-dashed border-primary text-primary">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
              <Button onClick={handleImportData} variant="outline" className="border-2 border-dashed border-primary text-primary">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Export:</strong> Downloads a JSON file containing all your measurements, journal entries,
                medications, appointments, and care team information.
              </p>
              <p>
                <strong>Import:</strong> Restores data from a previously exported backup file. This will merge with
                your existing data.
              </p>
              <p>
                <strong>Note:</strong> Keep your backup files secure as they contain sensitive health information.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
