import { useAuth } from "../_core/hooks/useAuth";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Activity, AlertCircle } from "lucide-react";

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>("piiinp");
  const [timeRange, setTimeRange] = useState<number>(30); // days

  const { data: measurements = [] } = trpc.measurements.getRecent.useQuery(
    { limit: 500 },
    { enabled: isAuthenticated }
  );
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Filter measurements by time range
  const filteredMeasurements = measurements.filter((m: any) => {
    const measurementDate = new Date(m.measuredAt);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    return measurementDate >= cutoffDate;
  });

  // Calculate biomarker statistics
  const calculateStats = (biomarkerKey: string) => {
    const values = filteredMeasurements
      .map((m: any) => m[biomarkerKey])
      .filter((v: any) => v !== null && v !== undefined);

    if (values.length === 0) {
      return {
        median: 0,
        mean: 0,
        stdDev: 0,
        cv: 0,
        p25: 0,
        p75: 0,
        min: 0,
        max: 0,
        timeInRange: 0,
        variabilityIndex: 0,
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
    const variance = values.reduce((sum: number, v: number) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;

    const median = sorted[Math.floor(sorted.length / 2)];
    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Get baseline for this biomarker
    const baselineMap: any = {
      piiinp: profile?.baselinePIIINP,
      ha: profile?.baselineHA,
      timp1: profile?.baselineTIMP1,
      tgfb1: profile?.baselineTGFB1,
    };
    const baseline = baselineMap[biomarkerKey];

    // Calculate time in range (±15% of baseline)
    let timeInRange = 0;
    if (baseline) {
      const lowerBound = baseline * 0.85;
      const upperBound = baseline * 1.15;
      const inRangeCount = values.filter((v: number) => v >= lowerBound && v <= upperBound).length;
      timeInRange = (inRangeCount / values.length) * 100;
    }

    // Variability Index (coefficient of variation)
    const variabilityIndex = cv;

    return {
      median,
      mean,
      stdDev,
      cv,
      p25,
      p75,
      min,
      max,
      timeInRange,
      variabilityIndex,
    };
  };

  // Calculate weekly patterns
  const calculateWeeklyPatterns = (biomarkerKey: string) => {
    const dayAverages = Array(7).fill(0).map(() => ({ sum: 0, count: 0 }));
    
    filteredMeasurements.forEach((m: any) => {
      const value = m[biomarkerKey];
      if (value !== null && value !== undefined) {
        const dayOfWeek = new Date(m.measuredAt).getDay();
        dayAverages[dayOfWeek].sum += value;
        dayAverages[dayOfWeek].count += 1;
      }
    });

    return dayAverages.map((day, index) => ({
      day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index],
      average: day.count > 0 ? day.sum / day.count : 0,
    }));
  };

  const stats = calculateStats(selectedBiomarker);
  const weeklyPatterns = calculateWeeklyPatterns(selectedBiomarker);

  const biomarkerOptions = [
    { value: "piiinp", label: "PIIINP", unit: "ng/mL", divisor: 10 },
    { value: "ha", label: "HA", unit: "ng/mL", divisor: 1 },
    { value: "timp1", label: "TIMP-1", unit: "ng/mL", divisor: 1 },
    { value: "tgfb1", label: "TGF-β1", unit: "pg/mL", divisor: 10 },
  ];

  const selectedOption = biomarkerOptions.find(opt => opt.value === selectedBiomarker);

  const formatValue = (value: number) => {
    if (!selectedOption) return value.toFixed(1);
    return (value / selectedOption.divisor).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-6xl py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Advanced Analytics</h1>
              <p className="text-sm text-muted-foreground">Biomarker Stability & Variability Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-6 space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Biomarker</label>
              <Select value={selectedBiomarker} onValueChange={setSelectedBiomarker}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {biomarkerOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Statistical Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Statistical Summary</CardTitle>
            <CardDescription>
              {filteredMeasurements.length} measurements over {timeRange} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Median</p>
                <p className="text-2xl font-bold">
                  {formatValue(stats.median)} <span className="text-sm font-normal text-muted-foreground">{selectedOption?.unit}</span>
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Mean ± SD</p>
                <p className="text-2xl font-bold">
                  {formatValue(stats.mean)} <span className="text-sm font-normal">± {formatValue(stats.stdDev)}</span>
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Range</p>
                <p className="text-2xl font-bold">
                  {formatValue(stats.min)} - {formatValue(stats.max)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biomarker Stability Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Biomarker Stability Profile</CardTitle>
            <CardDescription>Median with 25th-75th percentile bands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative h-32 bg-secondary rounded-lg p-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full px-4">
                    {/* Percentile band visualization */}
                    <div className="relative h-16 bg-primary/10 rounded">
                      <div 
                        className="absolute top-0 left-0 h-full bg-primary/30 rounded"
                        style={{
                          left: `${((stats.p25 - stats.min) / (stats.max - stats.min)) * 100}%`,
                          width: `${((stats.p75 - stats.p25) / (stats.max - stats.min)) * 100}%`,
                        }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-primary"
                        style={{
                          left: `${((stats.median - stats.min) / (stats.max - stats.min)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-muted-foreground">25th Percentile</p>
                  <p className="font-semibold">{formatValue(stats.p25)} {selectedOption?.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Median</p>
                  <p className="font-semibold text-primary">{formatValue(stats.median)} {selectedOption?.unit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">75th Percentile</p>
                  <p className="font-semibold">{formatValue(stats.p75)} {selectedOption?.unit}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time in Range & Variability */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Time in Normal Range</CardTitle>
              <CardDescription>Percentage within ±15% of baseline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">{stats.timeInRange.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.timeInRange >= 80 ? "Excellent stability" : 
                     stats.timeInRange >= 60 ? "Good stability" : 
                     stats.timeInRange >= 40 ? "Moderate variability" : 
                     "High variability"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variability Index</CardTitle>
              <CardDescription>Coefficient of Variation (CV%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">{stats.cv.toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stats.cv < 10 ? "Low variability" : 
                     stats.cv < 20 ? "Moderate variability" : 
                     "High variability"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Pattern Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Pattern Overlay</CardTitle>
            <CardDescription>Average values by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyPatterns.map((pattern, index) => {
                const maxValue = Math.max(...weeklyPatterns.map(p => p.average));
                const barWidth = maxValue > 0 ? (pattern.average / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-muted-foreground">{pattern.day}</div>
                    <div className="flex-1 h-8 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="w-20 text-sm font-semibold text-right">
                      {pattern.average > 0 ? formatValue(pattern.average) : "—"} {selectedOption?.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Clinical Interpretation */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <CardTitle>Clinical Interpretation</CardTitle>
                <CardDescription className="mt-2">
                  {stats.cv < 10 && stats.timeInRange >= 80 && (
                    <span className="text-green-700 dark:text-green-400">
                      Excellent biomarker stability with low variability. Current management appears effective.
                    </span>
                  )}
                  {stats.cv >= 10 && stats.cv < 20 && stats.timeInRange >= 60 && (
                    <span className="text-yellow-700 dark:text-yellow-400">
                      Moderate biomarker variability detected. Consider reviewing medication adherence and lifestyle factors.
                    </span>
                  )}
                  {(stats.cv >= 20 || stats.timeInRange < 60) && (
                    <span className="text-red-700 dark:text-red-400">
                      High biomarker variability or frequent excursions from normal range. Recommend clinical review and potential treatment adjustment.
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </main>
    </div>
  );
}
