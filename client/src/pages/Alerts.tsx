import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const utils = trpc.useUtils();

  const { data: alerts, isLoading } = trpc.alerts.list.useQuery({
    includeRead: filter === "all",
  });

  const markAsReadMutation = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      toast.success("Alert marked as read");
    },
  });

  const dismissMutation = trpc.alerts.dismiss.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      toast.success("Alert dismissed");
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
      case "success":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay informed about your mental health status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={!alert.isRead ? "border-l-4 border-l-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getAlertBadgeVariant(alert.type)}>
                      {alert.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{alert.message}</p>
                  <div className="flex items-center gap-2">
                    {!alert.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate({ alertId: alert.id })}
                        disabled={markAsReadMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissMutation.mutate({ alertId: alert.id })}
                      disabled={dismissMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No alerts to display</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {alerts && alerts.filter((a) => !a.isRead).length > 0 ? (
            alerts
              .filter((a) => !a.isRead)
              .map((alert) => (
                <Card
                  key={alert.id}
                  className="border-l-4 border-l-primary"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(alert.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getAlertBadgeVariant(alert.type)}>
                        {alert.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{alert.message}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsReadMutation.mutate({ alertId: alert.id })}
                        disabled={markAsReadMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissMutation.mutate({ alertId: alert.id })}
                        disabled={dismissMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No unread alerts</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
