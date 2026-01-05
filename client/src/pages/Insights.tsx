import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BarChart3, TrendingUp } from "lucide-react";

export default function Insights() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Health Insights</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered analysis of your biomarkers and health patterns
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="border-2 border-dashed border-primary text-primary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Patterns
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Empty State Card */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-16 pb-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-foreground mb-2">Generate Your Health Insights</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our AI analyzes your biomarker trends, symptoms, and lifestyle factors to provide personalized health insights and recommendations.
            </p>

            <Button className="bg-primary hover:bg-primary/90 text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
