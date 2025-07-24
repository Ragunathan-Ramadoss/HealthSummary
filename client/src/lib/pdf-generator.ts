import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFReportData {
  patientId: string;
  testType: string;
  createdAt: string;
  parameters: Record<string, any>;
  aiReport?: {
    summary: string;
    keyFindings: Array<{
      parameter: string;
      value: string;
      referenceRange: string;
      status: string;
      interpretation: string;
    }>;
    recommendations: string[];
    treatmentOptions?: {
      lifestyle: string[];
      medical: string[];
      medications: string[];
    };
    overallAssessment: string;
    followUpRequired: boolean;
    criticalFlags: string[];
  };
}

export const generatePDFReport = (reportData: PDFReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;
  
  // Medical theme colors
  const medicalBlue = [41, 128, 185] as const;
  const medicalGreen = [39, 174, 96] as const;
  const medicalAmber = [243, 156, 18] as const;
  const medicalRed = [231, 76, 60] as const;
  const lightGray = [248, 249, 250] as const;
  const darkGray = [52, 58, 64] as const;
  
  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35);
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Get test display name
  const getTestDisplayName = (testType: string) => {
    const testNames = {
      blood: 'Blood Panel',
      urine: 'Urine Analysis',
      lipid: 'Lipid Profile',
      thyroid: 'Thyroid Function',
      liver: 'Liver Function'
    };
    return testNames[testType as keyof typeof testNames] || testType;
  };

  // Calculate risk level
  const getRiskLevel = (findings: any[], parameters: any) => {
    if (!findings || findings.length === 0) {
      if (!parameters) return 'low';
      
      let abnormalCount = 0;
      let borderlineCount = 0;
      
      Object.entries(parameters).forEach(([key, value]) => {
        const numValue = parseFloat(String(value));
        if (isNaN(numValue)) return;
        
        if (key.toLowerCase().includes('cholesterol')) {
          if (numValue > 240) abnormalCount++;
          else if (numValue > 200) borderlineCount++;
        } else if (key.toLowerCase().includes('glucose')) {
          if (numValue > 126) abnormalCount++;
          else if (numValue > 100) borderlineCount++;
        } else if (key.toLowerCase().includes('hemoglobin')) {
          if (numValue < 10 || numValue > 18) abnormalCount++;
          else if (numValue < 12 || numValue > 16) borderlineCount++;
        }
      });
      
      if (abnormalCount > 0) return 'high';
      if (borderlineCount > 1) return 'medium';
      return 'low';
    }
    
    const abnormalCount = findings.filter(f => f.status?.toLowerCase() === 'abnormal').length;
    const borderlineCount = findings.filter(f => f.status?.toLowerCase() === 'borderline').length;
    
    if (abnormalCount > 0) return 'high';
    if (borderlineCount > 1) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel(reportData.aiReport?.keyFindings || [], reportData.parameters);

  // Enhanced Header with gradient effect
  doc.setFillColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Add subtle gradient effect
  doc.setFillColor(41, 128, 200);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MediReport AI', margin, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Medical Test Analysis Report', margin, 35);

  yPosition = 65;

  // Report Title with colored background
  doc.setFillColor(240, 248, 255);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
  doc.setDrawColor(200, 220, 240);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25);
  
  doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title = `Understanding your ${getTestDisplayName(reportData.testType)} Test Results`;
  yPosition = addWrappedText(title, margin, yPosition + 5, pageWidth - 2 * margin, 18);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Comprehensive AI-powered analysis with personalized insights', margin, yPosition + 5);
  yPosition += 20;

  // Patient Information with styled box
  checkNewPage(50);
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 45, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 45);
  
  doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📋 Medical Report Summary', margin, yPosition + 5);
  yPosition += 15;

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Two column layout
  const patientColWidth = (pageWidth - 2 * margin) / 2;
  doc.text(`Patient: ${reportData.patientId}`, margin, yPosition);
  doc.text(`Test Date: ${new Date(reportData.createdAt).toLocaleDateString()}`, margin + patientColWidth, yPosition);
  yPosition += 8;
  doc.text(`Test Type: ${getTestDisplayName(reportData.testType)}`, margin, yPosition);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin + patientColWidth, yPosition);
  yPosition += 25;

  // Risk Assessment Section with visual indicator
  checkNewPage(80);
  doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('🔬 The Science Behind the Test', margin, yPosition);
  yPosition += 15;

  // Risk Assessment Scale
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Assessment Scale', margin, yPosition);
  yPosition += 10;

  // Risk visualization
  const riskBoxWidth = (pageWidth - 2 * margin - 20) / 3;
  const riskBoxHeight = 25;
  
  // Low Risk
  const lowRiskColor = riskLevel === 'low' ? medicalGreen : ([200, 200, 200] as const);
  doc.setFillColor(lowRiskColor[0], lowRiskColor[1], lowRiskColor[2]);
  doc.rect(margin, yPosition, riskBoxWidth, riskBoxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('LOW RISK', margin + 5, yPosition + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('Normal range', margin + 5, yPosition + 18);
  
  // Medium Risk
  const mediumRiskColor = riskLevel === 'medium' ? medicalAmber : ([200, 200, 200] as const);
  doc.setFillColor(mediumRiskColor[0], mediumRiskColor[1], mediumRiskColor[2]);
  doc.rect(margin + riskBoxWidth + 10, yPosition, riskBoxWidth, riskBoxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('MEDIUM RISK', margin + riskBoxWidth + 15, yPosition + 8);
  doc.text('Monitoring needed', margin + riskBoxWidth + 15, yPosition + 18);
  
  // High Risk
  const highRiskColor = riskLevel === 'high' ? medicalRed : ([200, 200, 200] as const);
  doc.setFillColor(highRiskColor[0], highRiskColor[1], highRiskColor[2]);
  doc.rect(margin + 2 * riskBoxWidth + 20, yPosition, riskBoxWidth, riskBoxHeight, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('HIGH RISK', margin + 2 * riskBoxWidth + 25, yPosition + 8);
  doc.text('Action required', margin + 2 * riskBoxWidth + 25, yPosition + 18);
  
  yPosition += 35;

  // Current Risk Level highlight
  doc.setFillColor(240, 248, 255);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 20, 'F');
  doc.setDrawColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 20);
  
  doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const riskText = `Your Current Risk Level: ${riskLevel.toUpperCase()} RISK`;
  doc.text(riskText, margin, yPosition + 8);
  yPosition += 25;

  // Executive Summary
  if (reportData.aiReport?.summary) {
    checkNewPage(50);
    doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Your Values with Test Summary', margin, yPosition);
    yPosition += 15;

    doc.setFillColor(250, 250, 250);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 30, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 30);
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Summary', margin, yPosition + 5);
    yPosition += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(reportData.aiReport.summary, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 20;
  }

  // Test Parameters and Results with enhanced styling
  checkNewPage(60);
  
  // Enhanced table with colored header
  doc.setFillColor(240, 248, 255);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 30, 'F');
  doc.setDrawColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 30);

  // Table headers with improved styling
  doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const tableColWidth = (pageWidth - 2 * margin) / 4;
  doc.text('Parameter', margin, yPosition + 5);
  doc.text('Your Result', margin + tableColWidth, yPosition + 5);
  doc.text('Reference Range', margin + 2 * tableColWidth, yPosition + 5);
  doc.text('Status', margin + 3 * tableColWidth, yPosition + 5);
  yPosition += 35;

  // Table data with alternating row colors
  doc.setFont('helvetica', 'normal');
  let rowIndex = 0;
  Object.entries(reportData.parameters).forEach(([param, value]) => {
    checkNewPage(15);
    
    // Alternating row colors
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin - 5, yPosition - 3, pageWidth - 2 * margin + 10, 12, 'F');
    }
    
    const finding = reportData.aiReport?.keyFindings?.find((f: any) => 
      f.parameter.toLowerCase().includes(param.toLowerCase())
    );
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.text(param, margin, yPosition + 3);
    
    // Highlight result value
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), margin + tableColWidth, yPosition + 3);
    doc.setFont('helvetica', 'normal');
    
    doc.text(finding?.referenceRange || 'N/A', margin + 2 * tableColWidth, yPosition + 3);
    
    // Status color coding
    const status = finding?.status || 'Normal';
    let statusColor = medicalGreen as readonly number[];
    if (status.toLowerCase() === 'abnormal') statusColor = medicalRed as readonly number[];
    else if (status.toLowerCase() === 'borderline') statusColor = medicalAmber as readonly number[];
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(status, margin + 3 * tableColWidth, yPosition + 3);
    doc.setFont('helvetica', 'normal');
    
    yPosition += 12;
    rowIndex++;
  });

  yPosition += 10;

  // Key Findings
  if (reportData.aiReport?.keyFindings && reportData.aiReport.keyFindings.length > 0) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Findings', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    reportData.aiReport.keyFindings.forEach((finding, index) => {
      checkNewPage(25);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${finding.parameter}`, margin, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      yPosition = addWrappedText(`Value: ${finding.value}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addWrappedText(`Reference Range: ${finding.referenceRange}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addWrappedText(`Status: ${finding.status}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition = addWrappedText(`Interpretation: ${finding.interpretation}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
      yPosition += 10;
    });
  }

  // Clinical Recommendations
  if (reportData.aiReport?.recommendations && reportData.aiReport.recommendations.length > 0) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Recommendations', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    reportData.aiReport.recommendations.forEach((recommendation, index) => {
      checkNewPage(20);
      yPosition = addWrappedText(`${index + 1}. ${recommendation}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Treatment Considerations with enhanced styling
  if (reportData.aiReport?.treatmentOptions) {
    checkNewPage(50);
    doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('💊 Treatment Considerations', margin, yPosition);
    yPosition += 15;

    // Lifestyle Modifications with styled box
    if (reportData.aiReport.treatmentOptions.lifestyle?.length > 0) {
      doc.setFillColor(240, 255, 240);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15 + (reportData.aiReport.treatmentOptions.lifestyle.length * 8), 'F');
      doc.setDrawColor(medicalGreen[0], medicalGreen[1], medicalGreen[2]);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15 + (reportData.aiReport.treatmentOptions.lifestyle.length * 8));
      
      doc.setTextColor(medicalGreen[0], medicalGreen[1], medicalGreen[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🌱 Lifestyle Modifications:', margin, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      reportData.aiReport.treatmentOptions.lifestyle.forEach((item) => {
        checkNewPage(15);
        yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 3;
      });
      yPosition += 15;
    }

    // Medical Interventions with styled box
    if (reportData.aiReport.treatmentOptions.medical?.length > 0) {
      doc.setFillColor(240, 248, 255);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15 + (reportData.aiReport.treatmentOptions.medical.length * 8), 'F');
      doc.setDrawColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15 + (reportData.aiReport.treatmentOptions.medical.length * 8));
      
      doc.setTextColor(medicalBlue[0], medicalBlue[1], medicalBlue[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('🏥 Medical Interventions:', margin, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      reportData.aiReport.treatmentOptions.medical.forEach((item) => {
        checkNewPage(15);
        yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 3;
      });
      yPosition += 15;
    }

    // Medications with styled box
    if (reportData.aiReport.treatmentOptions.medications?.length > 0) {
      doc.setFillColor(255, 240, 255);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15 + (reportData.aiReport.treatmentOptions.medications.length * 8) + 10, 'F');
      doc.setDrawColor(148, 0, 211);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 15 + (reportData.aiReport.treatmentOptions.medications.length * 8) + 10);
      
      doc.setTextColor(148, 0, 211);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('💊 Common Medications:', margin, yPosition + 5);
      yPosition += 15;

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      reportData.aiReport.treatmentOptions.medications.forEach((item) => {
        checkNewPage(15);
        yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 3;
      });
      
      // Warning note
      doc.setTextColor(148, 0, 211);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      yPosition = addWrappedText('*Medications should only be prescribed by qualified healthcare providers', margin, yPosition + 5, pageWidth - 2 * margin);
      yPosition += 15;
    }
  }

  // Overall Assessment
  if (reportData.aiReport?.overallAssessment) {
    checkNewPage(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Assessment', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(reportData.aiReport.overallAssessment, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 15;
  }

  // Critical Flags
  if (reportData.aiReport?.criticalFlags && reportData.aiReport.criticalFlags.length > 0) {
    checkNewPage(40);
    doc.setFillColor(255, 0, 0);
    doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠ CRITICAL FLAGS', margin, yPosition + 5);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    reportData.aiReport.criticalFlags.forEach((flag) => {
      yPosition = addWrappedText(`• ${flag}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 3;
    });
    
    doc.setTextColor(0, 0, 0);
    yPosition += 15;
  }

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 10);
    doc.text(`Generated by MediReport AI - ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
  }

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `MediReport_${reportData.patientId}_${getTestDisplayName(reportData.testType).replace(/\s+/g, '_')}_${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
};