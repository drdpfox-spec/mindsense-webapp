import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Calendar, Users, Share2, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function DashboardWidget() {
  // Fetch upcoming appointments (next 7 days)
  const { data: appointments } = trpc.appointments.list.useQuery();
  const { data: careTeam } = trpc.careTeam.list.useQuery();

  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    return aptDate >= now && aptDate <= sevenDaysFromNow;
  }).slice(0, 3) || [];

  const recentCareTeamMembers = careTeam?.slice(0, 3) || [];

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case "doctor_visit":
        return "bg-blue-100 text-blue-800";
      case "medication_refill":
        return "bg-purple-100 text-purple-800";
      case "patch_replacement":
        return "bg-green-100 text-green-800";
      case "lab_test":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAppointmentStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <CardTitle>Upcoming Appointments</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments">
                <Plus className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>Next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No upcoming appointments</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/appointments">Schedule one</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt: any) => (
                <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="mt-1">
                    {getAppointmentStatusIcon(apt.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{apt.title}</p>
                      <Badge className={`text-xs ${getAppointmentTypeColor(apt.appointmentType)}`}>
                        {apt.appointmentType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(apt.appointmentDate)}
                    </p>
                    {apt.location && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        📍 {apt.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {appointments && appointments.length > 3 && (
                <Button variant="link" size="sm" asChild className="w-full">
                  <Link href="/appointments">View all appointments →</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Care Team */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <CardTitle>Care Team</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/care-team">
                <Plus className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>Your healthcare providers</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCareTeamMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No care team members yet</p>
              <Button variant="link" size="sm" asChild className="mt-2">
                <Link href="/care-team">Add a provider</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCareTeamMembers.map((member: any) => {
                const prefs = member.sharingPreferences ? JSON.parse(member.sharingPreferences) : {};
                const sharingCount = [prefs.trends, prefs.journal, prefs.insights].filter(Boolean).length;

                return (
                  <div key={member.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {member.providerRole}
                        </Badge>
                      </div>
                      {member.specialty && (
                        <p className="text-xs text-muted-foreground truncate">{member.specialty}</p>
                      )}
                      {member.email && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          ✉️ {member.email}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Share2 className="w-3 h-3 text-teal-600" />
                        <span className="text-xs text-muted-foreground">
                          Sharing {sharingCount} data type{sharingCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {careTeam && careTeam.length > 3 && (
                <Button variant="link" size="sm" asChild className="w-full">
                  <Link href="/care-team">View all providers →</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
