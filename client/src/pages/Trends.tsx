import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { BIOMARKER_LIST } from "@shared/biomarkers";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type TimeRange = 7 | 30 | 90;

export default function Trends() {
  const { isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<string[]>(["CRP", "IL6"]);
  const [comparisonMode, setComparisonMode] = useState(false);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeRange);
  
  const { data: biomarkerReadings, isLoading } = trpc.biomarkers.getByDateRange.useQuery(
    { startDate, endDate },
    { enabled: isAuthenticated }
  );

  const toggleBiomarker = (biomarkerId: string) => {
    setSelectedBiomarkers((prev) =>
      prev.includes(biomarkerId) ? prev.filter((id) => id !== biomarkerId) : [...prev, biomarkerId]
    );
  };

  const exportData = (format: "csv" | "json" | "pdf") => {
    if (!biomarkerReadings) return;

    const selectedData = biomarkerReadings.filter((r: any) => selectedBiomarkers.includes(r.biomarkerType));

    if (format === "csv") {
      const headers = ["Date", "Biomarker", "Value", "Unit"];
      const rows = selectedData.map((r: any) => [
        new Date(r.readingDate).toLocaleDateString(),
        r.biomarkerType,
        r.value.toString(),
        BIOMARKER_LIST.find((b) => b.id === r.biomarkerType)?.unit || "",
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindsense-biomarkers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    } else if (format === "json") {
      const json = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          timeRange: `${timeRange} days`,
          biomarkers: selectedData.map((r: any) => ({
            date: r.readingDate,
            biomarker: r.biomarkerType,
            value: r.value,
            unit: BIOMARKER_LIST.find((b) => b.id === r.biomarkerType)?.unit,
          })),
        },
        null,
        2
      );
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindsense-biomarkers-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } else if (format === "pdf") {
      alert("PDF export will be implemented with a PDF generation library");
    }
  };

  const getChartData = () => {
    if (!biomarkerReadings) return null;

    const dates = Array.from(
      new Set(biomarkerReadings.map((r: any) => new Date(r.readingDate).toLocaleDateString()))
    ).sort();

    const datasets = selectedBiomarkers.map((biomarkerId) => {
      const biomarker = BIOMARKER_LIST.find((b) => b.id === biomarkerId);
      if (!biomarker) return null;

      const data = dates.map((date) => {
        const reading = biomarkerReadings.find(
          (r: any) => r.biomarkerType === biomarkerId && new Date(r.readingDate).toLocaleDateString() === date
        );
        if (!reading) return null;

        if (comparisonMode) {
          // Normalize to 0-100 scale
          const { min, max } = biomarker.normalRange;
          return ((reading.value - min) / (max - min)) * 100;
        }
        return reading.value;
      });

      return {
        label: biomarker.name,
        data,
        borderColor: biomarker.color,
        backgroundColor: `${biomarker.color}20`,
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    }).filter((d) => d !== null) as any[];

    return {
      labels: dates,
      datasets,
    };
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: comparisonMode ? "Normalized Value (0-100)" : "Value",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const getStatistics = (biomarkerId: string) => {
    if (!biomarkerReadings) return null;

    const readings = biomarkerReadings.filter((r: any) => r.biomarkerType === biomarkerId);
    if (readings.length === 0) return null;

    const values = readings.map((r: any) => r.value);
    const current = values[values.length - 1];
    const previous = values[values.length - 2];
    const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const change = previous ? ((current - previous) / previous) * 100 : 0;

    return { current, average, min, max, change };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view biomarker trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">Biomarker Trends</h1>
          <p className="text-sm text-muted-foreground">Track and analyze your mental health biomarkers</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Time Range Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Time Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={timeRange === 7 ? "default" : "outline"}
                onClick={() => setTimeRange(7)}
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === 30 ? "default" : "outline"}
                onClick={() => setTimeRange(30)}
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === 90 ? "default" : "outline"}
                onClick={() => setTimeRange(90)}
              >
                90 Days
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Biomarker Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Biomarkers</CardTitle>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={comparisonMode}
                    onCheckedChange={(checked) => setComparisonMode(checked as boolean)}
                  />
                  Comparison Mode (Normalized)
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {BIOMARKER_LIST.map((biomarker) => (
                <div
                  key={biomarker.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedBiomarkers.includes(biomarker.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleBiomarker(biomarker.id)}
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: selectedBiomarkers.includes(biomarker.id) ? biomarker.color : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox checked={selectedBiomarkers.includes(biomarker.id)} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: biomarker.color }} />
                    <h3 className="font-semibold text-sm" style={{ color: biomarker.color }}>
                      {biomarker.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{biomarker.fullName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        {selectedBiomarkers.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Biomarker Chart</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportData("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportData("json")}>
                    <Download className="h-4 w-4 mr-2" />
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportData("pdf")}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : chartData ? (
                <div className="h-96">
                  <Line data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  No data available for the selected time range
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {selectedBiomarkers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedBiomarkers.map((biomarkerId) => {
              const biomarker = BIOMARKER_LIST.find((b) => b.id === biomarkerId);
              const stats = getStatistics(biomarkerId);
              if (!biomarker || !stats) return null;

              return (
                <Card key={biomarkerId}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: biomarker.color }} />
                      <CardTitle className="text-lg" style={{ color: biomarker.color }}>
                        {biomarker.name}
                      </CardTitle>
                    </div>
                    <CardDescription>{biomarker.fullName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          {stats.current.toFixed(1)} {biomarker.unit}
                        </span>
                        {stats.change > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm text-muted-foreground">{stats.change.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average</span>
                      <span className="text-sm font-semibold">
                        {stats.average.toFixed(1)} {biomarker.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Range</span>
                      <span className="text-sm font-semibold">
                        {stats.min.toFixed(1)} - {stats.max.toFixed(1)} {biomarker.unit}
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Normal Range</span>
                        <span className="text-xs text-muted-foreground">
                          {biomarker.normalRange.min} - {biomarker.normalRange.max} {biomarker.unit}
                        </span>
                      </div>
                      {(stats.current < biomarker.normalRange.min || stats.current > biomarker.normalRange.max) && (
                        <p className="text-xs text-red-500 font-medium">⚠️ Outside normal range</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
