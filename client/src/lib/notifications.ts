/**
 * Notification Service for MindSense
 * Handles browser push notifications for high-risk alerts and AI-detected patterns
 */

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface MindSenseNotification {
  title: string;
  body: string;
  priority: NotificationPriority;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private permission: NotificationPermission = "default";
  private enabled: boolean = false;

  constructor() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
      this.enabled = this.permission === "granted";
    }
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permission === "granted") {
      this.enabled = true;
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.enabled = permission === "granted";
      
      // Store permission in localStorage
      localStorage.setItem("notifications_enabled", this.enabled.toString());
      
      return this.enabled;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Check if notifications are supported and enabled
   */
  isEnabled(): boolean {
    return this.enabled && "Notification" in window;
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Send a notification
   */
  async send(notification: MindSenseNotification): Promise<void> {
    if (!this.isEnabled()) {
      console.warn("Notifications are not enabled");
      return;
    }

    try {
      const options: NotificationOptions = {
        body: notification.body,
        icon: notification.icon || "/icon-192.png",
        badge: "/icon-192.png",
        tag: notification.tag || `mindsense-${Date.now()}`,
        data: notification.data,
        requireInteraction: notification.priority === "critical",
        silent: notification.priority === "low",
      };

      const browserNotification = new Notification(notification.title, options);

      // Auto-close low priority notifications after 5 seconds
      if (notification.priority === "low") {
        setTimeout(() => browserNotification.close(), 5000);
      }

      // Handle notification click
      browserNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to relevant page based on notification data
        if (notification.data?.url) {
          window.location.href = notification.data.url;
        }
        
        browserNotification.close();
      };
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  /**
   * Send a high-risk biomarker alert
   */
  async sendBiomarkerAlert(biomarkerType: string, value: number, threshold: number): Promise<void> {
    await this.send({
      title: "⚠️ High-Risk Biomarker Alert",
      body: `Your ${biomarkerType} level (${value}) has exceeded the safe threshold (${threshold}). Please consult your healthcare provider.`,
      priority: "critical",
      tag: `biomarker-${biomarkerType}`,
      data: {
        url: "/trends",
        biomarkerType,
        value,
        threshold,
      },
    });
  }

  /**
   * Send an AI pattern detection alert
   */
  async sendPatternAlert(patternType: string, description: string, riskLevel: number): Promise<void> {
    const priority: NotificationPriority = riskLevel >= 70 ? "critical" : riskLevel >= 40 ? "high" : "medium";
    
    await this.send({
      title: "🧠 AI Pattern Detected",
      body: `${patternType}: ${description}`,
      priority,
      tag: `pattern-${patternType}`,
      data: {
        url: "/insights",
        patternType,
        riskLevel,
      },
    });
  }

  /**
   * Send a medication reminder
   */
  async sendMedicationReminder(medicationName: string, dosage: string): Promise<void> {
    await this.send({
      title: "💊 Medication Reminder",
      body: `Time to take ${medicationName} (${dosage})`,
      priority: "medium",
      tag: `medication-${medicationName}`,
      data: {
        url: "/medications",
        medicationName,
      },
    });
  }

  /**
   * Send an appointment reminder
   */
  async sendAppointmentReminder(provider: string, appointmentDate: Date): Promise<void> {
    const timeString = appointmentDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    await this.send({
      title: "📅 Upcoming Appointment",
      body: `Appointment with ${provider} at ${timeString}`,
      priority: "high",
      tag: `appointment-${provider}`,
      data: {
        url: "/appointments",
        provider,
        appointmentDate: appointmentDate.toISOString(),
      },
    });
  }

  /**
   * Disable notifications
   */
  disable(): void {
    this.enabled = false;
    localStorage.setItem("notifications_enabled", "false");
  }

  /**
   * Enable notifications (requires permission)
   */
  async enable(): Promise<boolean> {
    return await this.requestPermission();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export convenience functions
export const requestNotificationPermission = () => notificationService.requestPermission();
export const sendNotification = (notification: MindSenseNotification) => notificationService.send(notification);
export const sendBiomarkerAlert = (biomarkerType: string, value: number, threshold: number) =>
  notificationService.sendBiomarkerAlert(biomarkerType, value, threshold);
export const sendPatternAlert = (patternType: string, description: string, riskLevel: number) =>
  notificationService.sendPatternAlert(patternType, description, riskLevel);
export const sendMedicationReminder = (medicationName: string, dosage: string) =>
  notificationService.sendMedicationReminder(medicationName, dosage);
export const sendAppointmentReminder = (provider: string, appointmentDate: Date) =>
  notificationService.sendAppointmentReminder(provider, appointmentDate);
