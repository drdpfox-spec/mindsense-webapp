import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Calendar, Users, Wifi, WifiOff, Battery, TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { BIOMARKER_LIST } from "@shared/biomarkers";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: latestBiomarkers } = trpc.biomarkers.getLatest.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: activeDevice } = trpc.devices.getActive.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: upcomingAppointments } = trpc.appointments.upcoming.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: careTeam } = trpc.careTeam.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: unreadAlerts } = trpc.alerts.list.useQuery({ includeRead: false }, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">MindSense</CardTitle>
            <CardDescription>Mental Health Monitoring Platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track your mental health biomarkers and predict relapse risk with AI-powered insights.
            </p>
            <Button asChild className="w-full">
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const biomarkerData = BIOMARKER_LIST.map((biomarker) => {
    const reading = latestBiomarkers?.find((r) => r.biomarkerType === biomarker.id);
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
              <p className="text-sm text-muted-foreground">Welcome, {user?.name || "User"}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="outline">Profile</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Current Status */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Current Status</CardTitle>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:bg-green-300 rounded-full text-sm font-semibold">
                Stable
              </div>
            </div>
            <CardDescription>Last updated {new Date().toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {unreadAlerts && unreadAlerts.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm font-medium text-red-700 dark:text-red-400 flex-1">
                  You have {unreadAlerts.length} unread alert{unreadAlerts.length > 1 ? "s" : ""}
                </p>
                <Link href="/alerts">
                  <Button variant="link" className="text-red-700 dark:text-red-400">
                    View
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                {activeDevice?.isConnected ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {activeDevice?.deviceName || "No Device Connected"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeDevice?.isConnected ? "Connected" : "Disconnected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activeDevice?.batteryLevel || 0}%</span>
              </div>
            </div>
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
                      <h3 className="font-semibold" style={{ color: biomarker.color }}>
                        {biomarker.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(biomarker.trend)}
                      <span className="text-sm font-semibold text-muted-foreground">
                        {biomarker.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {biomarker.value?.toFixed(1) || "--"}
                    </span>
                    <span className="text-sm text-muted-foreground">{biomarker.unit}</span>
                  </div>

                  <p className="text-xs text-muted-foreground">{biomarker.fullName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/assessments">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Log Mood</span>
                </Button>
              </Link>
              <Link href="/medications">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">Medications</span>
                </Button>
              </Link>
              <Link href="/appointments">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Appointments</span>
                </Button>
              </Link>
              <Link href="/care-team">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Care Team</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link href="/appointments">
                <Button variant="link">View All →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="p-3 border rounded-lg">
                    <p className="font-medium">{apt.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(apt.appointmentDate).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No appointments scheduled</p>
                <Link href="/appointments">
                  <Button variant="outline">Schedule one</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care Team */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Care Team</CardTitle>
              <Link href="/care-team">
                <Button variant="link">View All →</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {careTeam && careTeam.length > 0 ? (
              <div className="space-y-3">
                {careTeam.slice(0, 3).map((member) => (
                  <div key={member.id} className="p-3 border rounded-lg">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.providerRole}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No providers added</p>
                <Link href="/care-team">
                  <Button variant="outline">Add a provider</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
