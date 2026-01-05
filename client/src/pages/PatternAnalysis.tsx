import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Pill, 
  Activity, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { HelpIcon } from "@/components/HelpIcon";

type Pattern = {
  type: "symptom_biomarker" | "medication_symptom" | "medication_biomarker" | "recurring_symptom";
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
  recommendation: string;
};

export default function PatternAnalysis() {
  const { isAuthenticated } = useAuth();
  const [daysBack, setDaysBack] = useState("90");
  const [analysisResult, setAnalysisResult] = useState<{
    patterns: Pattern[];
    summary: string;
    dataPoints?: {
      measurements: number;
      journalEntries: number;
      medications: number;
      medicationLogs?: number;
    };
    analyzedPeriod?: number;
  } | null>(null);

  const analyzeMutation = trpc.insights.analyzePatterns.useMutation({
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast.success("Pattern analysis complete!");
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate({ daysBack: parseInt(daysBack) });
  };

  const getPatternIcon = (type: Pattern["type"]) => {
    switch (type) {
      case "symptom_biomarker":
        return <Activity className="w-5 h-5 text-blue-600" />;
      case "medication_symptom":
        return <Pill className="w-5 h-5 text-purple-600" />;
      case "medication_biomarker":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "recurring_symptom":
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
    }
  };

  const getPatternTypeLabel = (type: Pattern["type"]) => {
    switch (type) {
      case "symptom_biomarker":
        return "Symptom-Biomarker Correlation";
      case "medication_symptom":
        return "Medication-Symptom Relationship";
      case "medication_biomarker":
        return "Medication-Biomarker Effect";
      case "recurring_symptom":
        return "Recurring Symptom Pattern";
    }
  };

  const getConfidenceBadge = (confidence: Pattern["confidence"]) => {
    switch (confidence) {
      case "high":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">High Confidence</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Medium Confidence</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">Low Confidence</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to access pattern analysis</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold">AI Pattern Analysis</h1>
          <HelpIcon
            title="Pattern Analysis"
            content="Our AI analyzes your health data to identify correlations between symptoms, medications, and biomarker levels. It looks for temporal patterns like 'Symptom X tends to occur 2-3 days after elevated biomarker Y' and provides personalized insights to help you understand your condition better."
            size="md"
          />
        </div>
        <p className="text-muted-foreground">Discover correlations between symptoms, medications, and biomarkers</p>
      </div>

      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Run Analysis</CardTitle>
          <CardDescription>Select a time period to analyze your health patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Analysis Period</label>
              <Select value={daysBack} onValueChange={setDaysBack}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="60">Last 60 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="120">Last 120 days</SelectItem>
                  <SelectItem value="180">Last 180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAnalyze} 
              disabled={analyzeMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Patterns
                </>
              )}
            </Button>
          </div>

          {analysisResult?.dataPoints && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">{analysisResult.dataPoints.measurements}</div>
                <div className="text-xs text-muted-foreground">Measurements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysisResult.dataPoints.journalEntries}</div>
                <div className="text-xs text-muted-foreground">Journal Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysisResult.dataPoints.medications}</div>
                <div className="text-xs text-muted-foreground">Medications</div>
              </div>
              {analysisResult.dataPoints.medicationLogs !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisResult.dataPoints.medicationLogs}</div>
                  <div className="text-xs text-muted-foreground">Medication Logs</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-teal-600" />
                Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{analysisResult.summary}</p>
            </CardContent>
          </Card>

          {/* Patterns */}
          {analysisResult.patterns.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Identified Patterns ({analysisResult.patterns.length})</h2>
              {analysisResult.patterns.map((pattern, index) => (
                <Card key={index} className="border-l-4 border-l-teal-600">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getPatternIcon(pattern.type)}
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{pattern.title}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getPatternTypeLabel(pattern.type)}
                            </Badge>
                            {getConfidenceBadge(pattern.confidence)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Pattern Description</h4>
                      <p className="text-muted-foreground">{pattern.description}</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/10 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-teal-900 dark:text-teal-100">Recommendation</h4>
                          <p className="text-sm text-teal-800 dark:text-teal-200">{pattern.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Patterns Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {analysisResult.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Initial State */}
      {!analysisResult && !analyzeMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Select a time period and click "Analyze Patterns" to discover correlations in your health data. 
                Our AI will identify relationships between your symptoms, medications, and biomarker levels.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground max-w-md mx-auto">
                <p className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  Symptom-biomarker correlations
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medication effectiveness patterns
                </p>
                <p className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recurring symptom cycles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
