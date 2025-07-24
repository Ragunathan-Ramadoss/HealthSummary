import jsPDF from 'jspdf';

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

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MediReport AI', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Medical Test Analysis Report', margin, 35);

  yPosition = 60;

  // Report Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = `Understanding your ${getTestDisplayName(reportData.testType)} Test Results`;
  yPosition = addWrappedText(title, margin, yPosition, pageWidth - 2 * margin, 16);
  yPosition += 10;

  // Patient Information
  checkNewPage(40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patient ID: ${reportData.patientId}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Test Type: ${getTestDisplayName(reportData.testType)}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Test Date: ${new Date(reportData.createdAt).toLocaleDateString()}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Executive Summary
  if (reportData.aiReport?.summary) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(reportData.aiReport.summary, margin, yPosition, pageWidth - 2 * margin);
    yPosition += 15;
  }

  // Test Parameters and Results
  checkNewPage(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Parameters & Results', margin, yPosition);
  yPosition += 15;

  // Table headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const colWidth = (pageWidth - 2 * margin) / 4;
  doc.text('Parameter', margin, yPosition);
  doc.text('Result', margin + colWidth, yPosition);
  doc.text('Reference Range', margin + 2 * colWidth, yPosition);
  doc.text('Status', margin + 3 * colWidth, yPosition);
  yPosition += 5;

  // Draw line under headers
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Table data
  doc.setFont('helvetica', 'normal');
  Object.entries(reportData.parameters).forEach(([param, value]) => {
    checkNewPage(15);
    
    const finding = reportData.aiReport?.keyFindings?.find((f: any) => 
      f.parameter.toLowerCase().includes(param.toLowerCase())
    );
    
    doc.text(param, margin, yPosition);
    doc.text(String(value), margin + colWidth, yPosition);
    doc.text(finding?.referenceRange || 'N/A', margin + 2 * colWidth, yPosition);
    doc.text(finding?.status || 'Normal', margin + 3 * colWidth, yPosition);
    yPosition += 12;
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

  // Treatment Considerations
  if (reportData.aiReport?.treatmentOptions) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Treatment Considerations', margin, yPosition);
    yPosition += 15;

    // Lifestyle Modifications
    if (reportData.aiReport.treatmentOptions.lifestyle?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Lifestyle Modifications:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      reportData.aiReport.treatmentOptions.lifestyle.forEach((item) => {
        checkNewPage(15);
        yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 3;
      });
      yPosition += 10;
    }

    // Medical Interventions
    if (reportData.aiReport.treatmentOptions.medical?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical Interventions:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      reportData.aiReport.treatmentOptions.medical.forEach((item) => {
        checkNewPage(15);
        yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 3;
      });
      yPosition += 10;
    }

    // Medications
    if (reportData.aiReport.treatmentOptions.medications?.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Common Medications:', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      reportData.aiReport.treatmentOptions.medications.forEach((item) => {
        checkNewPage(15);
        yPosition = addWrappedText(`• ${item}`, margin, yPosition, pageWidth - 2 * margin);
        yPosition += 3;
      });
      yPosition += 10;
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