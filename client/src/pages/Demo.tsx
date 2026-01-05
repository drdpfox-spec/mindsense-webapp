import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, TrendingDown, Minus, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { BIOMARKER_LIST } from "@shared/biomarkers";
import { toast } from "sonner";

// Mock demo data
const DEMO_BIOMARKERS = [
  { biomarkerType: "CRP", value: 3.2, unit: "mg/L" },
  { biomarkerType: "IL6", value: 2.8, unit: "pg/mL" },
  { biomarkerType: "LEPTIN", value: 28.5, unit: "ng/mL" },
  { biomarkerType: "PROINSULIN", value: 12.1, unit: "pmol/L" },
  { biomarkerType: "BDNF", value: 24.3, unit: "ng/mL" },
];

const DEMO_ALERTS = [
  { id: 1, message: "CRP levels elevated - consider lifestyle adjustments", severity: "warning" },
  { id: 2, message: "Mood trend shows improvement over last 7 days", severity: "info" },
];

export default function Demo() {
  const [isLoading, setIsLoading] = useState(false);
  const [demoActive, setDemoActive] = useState(false);

  const handleStartDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setDemoActive(true);
      toast.success("Demo mode activated! Explore all features with sample data.");
    }, 1500);
  };

  if (!demoActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>MindSense Demo</CardTitle>
            <CardDescription>Explore all features with sample data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">5 Mental Health Biomarkers</p>
                  <p className="text-muted-foreground">CRP, IL-6, Leptin, Proinsulin, BDNF</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Trend Analysis</p>
                  <p className="text-muted-foreground">30 days of historical data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">AI Insights</p>
                  <p className="text-muted-foreground">Pattern detection and risk assessment</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleStartDemo}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Demo...
                </>
              ) : (
                "Start Demo"
              )}
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Demo dashboard
  const biomarkerData = BIOMARKER_LIST.map((biomarker) => {
    const reading = DEMO_BIOMARKERS.find((r) => r.biomarkerType === biomarker.id);
    const value = reading ? reading.value : null;
    const baseline = (biomarker.normalRange.min + biomarker.normalRange.max) / 2;
    const change = value ? ((value - baseline) / baseline) * 100 : 0;

    return {
      ...biomarker,
      value,
      change,
      trend: change > 5 ? "up" : change < -5 ? "down" : "stable",
    };
  });

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">MindSense</h1>
              <p className="text-sm text-muted-foreground">Demo Mode - Sample Data</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Current Status */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Current Status</CardTitle>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                Stable
              </div>
            </div>
            <CardDescription>Demo data - Last updated {new Date().toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {DEMO_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  alert.severity === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-blue-50 dark:bg-blue-900/20"
                }`}
              >
                <AlertCircle
                  className={`h-5 w-5 ${
                    alert.severity === "warning" ? "text-yellow-600" : "text-blue-600"
                  }`}
                />
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Biomarkers */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Biomarkers</CardTitle>
              <Link href="/trends">
                <Button variant="link">View Trends →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {biomarkerData.map((biomarker) => (
                <div
                  key={biomarker.id}
                  className="p-4 border rounded-lg space-y-3"
                  style={{ borderTopWidth: 4, borderTopColor: biomarker.color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: biomarker.color }}
                      />
                      <span className="font-medium text-sm">{biomarker.id}</span>
                    </div>
                    {getTrendIcon(biomarker.trend)}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {biomarker.value?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">{biomarker.unit}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Range: {biomarker.normalRange.min}-{biomarker.normalRange.max}</span>
                    <span className={biomarker.change > 0 ? "text-red-600" : "text-green-600"}>
                      {biomarker.change > 0 ? "+" : ""}{biomarker.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Explore more features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link href="/trends">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Trends
                </Button>
              </Link>
              <Link href="/insights">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  AI Insights
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sign In Prompt */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Ready to Get Started?</CardTitle>
            <CardDescription>Sign in to save your own health data and get personalized insights</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Sign In to MindSense</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
