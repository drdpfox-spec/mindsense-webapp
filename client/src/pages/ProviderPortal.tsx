import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Search, Users, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { Link } from "wouter";

export default function ProviderPortal() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: patients } = trpc.provider.getPatients.useQuery(undefined, {
    enabled: user?.role === "provider",
  });
  
  const { data: criticalAlerts } = trpc.provider.getCriticalAlerts.useQuery(undefined, {
    enabled: user?.role === "provider",
  });

  if (user?.role !== "provider") {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This portal is only accessible to healthcare providers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you are a healthcare provider, please contact your administrator to update your account role.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredPatients = patients?.filter((p) =>
    p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Provider Portal</h1>
        <p className="text-muted-foreground">Monitor and manage your patients' mental health</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active patient relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients && patients.length > 0
                ? (
                    patients.reduce((sum, p) => sum + (p.latestRiskScore || 0), 0) /
                    patients.length
                  ).toFixed(1)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Across all patients</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts && criticalAlerts.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Critical Alerts
            </CardTitle>
            <CardDescription>Patients requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{alert.patientName}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/provider/patient/${alert.patientId}`}>
                    <Button size="sm">View Patient</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>All patients under your care</CardDescription>
          <div className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredPatients || filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No patients found</p>
              <p className="text-sm">Patient relationships will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{patient.patientName || "Unknown Patient"}</p>
                        <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                          {patient.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.patientEmail}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Risk Score: {patient.latestRiskScore?.toFixed(1) || "N/A"}</span>
                        <span>•</span>
                        <span>Last Updated: {new Date(patient.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/provider/patient/${patient.patientId}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
