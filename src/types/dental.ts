/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModalityType = 'photograph' | 'xray';
export type XRayType = 'bitewing' | 'periapical' | 'panoramic';
export type PhotoViewType = 'front' | 'upper_arch' | 'lower_arch' | 'left_buccal' | 'right_buccal' | 'close_up';

export type FindingSeverity = 'low' | 'moderate' | 'high' | 'inconclusive';

export interface BoundingBox {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage 0 - 100
  height: number; // percentage 0 - 100
}

export interface DentalFinding {
  id: string;
  category: 
    | 'plaque' 
    | 'calculus' 
    | 'discoloration' 
    | 'cavity_suspected' 
    | 'fracture_chip' 
    | 'gum_redness' 
    | 'gum_swelling' 
    | 'gum_recession' 
    | 'tooth_wear' 
    | 'alignment_irregularity'
    | 'periapical_radiolucency'
    | 'bone_loss_suspected'
    | 'restoration_margin_defect';
  label: string;
  toothNumberFDI?: string; // e.g., '11', '21', '36', '46' or 'Unknown'
  toothNumberUniversal?: number; // 1 - 32
  toothRegion?: 'crown' | 'cervical' | 'interproximal' | 'occlusal' | 'gingival_margin' | 'root_apex';
  confidence: number; // 0 - 1
  calibratedConfidence: number; // Temperature-calibrated
  uncertaintyMargin: number; // e.g., ± 0.08
  severity: FindingSeverity;
  boundingBox?: BoundingBox;
  description: string;
  clinicalLimitation: string;
  requiresReview: boolean;
}

export interface ImageQualityMetrics {
  isAcceptable: boolean;
  score: number; // 0 - 100
  blurScore: number; // Variance of Laplacian (higher is sharper)
  isBlurry: boolean;
  resolution: {
    width: number;
    height: number;
  };
  isLowResolution: boolean;
  exposure: 'normal' | 'underexposed' | 'overexposed';
  brightnessScore: number; // 0 - 255
  teethDetected: boolean;
  modalityMatch: boolean;
  detectedModality: ModalityType;
  expectedModality: ModalityType;
  qualityIssues: string[];
  retakeSuggestions: string[];
}

export interface ToothAnnotation {
  fdiNumber: string;
  universalNumber: number;
  label: string;
  box: BoundingBox;
  status: 'healthy_visible' | 'finding_detected' | 'uncertain' | 'restored';
  findingsCount: number;
}

export interface ScreeningResult {
  id: string;
  createdAt: string;
  modality: ModalityType;
  subType?: PhotoViewType | XRayType;
  imageFileName: string;
  imageUrl: string;
  imageHash: string;
  patientReferenceId?: string;
  modelName: string;
  modelVersion: string;
  modelStatus?: 'active' | 'weights_needed' | 'offline';
  inferenceDurationMs: number;
  quality: ImageQualityMetrics;
  findings: DentalFinding[];
  teethAnnotations: ToothAnnotation[];
  summary: {
    totalTeethVisible: number;
    findingsCount: number;
    highestRisk: FindingSeverity;
    overallRecommendation: string;
    urgentReviewNeeded: boolean;
  };
  uncertaintyMetrics: {
    meanConfidence: number;
    meanCalibratedConfidence: number;
    calibrationMethod: 'temperature_scaling';
    expectedCalibrationError: number;
    inconclusiveCount: number;
  };
  notes?: string;
}

export interface SystemModelStatus {
  id: string;
  name: string;
  modality: ModalityType;
  version: string;
  status: 'active' | 'configured' | 'weights_needed' | 'offline';
  description: string;
  weightsFile?: string;
  datasetTrainedOn?: string;
  supportedClasses: string[];
  inputResolution: string;
}

export interface EvaluationMetricRecord {
  modelName: string;
  task: string;
  dataset: string;
  testSamples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auroc: number;
  meanIoU?: number;
  expectedCalibrationError: number;
  inferenceLatencyMs: number;
}
