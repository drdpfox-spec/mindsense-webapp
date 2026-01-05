import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, BellOff, Loader2, ArrowLeft, GraduationCap } from "lucide-react";
import { Link } from "wouter";

export default function Settings() {
  const [preferences, setPreferences] = useState({
    notificationEnabled: true,
    notifyThresholdAlerts: true,
    notifyTrendAlerts: true,
    notifyLowBattery: true,
    notifyComplianceAlerts: true,
    appointmentReminderHours: 24,
  });

  const { data, isLoading } = trpc.profile.getNotificationPreferences.useQuery();
  const updatePreferences = trpc.profile.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const resetOnboarding = trpc.profile.resetOnboarding.useMutation({
    onSuccess: () => {
      toast.success("Tutorial will restart on next page load");
      // Reload the page to trigger onboarding
      setTimeout(() => window.location.href = "/", 1000);
    },
    onError: () => {
      toast.error("Failed to restart tutorial");
    },
  });

  useEffect(() => {
    if (data) {
      setPreferences({
        notificationEnabled: data.notificationEnabled ?? true,
        notifyThresholdAlerts: data.notifyThresholdAlerts ?? true,
        notifyTrendAlerts: data.notifyTrendAlerts ?? true,
        notifyLowBattery: data.notifyLowBattery ?? true,
        notifyComplianceAlerts: data.notifyComplianceAlerts ?? true,
        appointmentReminderHours: data.appointmentReminderHours ?? 24,
      });
    }
  }, [data]);

  const handleToggle = (key: keyof typeof preferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    updatePreferences.mutate({ [key]: newPreferences[key] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your notification preferences</p>
        </div>
      </div>

      {/* Master Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {preferences.notificationEnabled ? (
                <Bell className="h-6 w-6 text-teal-600" />
              ) : (
                <BellOff className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  {preferences.notificationEnabled
                    ? "Notifications are enabled"
                    : "Notifications are disabled"}
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={preferences.notificationEnabled}
              onCheckedChange={() => handleToggle("notificationEnabled")}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Enable or disable all push notifications. When disabled, you will not receive any alerts
            even if individual notification types are enabled below.
          </p>
        </CardContent>
      </Card>

      {/* Individual Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of alerts you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Threshold Alerts */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="threshold-alerts" className="text-base font-semibold">
                Threshold Alerts
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Get notified when your biomarker levels exceed 30% above your baseline values.
                Critical alerts (50%+ above baseline) are sent immediately.
              </p>
            </div>
            <Switch
              id="threshold-alerts"
              checked={preferences.notifyThresholdAlerts}
              onCheckedChange={() => handleToggle("notifyThresholdAlerts")}
              disabled={!preferences.notificationEnabled}
            />
          </div>

          <Separator />

          {/* Trend Alerts */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="trend-alerts" className="text-base font-semibold">
                Trend Alerts
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Receive alerts when your biomarkers show rapid changes (20%+ increase or decrease)
                over a 7-day period, indicating potential disease progression or improvement.
              </p>
            </div>
            <Switch
              id="trend-alerts"
              checked={preferences.notifyTrendAlerts}
              onCheckedChange={() => handleToggle("notifyTrendAlerts")}
              disabled={!preferences.notificationEnabled}
            />
          </div>

          <Separator />

          {/* Low Battery Alerts */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="battery-alerts" className="text-base font-semibold">
                Low Battery Warnings
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Get notified when your FibroSense device battery drops below 20%. Critical warnings
                are sent when battery is below 10% to ensure continuous monitoring.
              </p>
            </div>
            <Switch
              id="battery-alerts"
              checked={preferences.notifyLowBattery}
              onCheckedChange={() => handleToggle("notifyLowBattery")}
              disabled={!preferences.notificationEnabled}
            />
          </div>

          <Separator />

          {/* Compliance Alerts */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="compliance-alerts" className="text-base font-semibold">
                Compliance Reminders
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Receive reminders if no measurements have been recorded for extended periods (24+
                hours), helping you maintain consistent monitoring for better health insights.
              </p>
            </div>
            <Switch
              id="compliance-alerts"
              checked={preferences.notifyComplianceAlerts}
              onCheckedChange={() => handleToggle("notifyComplianceAlerts")}
              disabled={!preferences.notificationEnabled}
            />
          </div>

          <Separator />

          {/* Appointment Reminders */}
          <div className="space-y-3">
            <Label htmlFor="reminder-hours" className="text-base font-semibold">
              Appointment Reminder Time
            </Label>
            <Select
              value={preferences.appointmentReminderHours.toString()}
              onValueChange={(value) => {
                const hours = parseInt(value);
                setPreferences({ ...preferences, appointmentReminderHours: hours });
                updatePreferences.mutate({ appointmentReminderHours: hours });
              }}
              disabled={!preferences.notificationEnabled}
            >
              <SelectTrigger id="reminder-hours">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour before</SelectItem>
                <SelectItem value="2">2 hours before</SelectItem>
                <SelectItem value="6">6 hours before</SelectItem>
                <SelectItem value="12">12 hours before</SelectItem>
                <SelectItem value="24">24 hours (1 day) before</SelectItem>
                <SelectItem value="48">48 hours (2 days) before</SelectItem>
                <SelectItem value="168">168 hours (1 week) before</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Receive appointment reminders and automatically generate pre-appointment health
              reports at your preferred time before scheduled appointments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-teal-600" />
            <div>
              <CardTitle>App Tutorial</CardTitle>
              <CardDescription>
                Learn how to use FibroSense features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Restart the interactive tutorial to learn about biomarker monitoring, medication reminders,
            care team management, and other key features of the app.
          </p>
          <Button
            onClick={() => resetOnboarding.mutate()}
            disabled={resetOnboarding.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {resetOnboarding.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Restarting...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4 mr-2" />
                Restart Tutorial
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">About Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Notifications are sent to help you stay informed about your health status and device
                operation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Critical alerts (high severity) are always prioritized to ensure you don't miss
                important health changes.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                You can adjust these preferences at any time based on your monitoring needs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                For urgent medical concerns, always contact your healthcare provider directly.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
