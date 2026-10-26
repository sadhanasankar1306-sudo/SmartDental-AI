/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Download, 
  Printer, 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  User, 
  Cpu, 
  Clock,
  Layers,
  Camera,
  Activity
} from 'lucide-react';
import { PageId } from '../components/Navbar.js';
import { ScreeningResult } from '../types/dental.js';
import { generateDentalReportPDF } from '../components/PDFReportGenerator.js';
import { DentalImageViewer } from '../components/DentalImageViewer.js';
import { ToothChart } from '../components/ToothChart.js';

interface ReportPageProps {
  screening: ScreeningResult | null;
  onNavigate: (page: PageId) => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ screening, onNavigate }) => {
  if (!screening) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Active Screening Report Selected</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run a screening via the Photograph Analyzer or X-Ray Analyzer, or select an existing record from the Screening History.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('photo')}
            className="px-4 py-2 bg-teal-700 text-white rounded-md text-xs font-semibold hover:bg-teal-800 transition-colors"
          >
            Go to Photo Screening
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Open Screening History
          </button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateDentalReportPDF(screening);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('history')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Back to History"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-500">Screening Dossier</div>
            <h1 className="text-xl font-bold text-slate-900 font-mono">{screening.id}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-md hover:bg-teal-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Screening Report Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">SMARTDENTAL AI</span>
              <span className="text-xs font-mono text-teal-800 font-semibold px-2 py-0.5 bg-teal-50 rounded">
                PRELIMINARY TRIAGE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quality-Aware and Uncertainty-Calibrated Computer Vision Screening
            </p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div>
              <span className="text-slate-400">Report Ref: </span>
              <span className="font-mono font-medium text-slate-900">{screening.id}</span>
            </div>
            <div>
              <span className="text-slate-400">Date & Time: </span>
              <span className="font-medium text-slate-900">{new Date(screening.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400">Patient Ref: </span>
              <span className="font-medium text-slate-900">{screening.patientReferenceId || 'Anonymous'}</span>
            </div>
          </div>
        </div>

        {/* Screening Context Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Imaging Modality</span>
            <span className="font-semibold text-slate-900 capitalize flex items-center gap-1.5">
              {screening.modality === 'photograph' ? <Camera className="w-3.5 h-3.5 text-teal-700" /> : <Layers className="w-3.5 h-3.5 text-slate-700" />}
              {screening.modality} ({screening.subType || 'standard'})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Model Engine</span>
            <span className="font-semibold text-slate-900 block truncate" title={screening.modelName}>
              {screening.modelName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Image Quality Gate</span>
            <span className={`font-semibold ${screening.quality.isAcceptable ? 'text-teal-800' : 'text-amber-800'}`}>
              Score {screening.quality.score}/100 ({screening.quality.isAcceptable ? 'PASSED' : 'REJECTED/OVERRIDDEN'})
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Inference Latency</span>
            <span className="font-mono text-slate-900">
              {screening.inferenceDurationMs} ms
            </span>
          </div>
        </div>

        {/* Audit Hash & Integrity Strip */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 rounded text-[11px] text-slate-600 font-mono">
          <span>Image Integrity SHA-256: {screening.imageHash || 'Verified'}</span>
          <span>Status: {screening.modelStatus?.toUpperCase() || 'EVALUATED'}</span>
        </div>

        {/* Primary Recommendation Card */}
        <div className={`p-4 rounded-lg border ${
          screening.summary.urgentReviewNeeded 
            ? 'bg-rose-50/60 border-rose-200 text-rose-950' 
            : 'bg-teal-50/60 border-teal-200 text-teal-950'
        }`}>
          <div className="flex items-start gap-3">
            {screening.summary.urgentReviewNeeded ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider">
                Clinical Screening Recommendation:
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {screening.summary.overallRecommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Inspection Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Annotated Clinical Evidence & Overlays
          </h2>

          <DentalImageViewer
            imageUrl={screening.imageUrl}
            findings={screening.findings}
            teethAnnotations={screening.teethAnnotations}
            modality={screening.modality}
          />

          <ToothChart
            findings={screening.findings}
            teethAnnotations={screening.teethAnnotations}
          />
        </div>

        {/* Detailed Findings Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Identified Findings Table ({screening.findings.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Temperature Calibrated (ECE: {screening.uncertaintyMetrics.expectedCalibrationError})
            </span>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Category / Feature</th>
                  <th className="py-2.5 px-3">FDI Tooth</th>
                  <th className="py-2.5 px-3">Calibrated Confidence</th>
                  <th className="py-2.5 px-3">Clinical Severity</th>
                  <th className="py-2.5 px-3">Review Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {screening.findings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No detectable surface abnormalities identified in this image.
                    </td>
                  </tr>
                ) : (
                  screening.findings.map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{f.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{f.description}</div>
                        <div className="text-[10px] text-amber-800 mt-0.5">
                          <span className="font-medium">Limitation: </span>{f.clinicalLimitation}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {f.toothNumberFDI ? `#${f.toothNumberFDI}` : 'General'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {Math.round(f.calibratedConfidence * 100)}% (±{f.uncertaintyMargin})
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          f.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                          f.severity === 'moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {f.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {f.requiresReview ? 'YES' : 'Routine'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quality Diagnostics Record */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
          <div className="font-semibold text-slate-900">Pre-Inference Quality Assessment Record</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
            <div>Blur Score: <span className="font-mono text-slate-900">{screening.quality.blurScore}</span></div>
            <div>Exposure: <span className="capitalize font-mono text-slate-900">{screening.quality.exposure}</span></div>
            <div>Resolution: <span className="font-mono text-slate-900">{screening.quality.resolution.width}x{screening.quality.resolution.height}</span></div>
            <div>Modality Match: <span className="font-mono text-slate-900">{screening.quality.modalityMatch ? 'Verified' : 'Flagged'}</span></div>
          </div>
        </div>

        {/* Mandatory Regulatory & Clinical Disclaimer */}
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-950">
            <ShieldCheck className="w-4 h-4 text-rose-700" />
            MANDATORY CLINICAL & ETHICAL LIMITATION STATEMENT
          </div>
          <p className="leading-relaxed text-[11px] text-rose-900">
            This screening report is generated by an automated artificial intelligence system for preliminary triage assistance. 
            Ordinary photographs cannot detect subgingival calculus, bone loss, or root canal infections. 
            Radiographic findings are presumptive and require clinical tactile examination by a licensed dental practitioner. 
            This document does not replace formal clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
