import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { notificationService } from "@/lib/notifications";

export default function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [preferences, setPreferences] = useState({
    biomarkerAlerts: true,
    patternDetection: true,
    medicationReminders: true,
    appointmentReminders: true,
  });

  useEffect(() => {
    // Check initial notification status
    setNotificationsEnabled(notificationService.isEnabled());
    setPermission(notificationService.getPermission());

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem("notification_preferences");
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    
    if (granted) {
      setNotificationsEnabled(true);
      setPermission("granted");
      toast.success("Notifications enabled successfully");
      
      // Send a test notification
      await notificationService.send({
        title: "✅ Notifications Enabled",
        body: "You'll now receive alerts for high-risk biomarkers and AI-detected patterns",
        priority: "low",
      });
    } else {
      toast.error("Notification permission denied. Please enable in browser settings.");
    }
  };

  const handleDisableNotifications = () => {
    notificationService.disable();
    setNotificationsEnabled(false);
    toast.success("Notifications disabled");
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem("notification_preferences", JSON.stringify(newPreferences));
    toast.success("Notification preferences updated");
  };

  const handleTestNotification = async () => {
    if (!notificationsEnabled) {
      toast.error("Please enable notifications first");
      return;
    }

    await notificationService.send({
      title: "🧪 Test Notification",
      body: "This is a test notification from MindSense. If you see this, notifications are working!",
      priority: "medium",
    });
    
    toast.success("Test notification sent");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage browser notifications for alerts and reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {permission === "denied"
                ? "Notifications are blocked. Please enable in browser settings."
                : notificationsEnabled
                ? "Notifications are enabled"
                : "Enable notifications to receive alerts"}
            </p>
          </div>
          {permission === "denied" ? (
            <Button variant="outline" disabled>
              <BellOff className="h-4 w-4 mr-2" />
              Blocked
            </Button>
          ) : notificationsEnabled ? (
            <Button variant="outline" onClick={handleDisableNotifications}>
              <BellOff className="h-4 w-4 mr-2" />
              Disable
            </Button>
          ) : (
            <Button onClick={handleEnableNotifications}>
              <Bell className="h-4 w-4 mr-2" />
              Enable
            </Button>
          )}
        </div>

        {/* Test Notification Button */}
        {notificationsEnabled && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleTestNotification}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Notification Preferences */}
        {notificationsEnabled && (
          <div className="space-y-4 pt-2 border-t">
            <Label className="text-base">Notification Types</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="biomarker-alerts">High-Risk Biomarker Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Critical alerts when biomarkers exceed safe thresholds
                </p>
              </div>
              <Switch
                id="biomarker-alerts"
                checked={preferences.biomarkerAlerts}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("biomarkerAlerts", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pattern-detection">AI Pattern Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts for concerning patterns detected by AI
                </p>
              </div>
              <Switch
                id="pattern-detection"
                checked={preferences.patternDetection}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("patternDetection", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="medication-reminders">Medication Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders to take your medications on time
                </p>
              </div>
              <Switch
                id="medication-reminders"
                checked={preferences.medicationReminders}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("medicationReminders", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders for upcoming healthcare appointments
                </p>
              </div>
              <Switch
                id="appointment-reminders"
                checked={preferences.appointmentReminders}
                onCheckedChange={(checked) =>
                  handlePreferenceChange("appointmentReminders", checked)
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
