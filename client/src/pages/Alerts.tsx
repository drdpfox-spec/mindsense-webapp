import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function Alerts() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Alerts & Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay informed about your health status and device updates</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Empty State Card */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">All Caught Up!</h2>
            <p className="text-sm text-muted-foreground">
              You have no new alerts. We'll notify you if anything requires your attention.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
