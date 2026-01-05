import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Download, Loader2, Calendar, Info } from "lucide-react";
import { toast } from "sonner";
import { HelpIcon } from "@/components/HelpIcon";

export default function ProgressReport() {
  const { isAuthenticated } = useAuth();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [reportData, setReportData] = useState<{
    htmlContent: string;
    fileName: string;
    dataPoints: {
      measurements: number;
      journalEntries: number;
      medications: number;
      medicationLogs: number;
    };
  } | null>(null);

  const generateMutation = trpc.profile.generateProgressReport.useMutation({
    onSuccess: (data) => {
      setReportData(data);
      toast.success("Report generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error("Start date must be before end date");
      return;
    }

    generateMutation.mutate({
      startDate: start,
      endDate: end,
    });
  };

  const handleDownload = () => {
    if (!reportData) return;

    const blob = new Blob([reportData.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded!");
  };

  const handlePrint = () => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportData.htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to generate progress reports</p>
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
          <FileText className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold">Progress Reports</h1>
          <HelpIcon
            title="Progress Reports"
            content="Generate comprehensive PDF-ready reports summarizing your biomarker trends, medication adherence, and symptom patterns. These reports are optimized for sharing with healthcare providers during appointments."
            size="md"
          />
        </div>
        <p className="text-muted-foreground">Generate comprehensive health reports for your healthcare providers</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select the date range for your progress report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 30);
                setStartDate(date.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              variant="outline"
              size="sm"
            >
              Last 30 Days
            </Button>
            <Button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 90);
                setStartDate(date.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              variant="outline"
              size="sm"
            >
              Last 90 Days
            </Button>
            <Button
              onClick={() => {
                const date = new Date();
                date.setMonth(date.getMonth() - 6);
                setStartDate(date.toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              variant="outline"
              size="sm"
            >
              Last 6 Months
            </Button>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Preview & Actions */}
      {reportData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{reportData.dataPoints.measurements}</div>
                  <div className="text-xs text-muted-foreground">Measurements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reportData.dataPoints.journalEntries}</div>
                  <div className="text-xs text-muted-foreground">Journal Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{reportData.dataPoints.medications}</div>
                  <div className="text-xs text-muted-foreground">Medications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reportData.dataPoints.medicationLogs}</div>
                  <div className="text-xs text-muted-foreground">Medication Logs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Download & Share</CardTitle>
              <CardDescription>Save or print your progress report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Print / Save as PDF
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Sharing with Healthcare Providers</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Download the HTML file and email it to your provider</li>
                      <li>Use "Print / Save as PDF" to create a PDF version</li>
                      <li>Bring a printed copy to your next appointment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview of your generated report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={reportData.htmlContent}
                  className="w-full h-[600px]"
                  title="Report Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Initial State */}
      {!reportData && !generateMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Generate</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Select a date range and click "Generate Report" to create a comprehensive progress report. 
                The report will include biomarker trends, medication adherence, and symptom summaries.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                <p>✓ Biomarker trend charts and statistics</p>
                <p>✓ Medication adherence summary</p>
                <p>✓ Symptom pattern analysis</p>
                <p>✓ Clinical recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
