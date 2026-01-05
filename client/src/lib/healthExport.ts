// Health Platform Export Utilities

export interface BiomarkerMeasurement {
  timestamp: Date;
  piiinp: number | null;
  ha: number | null;
  timp1: number | null;
  tgfb1: number | null;
}

/**
 * Export biomarker data to Apple Health (HealthKit) XML format
 */
export function exportToAppleHealth(measurements: BiomarkerMeasurement[], userName: string): string {
  const now = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE HealthData>
<HealthData locale="en_US">
  <ExportDate value="${now}"/>
  <Me HKCharacteristicTypeIdentifierDateOfBirth="1990-01-01" HKCharacteristicTypeIdentifierBiologicalSex="HKBiologicalSexNotSet"/>
  
`;

  measurements.forEach((measurement) => {
    const timestamp = measurement.timestamp.toISOString();
    
    // PIIINP (Procollagen III N-terminal Propeptide)
    if (measurement.piiinp !== null) {
      xml += `  <Record type="HKQuantityTypeIdentifierBiomarkerPIIINP" sourceName="FibroSense" sourceVersion="1.0" unit="ng/mL" creationDate="${timestamp}" startDate="${timestamp}" endDate="${timestamp}" value="${measurement.piiinp / 10}"/>\n`;
    }
    
    // HA (Hyaluronic Acid)
    if (measurement.ha !== null) {
      xml += `  <Record type="HKQuantityTypeIdentifierBiomarkerHA" sourceName="FibroSense" sourceVersion="1.0" unit="ng/mL" creationDate="${timestamp}" startDate="${timestamp}" endDate="${timestamp}" value="${measurement.ha}"/>\n`;
    }
    
    // TIMP-1
    if (measurement.timp1 !== null) {
      xml += `  <Record type="HKQuantityTypeIdentifierBiomarkerTIMP1" sourceName="FibroSense" sourceVersion="1.0" unit="ng/mL" creationDate="${timestamp}" startDate="${timestamp}" endDate="${timestamp}" value="${measurement.timp1}"/>\n`;
    }
    
    // TGF-β1
    if (measurement.tgfb1 !== null) {
      xml += `  <Record type="HKQuantityTypeIdentifierBiomarkerTGFB1" sourceName="FibroSense" sourceVersion="1.0" unit="pg/mL" creationDate="${timestamp}" startDate="${timestamp}" endDate="${timestamp}" value="${measurement.tgfb1 / 10}"/>\n`;
    }
  });

  xml += `</HealthData>`;
  
  return xml;
}

/**
 * Export biomarker data to Google Fit JSON format
 */
export function exportToGoogleFit(measurements: BiomarkerMeasurement[], userName: string): string {
  const dataPoints: any[] = [];
  
  measurements.forEach((measurement) => {
    const timestamp = measurement.timestamp.getTime() * 1000000; // Convert to nanoseconds
    
    // PIIINP
    if (measurement.piiinp !== null) {
      dataPoints.push({
        dataTypeName: "com.fibrosense.biomarker.piiinp",
        startTimeNanos: timestamp,
        endTimeNanos: timestamp,
        value: [{
          fpVal: measurement.piiinp / 10
        }],
        originDataSourceId: "raw:com.fibrosense.biomarker.piiinp:fibrosense_app"
      });
    }
    
    // HA
    if (measurement.ha !== null) {
      dataPoints.push({
        dataTypeName: "com.fibrosense.biomarker.ha",
        startTimeNanos: timestamp,
        endTimeNanos: timestamp,
        value: [{
          fpVal: measurement.ha
        }],
        originDataSourceId: "raw:com.fibrosense.biomarker.ha:fibrosense_app"
      });
    }
    
    // TIMP-1
    if (measurement.timp1 !== null) {
      dataPoints.push({
        dataTypeName: "com.fibrosense.biomarker.timp1",
        startTimeNanos: timestamp,
        endTimeNanos: timestamp,
        value: [{
          fpVal: measurement.timp1
        }],
        originDataSourceId: "raw:com.fibrosense.biomarker.timp1:fibrosense_app"
      });
    }
    
    // TGF-β1
    if (measurement.tgfb1 !== null) {
      dataPoints.push({
        dataTypeName: "com.fibrosense.biomarker.tgfb1",
        startTimeNanos: timestamp,
        endTimeNanos: timestamp,
        value: [{
          fpVal: measurement.tgfb1 / 10
        }],
        originDataSourceId: "raw:com.fibrosense.biomarker.tgfb1:fibrosense_app"
      });
    }
  });

  const googleFitData = {
    minStartTimeNs: measurements.length > 0 ? measurements[0].timestamp.getTime() * 1000000 : 0,
    maxEndTimeNs: measurements.length > 0 ? measurements[measurements.length - 1].timestamp.getTime() * 1000000 : 0,
    dataSourceId: "raw:com.fibrosense.biomarkers:fibrosense_app",
    point: dataPoints
  };

  return JSON.stringify(googleFitData, null, 2);
}

/**
 * Download file to user's device
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
