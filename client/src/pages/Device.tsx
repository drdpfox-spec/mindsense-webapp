import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bluetooth } from "lucide-react";

export default function Device() {
  const [isConnected, setIsConnected] = useState(false);

  const handlePairDevice = async () => {
    try {
      if (!("bluetooth" in navigator)) {
        alert("Web Bluetooth API is not supported in this browser");
        return;
      }
      
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Bluetooth pairing failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Device Management</h1>
              <p className="text-sm text-muted-foreground">Manage your MindSense monitoring patch</p>
            </div>
            <Button onClick={handlePairDevice} className="bg-primary hover:bg-primary/90 text-white">
              <Bluetooth className="h-4 w-4 mr-2" />
              Pair Device
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Device Status Card */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Bluetooth className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">No Device Connected</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pair your MindSense monitoring patch to start tracking<br />your biomarkers in real-time.
            </p>

            <Button 
              onClick={handlePairDevice}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Bluetooth className="h-4 w-4 mr-2" />
              Pair New Device
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
