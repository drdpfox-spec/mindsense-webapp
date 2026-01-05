import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Activity } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { BIOMARKER_LIST } from "@shared/biomarkers";

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
              <div className="text-center py-20 text-muted-foreground">
                Chart visualization would appear here
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
