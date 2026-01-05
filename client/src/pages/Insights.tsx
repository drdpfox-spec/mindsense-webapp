import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, Info, TrendingUp, Brain, Activity } from "lucide-react";

export default function Insights() {
  const { isAuthenticated } = useAuth();

  const { data: insightsData, isLoading } = trpc.insights.generate.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "positive":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-red-500";
      case "warning":
        return "border-l-amber-500";
      case "positive":
        return "border-l-green-500";
      default:
        return "border-l-blue-500";
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "text-red-500";
    if (risk >= 40) return "text-amber-500";
    return "text-green-500";
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return "High Risk";
    if (risk >= 40) return "Moderate Risk";
    return "Low Risk";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view AI insights</CardDescription>
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
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-semibold">AI Insights</h1>
              <p className="text-sm text-muted-foreground">
                Pattern detection and relapse risk analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : insightsData ? (
          <>
            {/* Relapse Risk Score */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relapse Risk Score</CardTitle>
                    <CardDescription>Based on biomarker trends and mood patterns</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${getRiskColor(insightsData.relapseRisk)}`}>
                      {insightsData.relapseRisk}
                      <span className="text-xl">/100</span>
                    </div>
                    <div className={`text-sm font-medium ${getRiskColor(insightsData.relapseRisk)}`}>
                      {getRiskLabel(insightsData.relapseRisk)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress
                  value={insightsData.relapseRisk}
                  className="h-3"
                  indicatorClassName={
                    insightsData.relapseRisk >= 70
                      ? "bg-red-500"
                      : insightsData.relapseRisk >= 40
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Low Risk</span>
                  <span>Moderate Risk</span>
                  <span>High Risk</span>
                </div>
              </CardContent>
            </Card>

            {/* Insights List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detected Patterns & Insights
              </h2>

              {insightsData.insights.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No significant patterns detected at this time.</p>
                    <p className="text-sm mt-2">Continue tracking your biomarkers and mood for personalized insights.</p>
                  </CardContent>
                </Card>
              ) : (
                insightsData.insights.map((insight, index) => (
                  <Card key={index} className={`border-l-4 ${getInsightBorderColor(insight.type)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <CardDescription className="mt-2">{insight.description}</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className="text-sm font-semibold">{insight.confidence}%</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Biomarkers Involved */}
                      {insight.biomarkersInvolved && insight.biomarkersInvolved.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Biomarkers Involved:</h4>
                          <div className="flex flex-wrap gap-2">
                            {insight.biomarkersInvolved.map((biomarkerId) => (
                              <span
                                key={biomarkerId}
                                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs font-medium"
                              >
                                {biomarkerId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {insight.recommendations && insight.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                          <ul className="space-y-1.5">
                            {insight.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle>How AI Insights Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  MindSense uses advanced pattern detection algorithms to analyze your biomarker trends and mood
                  assessments, identifying potential risk factors for mental health relapse.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium">Our AI analyzes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Individual biomarker levels and trends over time</li>
                    <li>Correlations between multiple biomarkers</li>
                    <li>Mood patterns and changes</li>
                    <li>Deviations from your personal baseline</li>
                    <li>Clinical evidence from research studies</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  These insights are designed to support—not replace—professional medical advice. Always consult with
                  your healthcare provider about any concerns.
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Unable to generate insights at this time.</p>
              <p className="text-sm mt-2">Please ensure you have biomarker readings and mood assessments recorded.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
