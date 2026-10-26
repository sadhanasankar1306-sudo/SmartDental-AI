/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  ArrowUpRight, 
  Camera, 
  Layers, 
  Calendar, 
  RefreshCw,
  Scale,
  CheckSquare,
  Square,
  AlertTriangle,
  X
} from 'lucide-react';
import { PageId } from '../components/Navbar.js';
import { ScreeningResult } from '../types/dental.js';

interface HistoryPageProps {
  onNavigate: (page: PageId) => void;
  onSelectScreening: (screening: ScreeningResult) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate, onSelectScreening }) => {
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/screenings');
      const data = await res.json();
      setScreenings(data.screenings || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete screening record ${id}?`)) return;

    try {
      const res = await fetch(`/api/screenings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScreenings(prev => prev.filter(s => s.id !== id));
        setCompareIds(prev => prev.filter(i => i !== id));
      }
    } catch (err) {
      alert('Failed to delete screening');
    }
  };

  const toggleCompareId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareIds.includes(id)) {
      setCompareIds(prev => prev.filter(i => i !== id));
    } else {
      if (compareIds.length >= 2) {
        setCompareIds([compareIds[1], id]);
      } else {
        setCompareIds(prev => [...prev, id]);
      }
    }
  };

  // Filter records
  const filteredRecords = screenings.filter(s => {
    const matchesSearch = 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.patientReferenceId && s.patientReferenceId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.findings.some(f => f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModality = modalityFilter === 'all' || s.modality === modalityFilter;
    const matchesSeverity = severityFilter === 'all' || s.summary.highestRisk === severityFilter;

    return matchesSearch && matchesModality && matchesSeverity;
  });

  const compareScreeningA = screenings.find(s => s.id === compareIds[0]);
  const compareScreeningB = screenings.find(s => s.id === compareIds[1]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Screening Records Dossier</h1>
          <p className="text-xs text-slate-500">
            Persistent database history stored locally in SQLite with privacy anonymization controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          {compareIds.length === 2 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Selected (2)</span>
            </button>
          )}

          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-2 border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, patient, or finding..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Modality Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Modality:</span>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Modalities</option>
              <option value="photograph">Photograph Only</option>
              <option value="xray">X-Ray Only</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Risk:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Instruction Note */}
      <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
        <span>Click the checkbox on any two records to perform a side-by-side progression comparison.</span>
        <span>Showing {filteredRecords.length} records</span>
      </div>

      {/* Screenings Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No matching screening records located in SQLite store.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((s) => {
              const isCompareSelected = compareIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectScreening(s);
                    onNavigate('report');
                  }}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${
                    isCompareSelected ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Checkbox for comparison */}
                    <button
                      type="button"
                      onClick={(e) => toggleCompareId(s.id, e)}
                      className="text-slate-400 hover:text-teal-700"
                      title="Select for comparison"
                    >
                      {isCompareSelected ? (
                        <CheckSquare className="w-4 h-4 text-teal-700" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Image Thumbnail */}
                    <div className="w-14 h-14 bg-slate-950 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img src={s.imageUrl} alt={s.id} className="w-full h-full object-cover" />
                    </div>

                    {/* Meta info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 font-mono">{s.id}</span>
                        <span className="text-[11px] font-mono capitalize px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                          {s.modality}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">{s.patientReferenceId}</span>
                      </div>

                      <div className="text-xs text-slate-700 mt-1 line-clamp-1 font-medium">
                        {s.findings.length > 0 
                          ? s.findings.map(f => f.label).join('; ')
                          : 'No abnormal surface findings identified'}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{new Date(s.createdAt).toLocaleString()}</span>
                        <span>·</span>
                        <span>Quality: {s.quality.score}/100</span>
                        <span>·</span>
                        <span>ECE: {s.uncertaintyMetrics.expectedCalibrationError}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${
                      s.summary.highestRisk === 'high' 
                        ? 'bg-rose-50 text-rose-800 border-rose-200' 
                        : s.summary.highestRisk === 'moderate' 
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}>
                      {s.summary.highestRisk.toUpperCase()}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(s.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-800"
                      title="Open report"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Side-by-Side Technical Comparison Modal */}
      {showComparisonModal && compareScreeningA && compareScreeningB && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Side-by-Side Screening Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Technical progression comparison between two examination points
                </p>
              </div>

              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Record A */}
              <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-mono font-bold text-slate-900">{compareScreeningA.id}</div>
                <div className="aspect-video bg-slate-950 rounded overflow-hidden">
                  <img src={compareScreeningA.imageUrl} alt="Scan A" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1">
                  <div>Date: <span className="font-medium text-slate-800">{new Date(compareScreeningA.createdAt).toLocaleDateString()}</span></div>
                  <div>Modality: <span className="capitalize font-medium text-slate-800">{compareScreeningA.modality}</span></div>
                  <div>Image Hash: <span className="font-mono text-slate-600">{compareScreeningA.imageHash?.substring(0, 12) || 'N/A'}...</span></div>
                  <div>Quality Score: <span className="font-mono font-medium text-slate-800">{compareScreeningA.quality.score}/100</span></div>
                  <div>Findings Count: <span className="font-mono font-medium text-slate-800">{compareScreeningA.findings.length}</span></div>
                  <div>Highest Risk: <span className="font-semibold text-slate-900">{compareScreeningA.summary.highestRisk.toUpperCase()}</span></div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold block mb-1">Findings:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {compareScreeningA.findings.map(f => (
                      <li key={f.id}>{f.label} ({f.toothNumberFDI ? `#${f.toothNumberFDI}` : 'Region'})</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Record B */}
              <div className="space-y-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-mono font-bold text-slate-900">{compareScreeningB.id}</div>
                <div className="aspect-video bg-slate-950 rounded overflow-hidden">
                  <img src={compareScreeningB.imageUrl} alt="Scan B" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1">
                  <div>Date: <span className="font-medium text-slate-800">{new Date(compareScreeningB.createdAt).toLocaleDateString()}</span></div>
                  <div>Modality: <span className="capitalize font-medium text-slate-800">{compareScreeningB.modality}</span></div>
                  <div>Image Hash: <span className="font-mono text-slate-600">{compareScreeningB.imageHash?.substring(0, 12) || 'N/A'}...</span></div>
                  <div>Quality Score: <span className="font-mono font-medium text-slate-800">{compareScreeningB.quality.score}/100</span></div>
                  <div>Findings Count: <span className="font-mono font-medium text-slate-800">{compareScreeningB.findings.length}</span></div>
                  <div>Highest Risk: <span className="font-semibold text-slate-900">{compareScreeningB.summary.highestRisk.toUpperCase()}</span></div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold block mb-1">Findings:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {compareScreeningB.findings.map(f => (
                      <li key={f.id}>{f.label} ({f.toothNumberFDI ? `#${f.toothNumberFDI}` : 'Region'})</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900">
              <span className="font-semibold">Progression Guidance: </span>
              Side-by-side assessment allows dentists to observe changes in enamel radiolucency depth or gingival recession progression over time.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
