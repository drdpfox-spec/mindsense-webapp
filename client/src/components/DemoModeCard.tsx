import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DemoModeCard() {
  const [includePatterns, setIncludePatterns] = useState(true);
  const [daysOfHistory, setDaysOfHistory] = useState(30);
  
  const utils = trpc.useUtils();
  
  const generateMutation = trpc.demo.generateSampleData.useMutation({
    onSuccess: (data) => {
      toast.success("Demo data generated successfully!", {
        description: `Created ${data.results.biomarkerReadings} biomarker readings, ${data.results.moodAssessments} mood assessments, and more.`,
      });
      
      // Invalidate all queries to refresh the UI
      utils.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to generate demo data", {
        description: error.message,
      });
    },
  });

  const clearMutation = trpc.demo.clearAllData.useMutation({
    onSuccess: () => {
      toast.success("All data cleared successfully");
      utils.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to clear data", {
        description: error.message,
      });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({
      daysOfHistory,
      includePatterns,
    });
  };

  const handleClear = () => {
    clearMutation.mutate();
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          Generate sample data to explore MindSense features without manual entry
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="patterns">Include Realistic Patterns</Label>
              <p className="text-sm text-muted-foreground">
                Generate data with trends (e.g., declining mood, rising biomarkers)
              </p>
            </div>
            <Switch
              id="patterns"
              checked={includePatterns}
              onCheckedChange={setIncludePatterns}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Days of History: {daysOfHistory}</Label>
            <input
              id="days"
              type="range"
              min="7"
              max="90"
              value={daysOfHistory}
              onChange={(e) => setDaysOfHistory(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Generate {daysOfHistory} days of historical data
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="flex-1"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Sample Data
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={clearMutation.isPending}
              >
                {clearMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your biomarker readings, mood assessments,
                  journal entries, medications, appointments, and care team members. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Tip: Use this to quickly populate your dashboard with realistic health data for
          testing and demonstration purposes.
        </p>
      </CardContent>
    </Card>
  );
}
