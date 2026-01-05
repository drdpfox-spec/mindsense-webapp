import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Calendar, Users, Wifi, WifiOff, Battery, TrendingUp, TrendingDown, Minus, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { BIOMARKER_LIST } from "@shared/biomarkers";
import DemoModeCard from "@/components/DemoModeCard";

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

  // Redirect to demo if not authenticated
  if (!isAuthenticated) {
    window.location.href = '/demo';
    return null;
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
              <p className="text-xs text-muted-foreground">Welcome, {user?.name || "User"}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="text-primary">
              Profile
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Demo Mode Card */}
        <DemoModeCard />

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
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-2">
                  {upcomingAppointments.slice(0, 2).map((apt) => (
                    <div key={apt.id} className="text-sm border-l-2 border-primary pl-3">
                      <p className="font-medium text-foreground">{apt.provider}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Link href="/appointments">
                    <Button variant="link" className="text-primary text-xs mt-2 h-auto p-0">
                      Schedule one <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
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
              {careTeam && careTeam.length > 0 ? (
                <div className="space-y-2">
                  {careTeam.slice(0, 2).map((provider) => (
                    <div key={provider.id} className="text-sm border-l-2 border-primary pl-3">
                      <p className="font-medium text-foreground">{provider.name}</p>
                      <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No care team members yet</p>
                  <Link href="/care-team">
                    <Button variant="link" className="text-primary text-xs mt-2 h-auto p-0">
                      Add a provider <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Status Card */}
        <Card className="border-dashed border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Status</CardTitle>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">No Data</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeDevice ? (
                  <>
                    <Wifi className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activeDevice.name}</p>
                      <p className="text-xs text-muted-foreground">Connected</p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">No Device Connected</p>
                      <p className="text-xs text-muted-foreground">Disconnected</p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {activeDevice ? `${activeDevice.batteryLevel || 0}%` : "0%"}
                </p>
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
                  <p className="text-xs text-muted-foreground">No baseline</p>
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
            <Link href="/profile">
              <Button variant="outline" size="sm" className="w-full h-auto flex-col gap-1 py-3 border-dashed border-primary/20 text-primary hover:bg-primary/5">
                <Users className="h-4 w-4" />
                <span className="text-xs">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
