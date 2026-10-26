/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Info,
  Camera,
  RefreshCw
} from 'lucide-react';
import { PageId } from '../components/Navbar.js';
import { DentalFinding, ImageQualityMetrics, ScreeningResult, XRayType } from '../types/dental.js';
import { ImageQualityCard } from '../components/ImageQualityCard.js';
import { DentalImageViewer } from '../components/DentalImageViewer.js';
import { ToothChart } from '../components/ToothChart.js';

interface XRayAnalyzerPageProps {
  onNavigate: (page: PageId) => void;
  onScreeningCompleted: (result: ScreeningResult) => void;
}

export const XRayAnalyzerPage: React.FC<XRayAnalyzerPageProps> = ({
  onNavigate,
  onScreeningCompleted
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [subType, setSubType] = useState<XRayType>('bitewing');
  const [patientRef, setPatientRef] = useState<string>(`PT-${Math.floor(1000 + Math.random() * 9000)}`);

  const [isQualityChecking, setIsQualityChecking] = useState<boolean>(false);
  const [qualityResult, setQualityResult] = useState<ImageQualityMetrics | null>(null);
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [screeningResult, setScreeningResult] = useState<ScreeningResult | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [selectedToothFDI, setSelectedToothFDI] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeRequestIdRef = useRef<number>(0);

  const clearAnalysisState = () => {
    activeRequestIdRef.current += 1;
    setScreeningResult(null);
    setQualityResult(null);
    setSelectedFindingId(null);
    setSelectedToothFDI(null);
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      clearAnalysisState();
      setSelectedFile(file);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImagePreview(dataUrl);
        runQualityPreCheck(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const runQualityPreCheck = async (base64Url: string) => {
    const reqId = activeRequestIdRef.current;
    setIsQualityChecking(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/quality/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Url,
          modality: 'xray'
        })
      });
      const data: ImageQualityMetrics = await res.json();
      if (reqId === activeRequestIdRef.current) {
        setQualityResult(data);
      }
    } catch (err: any) {
      if (reqId === activeRequestIdRef.current) {
        console.warn('X-Ray quality pre-check error:', err);
      }
    } finally {
      if (reqId === activeRequestIdRef.current) {
        setIsQualityChecking(false);
      }
    }
  };

  const handleSelectSample = async (url: string, name: string) => {
    clearAnalysisState();
    setImagePreview(url);
    setFileName(name);
    setSelectedFile(null);

    try {
      setIsQualityChecking(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        runQualityPreCheck(b64);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      setIsQualityChecking(false);
    }
  };

  const handleExecuteScreening = async (bypassQuality: boolean = false) => {
    if (!imagePreview) return;
    const reqId = ++activeRequestIdRef.current;
    setIsScreening(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/screen/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          fileName: fileName || 'xray_scan.png',
          subType,
          patientReferenceId: patientRef,
          bypassQualityCheck: bypassQuality ? 'true' : 'false'
        })
      });

      const data = await res.json();

      if (reqId !== activeRequestIdRef.current) return;

      if (!res.ok) {
        if (data.quality) setQualityResult(data.quality);
        throw new Error(data.message || data.error || 'Failed to complete X-ray screening');
      }

      setScreeningResult(data);
      setQualityResult(data.quality);
      onScreeningCompleted(data);
    } catch (err: any) {
      if (reqId === activeRequestIdRef.current) {
        setErrorMessage(err.message || 'Error occurred during X-ray pipeline inference.');
      }
    } finally {
      if (reqId === activeRequestIdRef.current) {
        setIsScreening(false);
      }
    }
  };

  const displayedFindings = screeningResult?.findings.filter(f => {
    if (!selectedToothFDI) return true;
    return f.toothNumberFDI === selectedToothFDI;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            <span>Pipeline 2</span>
            <span>·</span>
            <span>Radiographic Computer Vision</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dental X-Ray Radiographic Analyzer</h1>
          <p className="text-xs text-slate-500">
            Dedicated neural pipeline for bitewing, periapical, and panoramic transmission radiographs (DENTEX Benchmark).
          </p>
        </div>

        {screeningResult && (
          <button
            onClick={() => {
              onScreeningCompleted(screeningResult);
              onNavigate('report');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Radiographic Report</span>
          </button>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Controls */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">1. Radiographic Scan Input</h2>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-slate-600 rounded-lg p-6 text-center cursor-pointer transition-colors bg-slate-950/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-slate-800">
                Click to upload dental X-ray scan
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Bitewing, Periapical, or Panoramic (PNG/JPG)
              </div>
            </div>

            {/* X-Ray Projection SubType */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Radiographic Projection Modality:
              </label>
              <select
                value={subType}
                onChange={(e) => setSubType(e.target.value as XRayType)}
                className="w-full text-xs bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-600"
              >
                <option value="bitewing">Bitewing Radiograph (Interproximal Crown & Crest)</option>
                <option value="periapical">Periapical Radiograph (Full Root & Apex)</option>
                <option value="panoramic">Panoramic Orthopantomogram (Full Arch)</option>
              </select>
            </div>

            {/* Quick Sample Selector */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block mb-2">Pre-calibrated test cases:</span>
              <button
                type="button"
                onClick={() => {
                  setImagePreview('/sample-images/xray_bitewing_sample.svg');
                  setFileName('xray_bitewing_sample.svg');
                  setSelectedFile(null);
                  setScreeningResult(null);
                }}
                className="w-full p-2 border border-slate-200 rounded text-left text-xs hover:border-slate-700 transition-colors bg-slate-50"
              >
                <div className="font-medium text-slate-900">Right Posterior Bitewing Scan</div>
                <div className="text-[10px] text-slate-500">Tooth 16 interproximal caries & Tooth 46 restoration</div>
              </button>
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleExecuteScreening(false)}
                disabled={isScreening || isQualityChecking}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
              >
                {isScreening ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Radiographic Density...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run X-Ray Pipeline Screening</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quality Card */}
          {qualityResult && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-900">Stage 1: Radiographic Quality Gate</div>
              <ImageQualityCard
                quality={qualityResult}
                onProceedAnyway={() => handleExecuteScreening(true)}
                onRetake={() => fileInputRef.current?.click()}
              />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Pipeline Error: </span>
                {errorMessage}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 cols): X-Ray Viewer & Findings */}
        <div className="lg:col-span-7 space-y-6">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Radiographic Inspection Viewer
                </div>
                {screeningResult && (
                  <span className="text-xs text-slate-500 font-mono">
                    Model: {screeningResult.modelName} (v{screeningResult.modelVersion})
                  </span>
                )}
              </div>

              <DentalImageViewer
                imageUrl={imagePreview}
                findings={screeningResult ? screeningResult.findings : []}
                teethAnnotations={screeningResult ? screeningResult.teethAnnotations : []}
                selectedFindingId={selectedFindingId}
                onSelectFinding={setSelectedFindingId}
                modality="xray"
              />

              {screeningResult && (
                <ToothChart
                  findings={screeningResult.findings}
                  teethAnnotations={screeningResult.teethAnnotations}
                  selectedToothFDI={selectedToothFDI}
                  onSelectTooth={setSelectedToothFDI}
                />
              )}
            </div>
          ) : (
            <div className="bg-slate-100 rounded-xl border border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Layers className="w-10 h-10 mb-2 text-slate-300" />
              <span>Upload a dental radiograph to initialize radiographic analysis</span>
            </div>
          )}

          {/* Findings Inspection */}
          {screeningResult && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              {screeningResult.modelStatus === 'weights_needed' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Authentic Model Notice: </span>
                    {screeningResult.summary.overallRecommendation}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Radiographic Findings ({displayedFindings.length})
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{selectedToothFDI ? `Filtered for tooth #${selectedToothFDI}` : 'Interproximal radiolucencies & restorations'}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-slate-400" title={screeningResult.imageHash}>
                      SHA-256: {screeningResult.imageHash.substring(0, 12)}...
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  ECE: {screeningResult.uncertaintyMetrics.expectedCalibrationError}
                </div>
              </div>

              {displayedFindings.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-600 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                  <div className="font-semibold text-slate-800">
                    {selectedToothFDI ? `No radiographic findings recorded for tooth #${selectedToothFDI}` : 'No Radiographic Abnormalities Detected'}
                  </div>
                  <div className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    No detectable interproximal radiolucencies, periapical halos, or significant alveolar crest bone resorption observed in this projection.
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedFindings.map((finding) => {
                    const isSelected = selectedFindingId === finding.id;
                    return (
                      <div
                        key={finding.id}
                        onClick={() => setSelectedFindingId(isSelected ? null : finding.id)}
                        className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              finding.severity === 'high' ? 'bg-rose-500' :
                              finding.severity === 'moderate' ? 'bg-amber-500' : 'bg-teal-500'
                            }`} />
                            <span className="font-semibold text-slate-900 text-xs">
                              {finding.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 text-[11px]">
                              FDI #{finding.toothNumberFDI}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono font-medium text-slate-900 text-[11px]">
                              {Math.round(finding.calibratedConfidence * 100)}% (±{finding.uncertaintyMargin})
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-600 mt-1.5 leading-relaxed">
                          {finding.description}
                        </p>

                        <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded border border-amber-200/60">
                          <span className="font-medium">Radiographic Limitation: </span>
                          {finding.clinicalLimitation}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
