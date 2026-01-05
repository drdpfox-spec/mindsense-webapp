import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, FileText, Download, Upload, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { getLoginUrl } from "@/const";
import NotificationSettings from "@/components/NotificationSettings";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: biomarkerData } = trpc.biomarkers.getLatest.useQuery();
  const { data: insights } = trpc.insights.generate.useQuery();
  const { data: medications } = trpc.medications.list.useQuery();

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.text("MindSense Health Report", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      // Patient Information
      doc.setFontSize(14);
      doc.text("Patient Information", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(`Name: ${user?.name || "N/A"}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Email: ${user?.email || "N/A"}`, 20, yPosition);
      yPosition += 10;

      // Biomarker Summary
      doc.setFontSize(14);
      doc.text("Latest Biomarker Readings", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      if (biomarkerData && biomarkerData.length > 0) {
        biomarkerData.forEach((reading) => {
          doc.text(
            `${reading.biomarkerType}: ${reading.value} ${reading.unit || ""}`,
            20,
            yPosition
          );
          yPosition += 6;
        });
      } else {
        doc.text("No biomarker data available", 20, yPosition);
        yPosition += 6;
      }
      yPosition += 5;

      // Medications
      doc.setFontSize(14);
      doc.text("Current Medications", 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      if (medications && medications.length > 0) {
        medications.forEach((med) => {
          doc.text(`${med.name} - ${med.dosage} (${med.frequency})`, 20, yPosition);
          yPosition += 6;
        });
      } else {
        doc.text("No medications recorded", 20, yPosition);
        yPosition += 6;
      }
      yPosition += 5;

      // AI Insights
      if (insights && insights.insights && insights.insights.length > 0) {
        doc.setFontSize(14);
        doc.text("AI-Generated Insights", 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        insights.insights.slice(0, 3).forEach((insight) => {
          const lines = doc.splitTextToSize(
            `• ${insight.title}: ${insight.description}`,
            pageWidth - 40
          );
          lines.forEach((line: string) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, 20, yPosition);
            yPosition += 6;
          });
          yPosition += 3;
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(`mindsense-report-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDataBackup = () => {
    // Export all user data as JSON
    const backupData = {
      user: {
        name: user?.name,
        email: user?.email,
      },
      biomarkers: biomarkerData,
      medications,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mindsense-backup-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Data backup downloaded");
  };

  const utils = trpc.useUtils();

  const handleExportFHIR = async () => {
    try {
      const fhirBundle = await utils.fhir.exportBundle.fetch();
      const dataStr = JSON.stringify(fhirBundle, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/fhir+json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mindsense-fhir-export-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("FHIR bundle exported successfully");
    } catch (error) {
      console.error("FHIR export error:", error);
      toast.error("Failed to export FHIR data");
    }
  };

  const handleDataRestore = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          console.log("Backup data loaded:", data);
          toast.success("Backup file loaded (restore functionality pending)");
        } catch (error) {
          toast.error("Invalid backup file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = getLoginUrl();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and export your health data
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name || "User"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Reports Card */}
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate comprehensive health reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Generate PDF Report"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Includes biomarker data, medications, and AI insights
            </p>
          </CardContent>
        </Card>

        {/* Data Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Backup and restore your health data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDataBackup}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Data Backup
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportFHIR}
            >
              <FileText className="h-4 w-4 mr-2" />
              Export FHIR (EHR Integration)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleDataRestore}
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore from Backup
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
        <NotificationSettings />
      </div>
    </div>
  );
}
