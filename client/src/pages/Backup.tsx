import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Database, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { HelpIcon } from "@/components/HelpIcon";

export default function Backup() {
  const { isAuthenticated } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: exportData, refetch: fetchExportData } = trpc.profile.exportAllData.useQuery(undefined, {
    enabled: false, // Don't auto-fetch
  });

  const importMutation = trpc.profile.importData.useMutation({
    onSuccess: (result) => {
      toast.success(`Data imported successfully! ${result.imported.measurements} measurements, ${result.imported.journal} journal entries, ${result.imported.medications} medications, ${result.imported.appointments} appointments, ${result.imported.careTeam} care team members.`);
      setIsImporting(false);
    },
    onError: (error) => {
      toast.error(`Failed to import data: ${error.message}`);
      setIsImporting(false);
    },
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data } = await fetchExportData();
      
      if (!data) {
        toast.error("No data to export");
        setIsExporting(false);
        return;
      }

      // Create JSON file
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Download file
      const link = document.createElement("a");
      link.href = url;
      link.download = `fibrosense-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Backup exported successfully!");
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      
      // Validate JSON
      try {
        JSON.parse(text);
      } catch {
        toast.error("Invalid JSON file");
        setIsImporting(false);
        return;
      }

      // Import data
      importMutation.mutate({ data: text });
    } catch (error: any) {
      toast.error(`Failed to read file: ${error.message}`);
      setIsImporting(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access backup & restore</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-bold">Data Backup & Restore</h1>
          <HelpIcon
            title="Backup & Restore"
            content="Export all your health data to a JSON file for safekeeping. You can restore this data later if needed. The backup includes measurements, journal entries, medications, appointments, and care team information. Keep your backup file secure as it contains sensitive health information."
            size="md"
          />
        </div>
        <p className="text-muted-foreground">Protect your health data with regular backups</p>
      </div>

      {/* Warning Card */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-yellow-900 dark:text-yellow-100">Important Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
          <p>
            • <strong>Backup files contain sensitive health information.</strong> Store them securely and never share them publicly.
          </p>
          <p>
            • <strong>Importing data will add to your existing data,</strong> not replace it. Duplicate entries may be created if you import the same backup multiple times.
          </p>
          <p>
            • <strong>Regular backups are recommended</strong> to ensure you never lose your health history, especially before major changes or device switches.
          </p>
        </CardContent>
      </Card>

      {/* Export Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-teal-600" />
            <CardTitle>Export Data</CardTitle>
          </div>
          <CardDescription>
            Download all your health data as a JSON file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">What's included in the backup:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Health profile and baseline values
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                All biomarker measurements
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Journal entries and symptoms
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Medications and adherence logs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Appointments and reminders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Care team contacts and sharing preferences
              </li>
            </ul>
          </div>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <CardTitle>Import Data</CardTitle>
          </div>
          <CardDescription>
            Restore data from a previously exported backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Importing will add the backup data to your current data. If you want to completely replace your data, please contact support or manually delete existing data first.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={handleImportClick}
            disabled={isImporting}
            variant="outline"
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Choose Backup File
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Best Practices Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            <CardTitle>Backup Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>
                <strong>Export regularly:</strong> Create a new backup monthly or after significant data entry (new medications, major health events).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>
                <strong>Store securely:</strong> Keep backup files in a secure location like encrypted cloud storage or a password-protected folder.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>
                <strong>Test your backups:</strong> Occasionally verify that your backup files are valid and can be imported successfully.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 mt-1">•</span>
              <span>
                <strong>Before device changes:</strong> Always export your data before switching to a new device or browser.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
