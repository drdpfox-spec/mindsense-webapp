import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Measurement {
  measuredAt: Date;
  piiinp: number | null;
  ha: number | null;
  timp1: number | null;
  tgfb1: number | null;
}

interface JournalEntry {
  entryDate: Date;
  entryType: string;
  title: string;
  description: string | null;
  severity: number | null;
}

interface HealthProfile {
  fibrosisType: string;
  diagnosisDate: Date | null;
  baselinePIIINP: number | null;
  baselineHA: number | null;
  baselineTIMP1: number | null;
  baselineTGFB1: number | null;
}

export function exportBiomarkerReport(
  measurements: Measurement[],
  profile: HealthProfile | null,
  userName: string
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166); // Teal color
  doc.text("FibroSense", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Biomarker Trends Report", 14, 30);
  
  // Patient info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Patient: ${userName}`, 14, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);
  
  if (profile) {
    doc.text(`Condition: ${profile.fibrosisType} fibrosis`, 14, 50);
    if (profile.diagnosisDate) {
      doc.text(`Diagnosed: ${new Date(profile.diagnosisDate).toLocaleDateString()}`, 14, 55);
    }
  }
  
  // Baseline values
  if (profile) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Baseline Values", 14, 65);
    
    const baselineData = [
      ["PIIINP", profile.baselinePIIINP ? `${(profile.baselinePIIINP / 10).toFixed(1)} ng/mL` : "Not set"],
      ["HA", profile.baselineHA ? `${profile.baselineHA} ng/mL` : "Not set"],
      ["TIMP-1", profile.baselineTIMP1 ? `${profile.baselineTIMP1} ng/mL` : "Not set"],
      ["TGF-β1", profile.baselineTGFB1 ? `${(profile.baselineTGFB1 / 10).toFixed(1)} pg/mL` : "Not set"],
    ];
    
    autoTable(doc, {
      startY: 70,
      head: [["Biomarker", "Baseline Value"]],
      body: baselineData,
      theme: "striped",
      headStyles: { fillColor: [20, 184, 166] },
    });
  }
  
  // Recent measurements
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const startY = profile ? (doc as any).lastAutoTable.finalY + 10 : 70;
  doc.text("Recent Measurements", 14, startY);
  
  const measurementData = measurements.slice(0, 20).map(m => [
    new Date(m.measuredAt).toLocaleDateString(),
    m.piiinp ? (m.piiinp / 10).toFixed(1) : "-",
    m.ha ? m.ha.toString() : "-",
    m.timp1 ? m.timp1.toString() : "-",
    m.tgfb1 ? (m.tgfb1 / 10).toFixed(1) : "-",
  ]);
  
  autoTable(doc, {
    startY: startY + 5,
    head: [["Date", "PIIINP\n(ng/mL)", "HA\n(ng/mL)", "TIMP-1\n(ng/mL)", "TGF-β1\n(pg/mL)"]],
    body: measurementData,
    theme: "striped",
    headStyles: { fillColor: [20, 184, 166] },
    styles: { fontSize: 8 },
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
      "This report is for informational purposes only. Consult your healthcare provider.",
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }
  
  // Save
  doc.save(`FibroSense_Biomarkers_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportJournalReport(
  entries: JournalEntry[],
  userName: string
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166);
  doc.text("FibroSense", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Health Journal Report", 14, 30);
  
  // Patient info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Patient: ${userName}`, 14, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);
  doc.text(`Total Entries: ${entries.length}`, 14, 50);
  
  // Journal entries
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Journal Entries", 14, 60);
  
  const journalData = entries.map(e => [
    new Date(e.entryDate).toLocaleDateString(),
    e.entryType.charAt(0).toUpperCase() + e.entryType.slice(1),
    e.title,
    e.severity ? `${e.severity}/10` : "-",
    e.description || "-",
  ]);
  
  autoTable(doc, {
    startY: 65,
    head: [["Date", "Type", "Title", "Severity", "Notes"]],
    body: journalData,
    theme: "striped",
    headStyles: { fillColor: [20, 184, 166] },
    styles: { fontSize: 8 },
    columnStyles: {
      4: { cellWidth: 60 },
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
  }
  
  // Save
  doc.save(`FibroSense_Journal_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportComprehensiveReport(
  measurements: Measurement[],
  entries: JournalEntry[],
  profile: HealthProfile | null,
  insights: any,
  userName: string
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(20, 184, 166);
  doc.text("FibroSense", 14, 20);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Comprehensive Health Report", 14, 30);
  
  // Patient info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Patient: ${userName}`, 14, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 45);
  
  if (profile) {
    doc.text(`Condition: ${profile.fibrosisType} fibrosis`, 14, 50);
  }
  
  // Summary statistics
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", 14, 60);
  
  const summaryData = [
    ["Total Measurements", measurements.length.toString()],
    ["Journal Entries", entries.length.toString()],
    ["Symptoms Logged", entries.filter(e => e.entryType === "symptom").length.toString()],
    ["Medications Tracked", entries.filter(e => e.entryType === "medication").length.toString()],
  ];
  
  autoTable(doc, {
    startY: 65,
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10 },
  });
  
  // Baseline values
  if (profile) {
    const baselineY = (doc as any).lastAutoTable.finalY + 10;
    doc.text("Baseline Values", 14, baselineY);
    
    const baselineData = [
      ["PIIINP", profile.baselinePIIINP ? `${(profile.baselinePIIINP / 10).toFixed(1)} ng/mL` : "Not set"],
      ["HA", profile.baselineHA ? `${profile.baselineHA} ng/mL` : "Not set"],
      ["TIMP-1", profile.baselineTIMP1 ? `${profile.baselineTIMP1} ng/mL` : "Not set"],
      ["TGF-β1", profile.baselineTGFB1 ? `${(profile.baselineTGFB1 / 10).toFixed(1)} pg/mL` : "Not set"],
    ];
    
    autoTable(doc, {
      startY: baselineY + 5,
      head: [["Biomarker", "Baseline Value"]],
      body: baselineData,
      theme: "striped",
      headStyles: { fillColor: [20, 184, 166] },
    });
  }
  
  // Recent measurements (last 10)
  doc.addPage();
  doc.setFontSize(12);
  doc.text("Recent Biomarker Measurements", 14, 20);
  
  const measurementData = measurements.slice(0, 10).map(m => [
    new Date(m.measuredAt).toLocaleDateString(),
    m.piiinp ? (m.piiinp / 10).toFixed(1) : "-",
    m.ha ? m.ha.toString() : "-",
    m.timp1 ? m.timp1.toString() : "-",
    m.tgfb1 ? (m.tgfb1 / 10).toFixed(1) : "-",
  ]);
  
  autoTable(doc, {
    startY: 25,
    head: [["Date", "PIIINP", "HA", "TIMP-1", "TGF-β1"]],
    body: measurementData,
    theme: "striped",
    headStyles: { fillColor: [20, 184, 166] },
    styles: { fontSize: 9 },
  });
  
  // Health insights
  if (insights && insights.insights && insights.insights.length > 0) {
    const insightsY = (doc as any).lastAutoTable.finalY + 10;
    doc.text("Health Insights", 14, insightsY);
    
    const insightData = insights.insights.slice(0, 5).map((insight: any) => [
      insight.category,
      insight.title,
      insight.description,
    ]);
    
    autoTable(doc, {
      startY: insightsY + 5,
      head: [["Category", "Title", "Description"]],
      body: insightData,
      theme: "striped",
      headStyles: { fillColor: [20, 184, 166] },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { cellWidth: 80 },
      },
    });
  }
  
  // Footer on all pages
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
      "This report is for informational purposes only. Consult your healthcare provider.",
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: "center" }
    );
  }
  
  // Save
  doc.save(`FibroSense_Comprehensive_${new Date().toISOString().split('T')[0]}.pdf`);
}
