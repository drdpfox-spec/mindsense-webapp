import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Users, Wifi, WifiOff, Battery, TrendingUp, TrendingDown, Minus, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { BIOMARKER_LIST } from "@shared/biomarkers";

export default function Demo() {
  // Mock demo data
  const DEMO_BIOMARKERS = [
    { biomarkerType: "CRP", value: 3.2 },
    { biomarkerType: "IL6", value: 2.8 },
    { biomarkerType: "LEPTIN", value: 28.5 },
    { biomarkerType: "PROINSULIN", value: 12.1 },
    { biomarkerType: "BDNF", value: 24.3 },
  ];

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Fibrosense Style */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">MindSense</h1>
              <p className="text-xs text-muted-foreground">Demo Mode - Sample Data</p>
            </div>
          </div>
          <a href="/api/oauth/login">
            <Button variant="ghost" size="sm" className="text-primary">
              Sign In
            </Button>
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Demo Mode Banner */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">
                You're viewing demo data. <a href="/api/oauth/login" className="text-primary underline">Sign in</a> to save your own health data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Appointments Card */}
          <Card className="border-dashed border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground">Next 7 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                <Link href="/appointments">
                  <Button variant="link" className="text-primary text-xs mt-2 h-auto p-0">
                    Schedule one <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Care Team Card */}
          <Card className="border-dashed border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Care Team</CardTitle>
                </div>
              </div>
              <CardDescription className="text-xs">Your healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No care team members yet</p>
                <Link href="/care-team">
                  <Button variant="link" className="text-primary text-xs mt-2 h-auto p-0">
                    Add a provider <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Status Card */}
        <Card className="border-dashed border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Status</CardTitle>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Stable</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">No Device Connected</p>
                  <p className="text-xs text-muted-foreground">Disconnected</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">0%</p>
                <Battery className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Biomarkers Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Biomarkers</h2>
            <Link href="/trends">
              <Button variant="link" className="text-primary text-sm h-auto p-0">
                View Trends <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {biomarkerData.map((biomarker) => (
              <Card key={biomarker.id} className="border-dashed border border-primary/20">
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold text-primary mb-2">{biomarker.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {biomarker.value ? `${biomarker.value.toFixed(1)} ${biomarker.unit}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {biomarker.normalRange.min}-{biomarker.normalRange.max} {biomarker.unit}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 md:grid-cols-8 gap-2">
            <Link href="/journal">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Log Mood</span>
              </Button>
            </Link>
            <Link href="/trends">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Trends</span>
              </Button>
            </Link>
            <Link href="/insights">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <Activity className="h-4 w-4" />
                <span className="text-xs">Insights</span>
              </Button>
            </Link>
            <Link href="/medications">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <Activity className="h-4 w-4" />
                <span className="text-xs">Meds</span>
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Alerts</span>
              </Button>
            </Link>
            <Link href="/device">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <Wifi className="h-4 w-4" />
                <span className="text-xs">Device</span>
              </Button>
            </Link>
            <Link href="/appointments">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Appts</span>
              </Button>
            </Link>
            <a href="/api/oauth/login">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <Users className="h-4 w-4" />
                <span className="text-xs">Sign In</span>
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
