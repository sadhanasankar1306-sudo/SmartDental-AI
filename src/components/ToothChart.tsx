/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DentalFinding, ToothAnnotation } from '../types/dental.js';

interface ToothChartProps {
  findings: DentalFinding[];
  teethAnnotations: ToothAnnotation[];
  selectedToothFDI?: string | null;
  onSelectTooth?: (fdi: string | null) => void;
}

export const ToothChart: React.FC<ToothChartProps> = ({
  findings,
  teethAnnotations,
  selectedToothFDI,
  onSelectTooth
}) => {
  // FDI numbering quadrants
  const upperRight = ['18', '17', '16', '15', '14', '13', '12', '11'];
  const upperLeft = ['21', '22', '23', '24', '25', '26', '27', '28'];
  const lowerRight = ['48', '47', '46', '45', '44', '43', '42', '41'];
  const lowerLeft = ['31', '32', '33', '34', '35', '36', '37', '38'];

  // Map findings by FDI number
  const findingsMap = new Map<string, DentalFinding[]>();
  findings.forEach(f => {
    if (f.toothNumberFDI && f.toothNumberFDI !== 'Unknown') {
      const list = findingsMap.get(f.toothNumberFDI) || [];
      list.push(f);
      findingsMap.set(f.toothNumberFDI, list);
    }
  });

  // Map annotated teeth
  const visibleTeethSet = new Set(teethAnnotations.map(t => t.fdiNumber));

  const renderToothButton = (fdi: string) => {
    const toothFindings = findingsMap.get(fdi) || [];
    const isVisible = visibleTeethSet.has(fdi);
    const isSelected = selectedToothFDI === fdi;

    const hasHighSeverity = toothFindings.some(f => f.severity === 'high');
    const hasModSeverity = toothFindings.some(f => f.severity === 'moderate');
    const hasLowSeverity = toothFindings.length > 0;

    let bgClass = 'bg-slate-100 text-slate-400 border-slate-200';
    let dotClass = '';

    if (isVisible) {
      if (hasHighSeverity) {
        bgClass = 'bg-rose-50 text-rose-900 border-rose-300 font-semibold';
        dotClass = 'bg-rose-600';
      } else if (hasModSeverity) {
        bgClass = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
        dotClass = 'bg-amber-600';
      } else if (hasLowSeverity) {
        bgClass = 'bg-teal-50 text-teal-900 border-teal-300 font-semibold';
        dotClass = 'bg-teal-600';
      } else {
        bgClass = 'bg-emerald-50/60 text-emerald-800 border-emerald-200';
      }
    }

    if (isSelected) {
      bgClass += ' ring-2 ring-teal-600 border-teal-600';
    }

    return (
      <button
        key={fdi}
        type="button"
        onClick={() => onSelectTooth?.(isSelected ? null : fdi)}
        title={`Tooth FDI #${fdi} ${isVisible ? (toothFindings.length ? `(${toothFindings.length} findings)` : '(Visible Healthy)') : '(Not in current image)'}`}
        className={`relative w-8 h-10 sm:w-9 sm:h-11 rounded border flex flex-col items-center justify-center text-[10px] font-mono transition-all ${bgClass} hover:opacity-90`}
      >
        <span className="font-bold">{fdi}</span>
        {dotClass && (
          <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotClass}`} />
        )}
        {!isVisible && (
          <span className="text-[8px] text-slate-400">off</span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Adult Odontogram (FDI Two-Digit Notation)
          </div>
          <div className="text-[11px] text-slate-500">
            Interactive tooth-level mapping. Click any tooth to filter localized findings.
          </div>
        </div>

        {selectedToothFDI && (
          <button
            type="button"
            onClick={() => onSelectTooth?.(null)}
            className="text-xs text-teal-700 hover:text-teal-900 font-medium"
          >
            Clear Filter (#{selectedToothFDI})
          </button>
        )}
      </div>

      <div className="space-y-3 overflow-x-auto pb-1">
        {/* Maxillary / Upper Arch */}
        <div>
          <div className="text-[10px] font-medium text-slate-400 mb-1 flex justify-between px-1">
            <span>Upper Right (Quadrant 1)</span>
            <span>Maxillary Arch</span>
            <span>Upper Left (Quadrant 2)</span>
          </div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <div className="flex gap-1">
              {upperRight.map(renderToothButton)}
            </div>
            <div className="w-px h-10 bg-slate-300 mx-1"></div>
            <div className="flex gap-1">
              {upperLeft.map(renderToothButton)}
            </div>
          </div>
        </div>

        {/* Mandibular / Lower Arch */}
        <div>
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            <div className="flex gap-1">
              {lowerRight.map(renderToothButton)}
            </div>
            <div className="w-px h-10 bg-slate-300 mx-1"></div>
            <div className="flex gap-1">
              {lowerLeft.map(renderToothButton)}
            </div>
          </div>
          <div className="text-[10px] font-medium text-slate-400 mt-1 flex justify-between px-1">
            <span>Lower Right (Quadrant 4)</span>
            <span>Mandibular Arch</span>
            <span>Lower Left (Quadrant 3)</span>
          </div>
        </div>
      </div>

      {/* Odontogram Status Indicator */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>High Risk / Caries</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Calculus / Redness</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Stain / Mild</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Healthy Visible</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span>Not in view</span>
          </span>
        </div>
      </div>
    </div>
  );
};
