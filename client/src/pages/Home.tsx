import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Users, WifiOff, Battery, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { BIOMARKER_LIST } from "@shared/biomarkers";

export default function Home() {
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const isAuthenticated = !!user && !userLoading;

  const { data: latestBiomarkers } = trpc.biomarkers.getLatest.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: upcomingAppointments } = trpc.appointments.list.useQuery(undefined, {
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

    return {
      ...biomarker,
      value,
    };
  });

  const upcomingAppts = upcomingAppointments?.filter(
    (apt) => new Date(apt.appointmentDate) > new Date()
  ).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">MindSense</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user?.name || 'User'}</p>
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
        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Appointments Card */}
          <Card>
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
              {upcomingAppts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No upcoming appointments</p>
                  <Link href="/appointments">
                    <Button variant="link" className="text-primary text-xs h-auto p-0">
                      Schedule one <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppts.map((apt) => (
                    <div key={apt.id} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{apt.provider}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Care Team Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Care Team</CardTitle>
              </div>
              <CardDescription className="text-xs">Your healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              {!careTeam || careTeam.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">No care team members yet</p>
                  <Link href="/care-team">
                    <Button variant="link" className="text-primary text-xs h-auto p-0">
                      Add a provider <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {careTeam.slice(0, 3).map((member) => (
                    <div key={member.id} className="p-3 border rounded-lg">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Status</CardTitle>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">No Data</span>
            </div>
            <CardDescription className="text-xs">No measurements yet</CardDescription>
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
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">0%</p>
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
            {biomarkerData.slice(0, 4).map((biomarker) => (
              <Card key={biomarker.id}>
                <CardContent className="pt-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: biomarker.color }}>
                    {biomarker.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {biomarker.value ? `${biomarker.value.toFixed(1)} ${biomarker.unit}` : "— ng/mL"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {biomarker.value ? "" : "No baseline"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/journal">
              <Button variant="outline" className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5">
                <Sparkles className="h-4 w-4 mr-2" />
                Log Mood
              </Button>
            </Link>
            <Link href="/insights">
              <Button variant="outline" className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5">
                <Activity className="h-4 w-4 mr-2" />
                View Insights
              </Button>
            </Link>
            <Link href="/device">
              <Button variant="outline" className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5">
                <Activity className="h-4 w-4 mr-2" />
                Connect Device
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
