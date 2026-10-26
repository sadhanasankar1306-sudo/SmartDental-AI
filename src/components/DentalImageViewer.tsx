/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Eye, 
  EyeOff, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Info, 
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { DentalFinding, ToothAnnotation } from '../types/dental.js';

interface DentalImageViewerProps {
  imageUrl: string;
  findings: DentalFinding[];
  teethAnnotations: ToothAnnotation[];
  selectedFindingId?: string | null;
  onSelectFinding?: (id: string | null) => void;
  modality: 'photograph' | 'xray';
}

export const DentalImageViewer: React.FC<DentalImageViewerProps> = ({
  imageUrl,
  findings,
  teethAnnotations,
  selectedFindingId,
  onSelectFinding,
  modality
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [showTeethTags, setShowTeethTags] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [hoveredFinding, setHoveredFinding] = useState<DentalFinding | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  // Filter findings based on activeCategoryFilter
  const filteredFindings = findings.filter(f => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'caries') return f.category === 'cavity_suspected' || f.category === 'restoration_margin_defect';
    if (activeCategoryFilter === 'hygiene') return f.category === 'plaque' || f.category === 'calculus' || f.category === 'discoloration';
    if (activeCategoryFilter === 'gingiva') return f.category === 'gum_redness' || f.category === 'gum_swelling' || f.category === 'gum_recession';
    return true;
  });

  const getFindingColor = (severity: string, isSelected: boolean) => {
    if (isSelected) return 'border-cyan-400 bg-cyan-400/20 text-cyan-300 ring-2 ring-cyan-400';
    switch (severity) {
      case 'high':
        return 'border-rose-500 bg-rose-500/15 text-rose-300';
      case 'moderate':
        return 'border-amber-500 bg-amber-500/15 text-amber-300';
      case 'inconclusive':
        return 'border-purple-400 bg-purple-400/15 text-purple-300';
      default:
        return 'border-teal-400 bg-teal-400/15 text-teal-300';
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-md">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
        {/* Left: View mode toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              showOverlays 
                ? 'bg-teal-900/60 text-teal-200 border border-teal-700/60' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Findings Overlay</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTeethTags(!showTeethTags)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              showTeethTags 
                ? 'bg-blue-900/60 text-blue-200 border border-blue-700/60' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>FDI Tooth Grid</span>
          </button>
        </div>

        {/* Middle: Category Filter Segmented */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-0.5 rounded border border-slate-800">
          {[
            { id: 'all', label: 'All Findings' },
            { id: 'caries', label: 'Caries / Defects' },
            { id: 'hygiene', label: 'Plaque / Calculus' },
            { id: 'gingiva', label: 'Gingiva / Gums' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryFilter(tab.id)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                activeCategoryFilter === tab.id
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right: Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.75}
            title="Zoom out"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1 text-slate-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            title="Zoom in"
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset zoom"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-[450px] sm:h-[520px] bg-black overflow-auto flex items-center justify-center p-4 select-none cursor-crosshair"
      >
        <div 
          className="relative inline-block transition-transform duration-150 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Main Dental Image */}
          <img
            src={imageUrl}
            alt="Dental Screening Subject"
            className="max-h-[460px] max-w-full object-contain rounded block"
            draggable={false}
          />

          {/* Overlays Layer */}
          {showOverlays && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Tooth Localization Overlays */}
              {showTeethTags && teethAnnotations.map((t, idx) => (
                <div
                  key={`tooth-${idx}`}
                  className="absolute border border-dashed border-sky-400/50 rounded pointer-events-auto transition-all"
                  style={{
                    left: `${t.box.x}%`,
                    top: `${t.box.y}%`,
                    width: `${t.box.width}%`,
                    height: `${t.box.height}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 px-1 py-0.2 bg-sky-950/80 text-sky-200 border border-sky-600/50 rounded text-[10px] font-mono tracking-tighter whitespace-nowrap shadow-xs">
                    FDI #{t.fdiNumber}
                  </span>
                </div>
              ))}

              {/* Detected Findings Bounding Boxes */}
              {filteredFindings.map((finding) => {
                if (!finding.boundingBox) return null;
                const isSelected = selectedFindingId === finding.id;
                const isHovered = hoveredFinding?.id === finding.id;
                const colorClasses = getFindingColor(finding.severity, isSelected || isHovered);

                return (
                  <div
                    key={finding.id}
                    onClick={() => onSelectFinding?.(isSelected ? null : finding.id)}
                    onMouseEnter={() => setHoveredFinding(finding)}
                    onMouseLeave={() => setHoveredFinding(null)}
                    className={`absolute rounded border-2 cursor-pointer pointer-events-auto transition-all ${colorClasses}`}
                    style={{
                      left: `${finding.boundingBox.x}%`,
                      top: `${finding.boundingBox.y}%`,
                      width: `${finding.boundingBox.width}%`,
                      height: `${finding.boundingBox.height}%`,
                    }}
                  >
                    {/* Badge tag on finding */}
                    <div className="absolute -top-5 left-0 flex items-center gap-1 px-1.5 py-0.5 bg-slate-950/90 rounded border border-slate-700 text-[10px] whitespace-nowrap shadow-sm">
                      <span className="font-medium text-slate-200">
                        {finding.toothNumberFDI ? `#${finding.toothNumberFDI}` : 'Region'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-teal-300 font-mono">
                        {Math.round(finding.calibratedConfidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hover / Active Detail Tooltip Card overlay on bottom left */}
        {(hoveredFinding || selectedFindingId) && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-950/95 border border-slate-700/80 p-3 rounded-lg text-xs text-slate-200 shadow-xl backdrop-blur-sm pointer-events-auto">
            {(() => {
              const active = hoveredFinding || findings.find(f => f.id === selectedFindingId);
              if (!active) return null;
              return (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        active.severity === 'high' ? 'bg-rose-500' :
                        active.severity === 'moderate' ? 'bg-amber-500' : 'bg-teal-400'
                      }`} />
                      {active.label}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      P(calibrated) = {active.calibratedConfidence} ± {active.uncertaintyMargin}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {active.description}
                  </div>
                  <div className="text-[11px] text-amber-300/90 bg-amber-950/40 p-1.5 rounded border border-amber-800/40">
                    <span className="font-medium">Limitation:</span> {active.clinicalLimitation}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend & Findings Summary Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span>
            <span>High Risk / Caries</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
            <span>Calculus / Moderate</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-400 inline-block"></span>
            <span>Staining / Mild</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded border border-dashed border-sky-400 inline-block"></span>
            <span>FDI Tooth Grid</span>
          </span>
        </div>

        <div className="text-slate-400 font-mono">
          Showing {filteredFindings.length} of {findings.length} findings
        </div>
      </div>
    </div>
  );
};
