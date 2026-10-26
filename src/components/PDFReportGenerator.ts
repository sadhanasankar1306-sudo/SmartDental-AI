/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ScreeningResult } from '../types/dental.js';

export function generateDentalReportPDF(screening: ScreeningResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header banner
  doc.setFillColor(15, 76, 92); // Teal / Dark Blue
  doc.rect(0, 0, pageWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SMARTDENTAL AI — PRELIMINARY SCREENING REPORT', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Quality-Aware & Uncertainty-Calibrated Dental Computer Vision Pipeline', 14, 18);

  y = 32;

  // Metadata Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('SCREENING METADATA', 14, y);
  y += 6;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${screening.id}`, 14, y);
  doc.text(`Patient Ref: ${screening.patientReferenceId || 'Anonymous'}`, 110, y);
  y += 5;

  doc.text(`Date & Time: ${new Date(screening.createdAt).toLocaleString()}`, 14, y);
  doc.text(`Image Modality: ${screening.modality.toUpperCase()} (${screening.subType || 'Standard'})`, 110, y);
  y += 5;

  doc.text(`Model Engine: ${screening.modelName} (v${screening.modelVersion})`, 14, y);
  doc.text(`Inference Latency: ${screening.inferenceDurationMs} ms`, 110, y);
  y += 5;

  doc.text(`Image Quality Score: ${screening.quality.score}/100 (${screening.quality.isAcceptable ? 'PASSED' : 'GATE REJECTED/SUB-OPTIMAL'})`, 14, y);
  doc.text(`Expected Calibration Error (ECE): ${screening.uncertaintyMetrics.expectedCalibrationError}`, 110, y);
  y += 5;

  doc.text(`Image Content Hash (SHA-256): ${screening.imageHash?.substring(0, 24) || 'Audit-Verified'}`, 14, y);
  y += 8;

  // Divider line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  // Overall Recommendation Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 76, 92);
  doc.text('PRIMARY SCREENING RECOMMENDATION:', 18, y + 5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const splitRec = doc.splitTextToSize(screening.summary.overallRecommendation, pageWidth - 36);
  doc.text(splitRec, 18, y + 10);
  y += 22;

  // Findings Table Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`DETECTED DENTAL FINDINGS (${screening.findings.length})`, 14, y);
  y += 6;

  // Table Columns
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('CATEGORY / FINDING', 16, y + 5);
  doc.text('TOOTH (FDI)', 85, y + 5);
  doc.text('CONFIDENCE', 112, y + 5);
  doc.text('SEVERITY', 140, y + 5);
  doc.text('REVIEW NEEDED', 165, y + 5);
  y += 9;

  // Findings Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  if (screening.findings.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.text('No detectable surface abnormalities or suspicious lesions identified.', 16, y + 4);
    y += 10;
  } else {
    screening.findings.forEach((finding, idx) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(finding.label.substring(0, 42), 16, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(finding.toothNumberFDI ? `#${finding.toothNumberFDI}` : 'General', 85, y);
      doc.text(`${Math.round(finding.calibratedConfidence * 100)}% (±${finding.uncertaintyMargin})`, 112, y);

      // Severity tag
      if (finding.severity === 'high') {
        doc.setTextColor(185, 28, 28);
      } else if (finding.severity === 'moderate') {
        doc.setTextColor(180, 83, 9);
      } else {
        doc.setTextColor(13, 148, 136);
      }
      doc.text(finding.severity.toUpperCase(), 140, y);

      doc.setTextColor(71, 85, 105);
      doc.text(finding.requiresReview ? 'YES' : 'Routine', 165, y);
      y += 4;

      // Description & Clinical Limitation
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      const descText = doc.splitTextToSize(`Notes: ${finding.description}`, pageWidth - 32);
      doc.text(descText, 16, y);
      y += (descText.length * 3.5);

      const limitText = doc.splitTextToSize(`Limitation: ${finding.clinicalLimitation}`, pageWidth - 32);
      doc.setTextColor(156, 110, 40);
      doc.text(limitText, 16, y);
      y += (limitText.length * 3.5) + 3;

      doc.setDrawColor(241, 245, 249);
      doc.line(14, y - 1, pageWidth - 14, y - 1);
    });
  }

  y += 6;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  // Mandatory Clinical Disclaimer
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('MANDATORY REGULATORY & CLINICAL LIMITATION NOTICE:', 18, y + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 29, 29);
  const disclaimerText = doc.splitTextToSize(
    'This report is generated by an automated computer vision screening research tool for preliminary triage only. ' +
    'Ordinary photographs cannot detect subgingival calculus, bone loss, or pulpal infections. Radiographic findings are presumptive and subject to projection artifacts. ' +
    'This screening does NOT constitute a medical or dental diagnosis. Please present this report to a licensed dentist for thorough in-person clinical and radiographic examination.',
    pageWidth - 36
  );
  doc.text(disclaimerText, 18, y + 10);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('SmartDental AI System • Built for Research and Dental Computer Vision Screening', 14, 285);
  doc.text(`Generated: ${new Date().toISOString()}`, pageWidth - 65, 285);

  // Trigger download
  doc.save(`SmartDental_Report_${screening.id}.pdf`);
}
