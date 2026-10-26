/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Camera, 
  Sun, 
  Eye, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { ImageQualityMetrics } from '../types/dental.js';

interface ImageQualityCardProps {
  quality: ImageQualityMetrics;
  onProceedAnyway?: () => void;
  onRetake?: () => void;
  compact?: boolean;
}

export const ImageQualityCard: React.FC<ImageQualityCardProps> = ({
  quality,
  onProceedAnyway,
  onRetake,
  compact = false
}) => {
  const isPassed = quality.isAcceptable;

  return (
    <div className={`rounded-lg border ${
      isPassed ? 'border-slate-200 bg-white' : 'border-amber-200 bg-amber-50/40'
    } p-4 text-slate-800`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {isPassed ? (
            <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {isPassed ? 'Quality Gate Passed' : 'Image Quality Warning / Gate Rejection'}
            </div>
            <div className="text-xs text-slate-500">
              Composite Quality Score: <span className="font-mono font-medium text-slate-900">{quality.score}/100</span>
              {' · '}
              Modality: <span className="capitalize font-medium text-slate-900">{quality.detectedModality}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            isPassed ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {isPassed ? 'Diagnostic Grade' : 'Sub-Optimal'}
          </span>
        </div>
      </div>

      {/* Grid of 4 technical checks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-xs">
        {/* 1. Sharpness / Blur */}
        <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-slate-400" />
              Focus & Sharpness
            </span>
            <span className={quality.isBlurry ? 'text-amber-600 font-medium' : 'text-teal-700'}>
              {quality.isBlurry ? 'Soft / Blurry' : 'Sharp'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-700">
            {quality.blurScore} <span className="text-[10px] text-slate-400">Var(Δ²)</span>
          </div>
        </div>

        {/* 2. Exposure & Glare */}
        <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-slate-400" />
              Exposure
            </span>
            <span className={quality.exposure !== 'normal' ? 'text-amber-600 font-medium' : 'text-teal-700'}>
              {quality.exposure === 'normal' ? 'Balanced' : quality.exposure}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-700">
            {quality.brightnessScore} <span className="text-[10px] text-slate-400">/255 Lum</span>
          </div>
        </div>

        {/* 3. Resolution */}
        <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-400" />
              Resolution
            </span>
            <span className={quality.isLowResolution ? 'text-amber-600 font-medium' : 'text-teal-700'}>
              {quality.isLowResolution ? 'Low' : 'Adequate'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-700">
            {quality.resolution.width} × {quality.resolution.height}
          </div>
        </div>

        {/* 4. Modality Alignment */}
        <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" />
              Modality Match
            </span>
            <span className={!quality.modalityMatch ? 'text-rose-600 font-medium' : 'text-teal-700'}>
              {quality.modalityMatch ? 'Matched' : 'Mismatch'}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-700">
            {quality.expectedModality}
          </div>
        </div>
      </div>

      {/* Quality Issues & Retake Suggestions */}
      {quality.qualityIssues.length > 0 && (
        <div className="mt-2 text-xs space-y-1.5 bg-amber-50/80 p-3 rounded border border-amber-200 text-amber-950">
          <div className="font-medium text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            Clinical Image Limitations Detected:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-900 pl-1">
            {quality.qualityIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>

          {quality.retakeSuggestions.length > 0 && (
            <div className="pt-1.5 border-t border-amber-200/80 mt-1.5">
              <span className="font-medium text-amber-900">Recommended Retake Protocol:</span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1 mt-0.5">
                {quality.retakeSuggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          {!compact && onProceedAnyway && !isPassed && (
            <div className="pt-2 flex items-center justify-end gap-2 mt-2">
              {onRetake && (
                <button
                  type="button"
                  onClick={onRetake}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-xs font-medium"
                >
                  Upload New Image
                </button>
              )}
              <button
                type="button"
                onClick={onProceedAnyway}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-medium inline-flex items-center gap-1"
              >
                <span>Proceed with Uncertainty Disclaimer</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
