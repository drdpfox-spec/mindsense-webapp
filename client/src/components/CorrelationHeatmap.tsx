import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity } from "lucide-react";

export default function CorrelationHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { data: correlationMatrix, isLoading } = trpc.insights.correlations.useQuery();

  useEffect(() => {
    if (!correlationMatrix || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { labels, data } = correlationMatrix;
    const size = labels.length;
    
    // Set canvas size
    const cellSize = 60;
    const labelWidth = 120;
    const labelHeight = 80;
    canvas.width = labelWidth + size * cellSize;
    canvas.height = labelHeight + size * cellSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap cells
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const value = data[i][j];
        
        // Color scale: red (negative) -> white (zero) -> blue (positive)
        let r, g, b;
        if (value > 0) {
          // Positive correlation: white to blue
          const intensity = Math.abs(value);
          r = Math.round(255 * (1 - intensity));
          g = Math.round(255 * (1 - intensity * 0.5));
          b = 255;
        } else {
          // Negative correlation: white to red
          const intensity = Math.abs(value);
          r = 255;
          g = Math.round(255 * (1 - intensity * 0.5));
          b = Math.round(255 * (1 - intensity));
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(
          labelWidth + j * cellSize,
          labelHeight + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw cell border
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1;
        ctx.strokeRect(
          labelWidth + j * cellSize,
          labelHeight + i * cellSize,
          cellSize,
          cellSize
        );

        // Draw correlation value
        ctx.fillStyle = Math.abs(value) > 0.5 ? "#ffffff" : "#000000";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          value.toFixed(2),
          labelWidth + j * cellSize + cellSize / 2,
          labelHeight + i * cellSize + cellSize / 2
        );
      }
    }

    // Draw row labels
    ctx.fillStyle = "#000000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (let i = 0; i < size; i++) {
      const label = labels[i].length > 15 ? labels[i].substring(0, 12) + "..." : labels[i];
      ctx.fillText(
        label,
        labelWidth - 10,
        labelHeight + i * cellSize + cellSize / 2
      );
    }

    // Draw column labels (rotated)
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (let j = 0; j < size; j++) {
      const label = labels[j].length > 15 ? labels[j].substring(0, 12) + "..." : labels[j];
      ctx.translate(
        labelWidth + j * cellSize + cellSize / 2,
        labelHeight - 10
      );
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(label, 0, 0);
      ctx.rotate(Math.PI / 4);
      ctx.translate(
        -(labelWidth + j * cellSize + cellSize / 2),
        -(labelHeight - 10)
      );
    }
    ctx.restore();

    // Draw legend
    const legendX = canvas.width - 150;
    const legendY = 20;
    const legendWidth = 130;
    const legendHeight = 20;

    // Legend gradient
    const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
    gradient.addColorStop(0, "rgb(255, 128, 128)"); // Red (negative)
    gradient.addColorStop(0.5, "rgb(255, 255, 255)"); // White (zero)
    gradient.addColorStop(1, "rgb(128, 128, 255)"); // Blue (positive)

    ctx.fillStyle = gradient;
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

    // Legend labels
    ctx.fillStyle = "#000000";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("-1.0", legendX, legendY + legendHeight + 12);
    ctx.fillText("0", legendX + legendWidth / 2, legendY + legendHeight + 12);
    ctx.fillText("+1.0", legendX + legendWidth, legendY + legendHeight + 12);
  }, [correlationMatrix]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Correlation Heatmap
          </CardTitle>
          <CardDescription>
            Analyzing relationships between biomarkers and mood scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading correlation data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!correlationMatrix || correlationMatrix.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Correlation Heatmap
          </CardTitle>
          <CardDescription>
            Analyzing relationships between biomarkers and mood scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Not enough data to generate correlations. Please add more biomarker readings and mood assessments.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Correlation Heatmap
        </CardTitle>
        <CardDescription>
          Relationships between biomarkers and mood scores (last 90 days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>How to read:</strong> Blue cells indicate positive correlations (when one increases, the other tends to increase).
            Red cells indicate negative correlations (when one increases, the other tends to decrease).
          </p>
          <p>
            <strong>Interpretation:</strong> Values closer to +1.0 or -1.0 indicate stronger relationships.
            Values near 0 indicate weak or no relationship.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
