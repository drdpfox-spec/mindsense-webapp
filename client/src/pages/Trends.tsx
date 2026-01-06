import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Activity, Download, FileText, FileSpreadsheet } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { BIOMARKER_LIST } from "@shared/biomarkers";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import type { ChartConfiguration } from "chart.js";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type ViewMode = "single" | "compare";
type TimeRange = "7" | "30" | "90";

export default function Trends() {
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedBiomarker, setSelectedBiomarker] = useState(BIOMARKER_LIST[0].id);
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<string[]>([BIOMARKER_LIST[0].id]);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [showMultiBiomarkerSelect, setShowMultiBiomarkerSelect] = useState(false);
  const [chartCanvasRef, setChartCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const toggleBiomarker = (biomarkerId: string) => {
    setSelectedBiomarkers((prev) =>
      prev.includes(biomarkerId)
        ? prev.filter((id) => id !== biomarkerId)
        : [...prev, biomarkerId]
    );
  };

  const handleExportCSV = () => {
    if (!biomarkerReadings || biomarkerReadings.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      const selectedBiomarkerIds = viewMode === "single" ? [selectedBiomarker] : selectedBiomarkers;
      exportToCSV(biomarkerReadings, selectedBiomarkerIds, timeRange);
      toast.success("CSV exported successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export CSV");
    }
  };

  const handleExportPDF = async () => {
    if (!biomarkerReadings || biomarkerReadings.length === 0) {
      toast.error("No data available to export");
      return;
    }

    setIsExporting(true);
    try {
      const selectedBiomarkerIds = viewMode === "single" ? [selectedBiomarker] : selectedBiomarkers;
      await exportToPDF(biomarkerReadings, selectedBiomarkerIds, timeRange, chartCanvasRef);
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const { data: user } = trpc.auth.me.useQuery();
  const isAuthenticated = !!user;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));

  const { data: biomarkerReadings } = trpc.biomarkers.getByDateRange.useQuery(
    { startDate, endDate },
    { enabled: isAuthenticated }
  );

  const hasData = biomarkerReadings && biomarkerReadings.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-foreground">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Biomarker Trends</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Trend Analysis Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trend Analysis</CardTitle>
            <CardDescription className="text-xs">Visualize biomarker changes over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "compare" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("compare")}
                className={viewMode === "compare" ? "bg-yellow-400 hover:bg-yellow-500 text-black" : ""}
              >
                Compare Periods
              </Button>
              <Button
                variant={viewMode === "single" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("single")}
                className={viewMode === "single" ? "bg-yellow-400 hover:bg-yellow-500 text-black" : ""}
              >
                Single Biomarker
              </Button>
              <Button
                variant={viewMode === "compare" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("compare");
                  setShowMultiBiomarkerSelect(true);
                }}
                className={viewMode === "compare" ? "bg-yellow-400 hover:bg-yellow-500 text-black" : ""}
              >
                Multi-Biomarker
              </Button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {viewMode === "single" ? (
                <div className="flex gap-2">
                  <Select value={selectedBiomarker} onValueChange={setSelectedBiomarker}>
                    <SelectTrigger className="w-[180px] bg-yellow-50 border-yellow-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BIOMARKER_LIST.map((biomarker) => (
                        <SelectItem key={biomarker.id} value={biomarker.id}>
                          {biomarker.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                    <SelectTrigger className="w-[180px] bg-yellow-50 border-yellow-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                      <SelectTrigger className="w-[180px] bg-yellow-50 border-yellow-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Select Biomarkers to Compare:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {BIOMARKER_LIST.map((biomarker) => (
                        <div key={biomarker.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={biomarker.id}
                            checked={selectedBiomarkers.includes(biomarker.id)}
                            onCheckedChange={() => toggleBiomarker(biomarker.id)}
                          />
                          <Label
                            htmlFor={biomarker.id}
                            className="text-sm font-normal cursor-pointer"
                            style={{ color: biomarker.color }}
                          >
                            {biomarker.id}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        {hasData && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Data</CardTitle>
              <CardDescription className="text-xs">Download your biomarker data for sharing with healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="border-dashed border-primary text-primary hover:bg-primary/10"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="border-dashed border-primary text-primary hover:bg-primary/10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isExporting ? "Generating PDF..." : "Export PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart Area */}
        <Card className="min-h-[400px]">
          <CardContent className="pt-6">
            {!hasData ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No measurement data available</p>
                <Link href="/">
                  <Button variant="outline" className="border-dashed border-primary text-primary">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <BiomarkerChart
                readings={biomarkerReadings}
                selectedBiomarkers={viewMode === "single" ? [selectedBiomarker] : selectedBiomarkers}
                timeRange={timeRange}
                onChartReady={(canvas) => setChartCanvasRef(canvas)}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


// BiomarkerChart Component
function BiomarkerChart({
  readings,
  selectedBiomarkers,
  timeRange,
  onChartReady,
}: {
  readings: any[];
  selectedBiomarkers: string[];
  timeRange: string;
  onChartReady?: (canvas: HTMLCanvasElement | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !readings) return;

    // Notify parent component about canvas availability
    if (onChartReady) {
      onChartReady(canvasRef.current);
    }

    // Get all unique timestamps
    const allTimestamps = [...new Set(readings.map((r) => r.timestamp))]
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (allTimestamps.length === 0) return;

    // Prepare labels
    const labels = allTimestamps.map((timestamp) =>
      new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );

    // Create datasets for each selected biomarker
    const datasets = selectedBiomarkers.map((biomarkerId) => {
      const biomarkerInfo = BIOMARKER_LIST.find((b) => b.id === biomarkerId);
      const color = biomarkerInfo?.color || "#00A651";

      const biomarkerReadings = readings.filter((r) => r.biomarkerType === biomarkerId);
      const data = allTimestamps.map((timestamp) => {
        const reading = biomarkerReadings.find((r) => r.timestamp === timestamp);
        return reading ? reading.value : null;
      });

      return {
        label: biomarkerId,
        data,
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: color,
        tension: 0.3,
        spanGaps: true,
      };
    });

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Value",
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvasRef.current, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [readings, selectedBiomarkers, timeRange]);

  return (
    <div className="w-full h-[400px]">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
