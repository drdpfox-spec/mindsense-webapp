/**
 * Export utilities for biomarker data
 * Supports CSV and PDF export formats
 */

import { BIOMARKER_LIST } from "@shared/biomarkers";

interface BiomarkerReading {
  biomarkerType: string;
  value: number;
  timestamp: Date;
  unit?: string;
}

/**
 * Export biomarker data to CSV format
 */
export function exportToCSV(
  readings: BiomarkerReading[],
  selectedBiomarkers: string[],
  timeRange: string
): void {
  if (!readings || readings.length === 0) {
    throw new Error("No data available to export");
  }

  // Filter readings by selected biomarkers
  const filteredReadings = readings.filter((r) =>
    selectedBiomarkers.includes(r.biomarkerType)
  );

  if (filteredReadings.length === 0) {
    throw new Error("No data for selected biomarkers");
  }

  // CSV Header
  const headers = ["Date", "Time", "Biomarker", "Value", "Unit", "Normal Range"];
  
  // CSV Rows
  const rows = filteredReadings.map((reading) => {
    const biomarker = BIOMARKER_LIST.find((b) => b.id === reading.biomarkerType);
    const date = new Date(reading.timestamp);
    const normalRange = biomarker
      ? `${biomarker.normalRange.min}-${biomarker.normalRange.max}`
      : "N/A";
    const unit = biomarker?.unit || reading.unit || "";

    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      reading.biomarkerType,
      reading.value.toFixed(2),
      unit,
      normalRange,
    ];
  });

  // Combine headers and rows
  const csvContent = [
    // Metadata
    [`MindSense Biomarker Export`],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Time Range: Last ${timeRange} days`],
    [`Biomarkers: ${selectedBiomarkers.join(", ")}`],
    [], // Empty row
    headers,
    ...rows,
  ]
    .map((row) => row.join(","))
    .join("\n");

  // Create download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `mindsense-biomarkers-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export biomarker data to JSON format
 */
export function exportToJSON(
  readings: BiomarkerReading[],
  selectedBiomarkers: string[],
  timeRange: string
): void {
  if (!readings || readings.length === 0) {
    throw new Error("No data available to export");
  }

  const filteredReadings = readings.filter((r) =>
    selectedBiomarkers.includes(r.biomarkerType)
  );

  if (filteredReadings.length === 0) {
    throw new Error("No data for selected biomarkers");
  }

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      timeRange: `Last ${timeRange} days`,
      biomarkers: selectedBiomarkers,
      recordCount: filteredReadings.length,
    },
    readings: filteredReadings.map((reading) => {
      const biomarker = BIOMARKER_LIST.find((b) => b.id === reading.biomarkerType);
      return {
        date: new Date(reading.timestamp).toISOString(),
        biomarker: reading.biomarkerType,
        value: reading.value,
        unit: biomarker?.unit || reading.unit || "",
        normalRange: biomarker
          ? {
              min: biomarker.normalRange.min,
              max: biomarker.normalRange.max,
            }
          : null,
      };
    }),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `mindsense-biomarkers-${new Date().toISOString().split("T")[0]}.json`
  );
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export biomarker data to PDF with chart visualization
 */
export async function exportToPDF(
  readings: BiomarkerReading[],
  selectedBiomarkers: string[],
  timeRange: string,
  chartCanvas?: HTMLCanvasElement | null
): Promise<void> {
  if (!readings || readings.length === 0) {
    throw new Error("No data available to export");
  }

  const filteredReadings = readings.filter((r) =>
    selectedBiomarkers.includes(r.biomarkerType)
  );

  if (filteredReadings.length === 0) {
    throw new Error("No data for selected biomarkers");
  }

  // Dynamically import jsPDF
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 166, 81); // MindSense green
  doc.text("MindSense Biomarker Report", 20, yPosition);
  yPosition += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Time Range: Last ${timeRange} days`, 20, yPosition);
  yPosition += 6;
  doc.text(`Biomarkers: ${selectedBiomarkers.join(", ")}`, 20, yPosition);
  yPosition += 10;

  // Add chart image if available
  if (chartCanvas) {
    try {
      const chartImage = chartCanvas.toDataURL("image/png");
      const imgWidth = 170;
      const imgHeight = 80;
      doc.addImage(chartImage, "PNG", 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error("Failed to add chart to PDF:", error);
    }
  }

  // Add page break if needed
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  // Biomarker Data Table
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Biomarker Readings", 20, yPosition);
  yPosition += 8;

  // Prepare table data
  const tableData = filteredReadings.map((reading) => {
    const biomarker = BIOMARKER_LIST.find((b) => b.id === reading.biomarkerType);
    const date = new Date(reading.timestamp);
    const normalRange = biomarker
      ? `${biomarker.normalRange.min}-${biomarker.normalRange.max}`
      : "N/A";
    const unit = biomarker?.unit || reading.unit || "";
    const isNormal = biomarker
      ? reading.value >= biomarker.normalRange.min &&
        reading.value <= biomarker.normalRange.max
      : true;

    return [
      date.toLocaleDateString(),
      reading.biomarkerType,
      reading.value.toFixed(2),
      unit,
      normalRange,
      isNormal ? "Normal" : "Abnormal",
    ];
  });

  // Add table using autoTable
  (doc as any).autoTable({
    startY: yPosition,
    head: [["Date", "Biomarker", "Value", "Unit", "Normal Range", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [0, 166, 81], // MindSense green
      textColor: [255, 255, 255],
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      5: {
        cellWidth: 25,
        halign: "center",
      },
    },
    didParseCell: function (data: any) {
      // Color abnormal values red
      if (data.column.index === 5 && data.cell.text[0] === "Abnormal") {
        data.cell.styles.textColor = [220, 53, 69]; // Red
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "MindSense - Mental Health Monitoring Platform",
      20,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save PDF
  doc.save(`mindsense-biomarkers-${new Date().toISOString().split("T")[0]}.pdf`);
}
