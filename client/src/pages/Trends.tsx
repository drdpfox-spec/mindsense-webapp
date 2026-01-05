import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Activity } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { BIOMARKER_LIST } from "@shared/biomarkers";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import type { ChartConfiguration } from "chart.js";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type ViewMode = "single" | "compare";
type TimeRange = "7" | "30" | "90";

export default function Trends() {
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [selectedBiomarker, setSelectedBiomarker] = useState(BIOMARKER_LIST[0].id);
  const [timeRange, setTimeRange] = useState<TimeRange>("30");

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
            </div>

            {/* Filters */}
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
          </CardContent>
        </Card>

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
                selectedBiomarker={selectedBiomarker}
                timeRange={timeRange}
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
  selectedBiomarker,
  timeRange,
}: {
  readings: any[];
  selectedBiomarker: string;
  timeRange: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !readings) return;

    // Filter readings for selected biomarker
    const filteredReadings = readings
      .filter((r) => r.biomarkerType === selectedBiomarker)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (filteredReadings.length === 0) return;

    // Prepare data
    const labels = filteredReadings.map((r) =>
      new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    const data = filteredReadings.map((r) => r.value);

    // Get biomarker info for color
    const biomarkerInfo = BIOMARKER_LIST.find((b) => b.id === selectedBiomarker);
    const color = biomarkerInfo?.color || "#00A651";

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: selectedBiomarker,
            data,
            borderColor: color,
            backgroundColor: color + "20",
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: color,
            tension: 0.3,
          },
        ],
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
              text: biomarkerInfo?.unit || "Value",
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
  }, [readings, selectedBiomarker, timeRange]);

  return (
    <div className="w-full h-[400px]">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
