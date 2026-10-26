/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Camera, 
  Layers, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  BarChart3, 
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { PageId } from '../components/Navbar.js';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onSelectSampleImage?: (url: string, modality: 'photograph' | 'xray', subType: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectSampleImage }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            <span>Dental Computer Vision & Screening Intelligence</span>
            <span>·</span>
            <span>Research Edition</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            AI-Powered Dental Screening & Tooth-Level Analysis System
          </h1>

          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            SmartDental AI provides pre-diagnostic screening assistance for intraoral photographs and dental radiographs. 
            Featuring automated image-quality gating, temperature-calibrated uncertainty estimation, and modality-specific computer vision pipelines.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('photo')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Screen Dental Photograph</span>
            </button>

            <button
              onClick={() => onNavigate('xray')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Screen Dental X-Ray</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              <Activity className="w-4 h-4 text-slate-500" />
              <span>Open Dashboard</span>
            </button>
          </div>

          {/* Clinical Limitation Banner */}
          <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Ethical & Clinical Boundary: </span>
              SmartDental AI is an experimental pre-screening tool. Ordinary photographs cannot reveal hidden root canal infections, bone level loss, or interproximal cavitation beneath contact points. Never consider this system a definitive diagnosis.
            </div>
          </div>
        </div>
      </section>

      {/* Two Modality Pipelines */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Modality-Specific AI Architecture</h2>
            <p className="text-xs text-slate-500">Separated neural pipelines prevent cross-modality diagnostic contamination</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pipeline 1: Photograph */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-teal-300 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Intraoral Photograph Pipeline</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Engineered for buccal, lingual, occlusal, and close-up photographic views of teeth and gingiva.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-700">Supported Visible Findings:</div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Visible plaque deposits
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Calculus / tartar
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Extrinsic enamel stains
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Suspected dark lesions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Chipped / fractured enamel
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Gingival redness / erythema
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Gingival recession
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                    Tooth alignment irregularities
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Trained on Tufts & MouthCare</span>
              <button
                onClick={() => onNavigate('photo')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                <span>Launch Photo Analyzer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Pipeline 2: Dental X-Ray */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between hover:border-slate-400 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Dental Radiograph (X-Ray) Pipeline</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Engineered specifically for transmission radiographs: bitewing, periapical, and panoramic scans.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <div className="text-xs font-semibold text-slate-700">Supported Radiographic Findings:</div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Tooth enumeration (FDI)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Interproximal caries
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Periapical radiolucency
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Alveolar crest bone height
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Restoration margins & overhangs
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                    Pulp chamber morphology
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Trained on DENTEX 2023 Challenge</span>
              <button
                onClick={() => onNavigate('xray')}
                className="text-xs font-semibold text-slate-900 hover:text-slate-700 inline-flex items-center gap-1"
              >
                <span>Launch X-Ray Analyzer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Technical Workflow */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Quality-Aware Screening Workflow</h2>
        <p className="text-xs text-slate-500 mb-6">Rigorous four-stage pipeline ensuring high clinical reliability</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-mono font-semibold text-teal-700 mb-1">STAGE 1</div>
            <div className="font-semibold text-slate-900 text-sm mb-1">Image Quality Gate</div>
            <div className="text-xs text-slate-500">
              Evaluates Laplacian blur variance, exposure balance, pixel resolution, and checks modality alignment before neural inference.
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-mono font-semibold text-teal-700 mb-1">STAGE 2</div>
            <div className="font-semibold text-slate-900 text-sm mb-1">Modality Routing</div>
            <div className="text-xs text-slate-500">
              Guarantees photograph models never run on radiographs and radiographic models never process clinical photography.
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-mono font-semibold text-teal-700 mb-1">STAGE 3</div>
            <div className="font-semibold text-slate-900 text-sm mb-1">Temperature Calibration</div>
            <div className="text-xs text-slate-500">
              Raw neural network logits are calibrated using validation-derived temperature scaling ($T=1.28$) to eliminate overconfidence.
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-mono font-semibold text-teal-700 mb-1">STAGE 4</div>
            <div className="font-semibold text-slate-900 text-sm mb-1">Triage Report & PDF</div>
            <div className="text-xs text-slate-500">
              Produces an audit-ready screening document with FDI tooth mapping, uncertainty bounds, and dentist referral guidance.
            </div>
          </div>
        </div>
      </section>

      {/* Quick Test Samples */}
      <section className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Instant Clinical Test Samples</h3>
            <p className="text-xs text-slate-500">Pre-calibrated test cases to explore system capabilities immediately</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => {
              onNavigate('photo');
            }}
            className="p-3 border border-slate-200 rounded-lg hover:border-teal-600 cursor-pointer transition-colors group"
          >
            <div className="aspect-video bg-slate-100 rounded overflow-hidden mb-2 relative">
              <img src="/sample-images/photo_front_sample.svg" alt="Frontal View" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">Photo</span>
            </div>
            <div className="font-semibold text-xs text-slate-900 group-hover:text-teal-700">Frontal Intraoral View</div>
            <div className="text-[11px] text-slate-500">Visible calculus on lower incisors & extrinsic stain.</div>
          </div>

          <div 
            onClick={() => {
              onNavigate('xray');
            }}
            className="p-3 border border-slate-200 rounded-lg hover:border-teal-600 cursor-pointer transition-colors group"
          >
            <div className="aspect-video bg-slate-950 rounded overflow-hidden mb-2 relative">
              <img src="/sample-images/xray_bitewing_sample.svg" alt="Bitewing Radiograph" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">X-Ray</span>
            </div>
            <div className="font-semibold text-xs text-slate-900 group-hover:text-teal-700">Posterior Bitewing X-Ray</div>
            <div className="text-[11px] text-slate-500">Interproximal caries radiolucency & metallic restoration.</div>
          </div>

          <div 
            onClick={() => {
              onNavigate('photo');
            }}
            className="p-3 border border-slate-200 rounded-lg hover:border-amber-600 cursor-pointer transition-colors group"
          >
            <div className="aspect-video bg-slate-900 rounded overflow-hidden mb-2 relative">
              <img src="/sample-images/low_quality_blurry.svg" alt="Blurry Test" className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-amber-900/80 text-amber-200 text-[10px] rounded font-mono">Quality Test</span>
            </div>
            <div className="font-semibold text-xs text-slate-900 group-hover:text-amber-700">Sub-Optimal Camera Test</div>
            <div className="text-[11px] text-slate-500">Triggers image quality gate rejection and retake instructions.</div>
          </div>
        </div>
      </section>
    </div>
  );
};
