import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Wifi, WifiOff, Battery, BatteryCharging, Bluetooth, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type PairingStep = "idle" | "scanning" | "connecting" | "connected";

export default function Device() {
  const { isAuthenticated } = useAuth();
  const [pairingStep, setPairingStep] = useState<PairingStep>("idle");
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);

  const { data: activeDevice, refetch: refetchDevice } = trpc.devices.getActive.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const upsertDevice = trpc.devices.upsert.useMutation({
    onSuccess: () => {
      refetchDevice();
      toast.success("Device updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update device: ${error.message}`);
    },
  });

  const disconnectDevice = trpc.devices.disconnect.useMutation({
    onSuccess: () => {
      refetchDevice();
      setSelectedDevice(null);
      setPairingStep("idle");
      toast.success("Device disconnected");
    },
  });

  const startPairing = async () => {
    if (!("bluetooth" in navigator)) {
      toast.error("Web Bluetooth API is not supported in this browser");
      return;
    }

    try {
      setPairingStep("scanning");
      
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }], // Replace with actual service UUID
        optionalServices: ["battery_service"],
      });

      setSelectedDevice(device);
      setPairingStep("connecting");

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error("Failed to connect to GATT server");
      }

      setPairingStep("connected");

      // Save device to database
      await upsertDevice.mutateAsync({
        deviceName: device.name || "Unknown Device",
        deviceId: device.id,
        isConnected: true,
        batteryLevel: 100, // Would be read from device
        lastSyncDate: new Date(),
      });

      toast.success(`Connected to ${device.name}`);
    } catch (error: any) {
      console.error("Bluetooth pairing error:", error);
      setPairingStep("idle");
      if (error.name === "NotFoundError") {
        toast.error("No device selected");
      } else {
        toast.error(`Failed to pair device: ${error.message}`);
      }
    }
  };

  const syncData = async () => {
    if (!activeDevice) return;

    toast.info("Syncing data from device...");
    
    // Simulate sync
    setTimeout(async () => {
      await upsertDevice.mutateAsync({
        deviceName: activeDevice.deviceName,
        deviceId: activeDevice.deviceId,
        isConnected: activeDevice.isConnected,
        batteryLevel: activeDevice.batteryLevel,
        lastSyncDate: new Date(),
      });
      toast.success("Data synced successfully");
    }, 2000);
  };

  const handleDisconnect = async () => {
    if (!activeDevice) return;
    await disconnectDevice.mutateAsync();
  };

  const getBatteryIcon = (level: number) => {
    if (level > 20) {
      return <Battery className="h-5 w-5" />;
    }
    return <BatteryCharging className="h-5 w-5 text-red-500" />;
  };

  const getDaysRemaining = (installDate: Date, expiryDays: number = 14) => {
    const now = new Date();
    const installed = new Date(installDate);
    const daysPassed = Math.floor((now.getTime() - installed.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, expiryDays - daysPassed);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage devices</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold">Device Management</h1>
          <p className="text-sm text-muted-foreground">Manage your biomarker monitoring device</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Active Device */}
        {activeDevice && activeDevice.isConnected ? (
          <Card className="border-teal-500 border-2">
            <CardHeader className="bg-teal-50 dark:bg-teal-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                    <Wifi className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-teal-700 dark:text-teal-300">
                      {activeDevice.deviceName}
                    </CardTitle>
                    <CardDescription>Connected</CardDescription>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                  <X className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Battery Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getBatteryIcon(activeDevice.batteryLevel)}
                    <span className="text-sm font-medium">Battery Level</span>
                  </div>
                  <span className="text-sm font-semibold">{activeDevice.batteryLevel}%</span>
                </div>
                <Progress value={activeDevice.batteryLevel} className="h-2" />
              </div>

              {/* Patch Information */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Installed</p>
                  <p className="text-sm font-semibold">
                    {activeDevice.lastSyncDate
                      ? new Date(activeDevice.lastSyncDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Days Remaining</p>
                  <p className="text-sm font-semibold">
                    {activeDevice.lastSyncDate
                      ? getDaysRemaining(new Date(activeDevice.lastSyncDate))
                      : "N/A"}{" "}
                    days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Firmware</p>
                  <p className="text-sm font-semibold">v2.1.0</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Measurement Interval</p>
                  <p className="text-sm font-semibold">15 min</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={syncData} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Data
                </Button>
              </div>

              {/* Last Sync */}
              <div className="text-xs text-muted-foreground text-center">
                Last synced:{" "}
                {activeDevice.lastSyncDate
                  ? new Date(activeDevice.lastSyncDate).toLocaleString()
                  : "Never"}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <WifiOff className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <CardTitle>No Device Connected</CardTitle>
                  <CardDescription>Pair a biomarker monitoring device to get started</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button onClick={startPairing} className="w-full" disabled={pairingStep !== "idle"}>
                <Bluetooth className="h-4 w-4 mr-2" />
                {pairingStep === "idle" && "Pair New Device"}
                {pairingStep === "scanning" && "Scanning..."}
                {pairingStep === "connecting" && "Connecting..."}
                {pairingStep === "connected" && "Connected!"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pairing Instructions */}
        {pairingStep !== "idle" && (
          <Card>
            <CardHeader>
              <CardTitle>Pairing Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`h-5 w-5 mt-0.5 ${
                    pairingStep === "scanning" || pairingStep === "connecting" || pairingStep === "connected"
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <div>
                  <p className="font-medium">Step 1: Select Device</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your biomarker patch from the list of available devices
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`h-5 w-5 mt-0.5 ${
                    pairingStep === "connecting" || pairingStep === "connected"
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                />
                <div>
                  <p className="font-medium">Step 2: Establish Connection</p>
                  <p className="text-sm text-muted-foreground">
                    Wait while we connect to your device via Bluetooth
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`h-5 w-5 mt-0.5 ${pairingStep === "connected" ? "text-green-500" : "text-gray-300"}`}
                />
                <div>
                  <p className="font-medium">Step 3: Sync Data</p>
                  <p className="text-sm text-muted-foreground">
                    Initial data sync will begin automatically
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle>About Biomarker Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              The MindSense biomarker patch continuously monitors 5 validated biomarkers associated with mental
              health relapse risk:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>CRP (C-Reactive Protein) - Inflammation marker</li>
              <li>IL-6 (Interleukin-6) - Cytokine signaling</li>
              <li>Leptin - Metabolic function</li>
              <li>Proinsulin - Insulin resistance</li>
              <li>BDNF (Brain-Derived Neurotrophic Factor) - Neurotrophic signaling</li>
            </ul>
            <p className="text-muted-foreground">
              Data is automatically synced every 15 minutes when the device is connected. The patch should be
              replaced every 14 days for optimal accuracy.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
