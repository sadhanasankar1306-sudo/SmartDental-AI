/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { ScreeningResult, SystemModelStatus } from '../src/types/dental.js';

const DATA_DIR = path.resolve('data');
const DB_FILE = path.join(DATA_DIR, 'smartdental.sqlite');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
      // Run migrations for any newly introduced columns
      try { dbInstance.run('ALTER TABLE screenings ADD COLUMN image_hash TEXT;'); } catch (e) {}
      try { dbInstance.run('ALTER TABLE screenings ADD COLUMN model_status TEXT;'); } catch (e) {}
      console.log('[DB] Loaded existing SQLite database from disk with migrations.');
      return dbInstance;
    } catch (e) {
      console.warn('[DB] Failed to load existing SQLite database, creating new one.', e);
    }
  }

  dbInstance = new SQL.Database();
  initSchema(dbInstance);
  seedInitialData(dbInstance);
  saveDbToDisk();
  console.log('[DB] Initialized new SQLite database with schema and initial records.');
  return dbInstance;
}

export function saveDbToDisk() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('[DB] Error persisting SQLite database to disk:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS screenings (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      modality TEXT NOT NULL,
      sub_type TEXT,
      image_file_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      image_hash TEXT,
      patient_reference_id TEXT,
      model_name TEXT NOT NULL,
      model_version TEXT NOT NULL,
      model_status TEXT,
      inference_duration_ms INTEGER NOT NULL,
      quality_json TEXT NOT NULL,
      findings_json TEXT NOT NULL,
      teeth_annotations_json TEXT NOT NULL,
      summary_json TEXT NOT NULL,
      uncertainty_json TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS models (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      modality TEXT NOT NULL,
      version TEXT NOT NULL,
      status TEXT NOT NULL,
      description TEXT NOT NULL,
      weights_file TEXT,
      dataset_trained_on TEXT,
      supported_classes TEXT NOT NULL,
      input_resolution TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedInitialData(db: Database) {
  // Seed models status
  const models: SystemModelStatus[] = [
    {
      id: 'gemini-vision-screener',
      name: 'Gemini 2.5 Flash Vision Dental Multimodal Evaluator',
      modality: 'photograph',
      version: '2.5.0-flash',
      status: 'active',
      description: 'Active multimodal vision screening engine evaluating clinical oral features, tooth numbering, and visible pathology.',
      supportedClasses: ['plaque', 'calculus', 'discoloration', 'cavity_suspected', 'fracture_chip', 'gum_redness', 'gum_swelling', 'gum_recession', 'tooth_wear', 'alignment_irregularity'],
      inputResolution: 'Variable (up to 1536x1536)'
    },
    {
      id: 'yolo8-dental-photo',
      name: 'YOLOv8-DentalPhoto (Intraoral Object & Segment Detector)',
      modality: 'photograph',
      version: '1.2.0',
      status: 'configured',
      description: 'Fine-tuned on MouthCare intraoral photograph dataset. Detects buccal and lingual plaque, calculus, and gingival inflammation.',
      weightsFile: 'models/yolov8_dental_photo.pt',
      datasetTrainedOn: 'MouthCare & Tufts Intraoral Photographic Dataset',
      supportedClasses: ['plaque', 'calculus', 'staining', 'caries', 'gingivitis'],
      inputResolution: '640x640'
    },
    {
      id: 'dentex-panoramic-xray',
      name: 'DENTEX-YOLOv8-XRay (Panoramic & Bitewing Radiographic Pipeline)',
      modality: 'xray',
      version: '2.1.0',
      status: 'active',
      description: 'Fine-tuned on DENTEX 2023 challenge dataset for tooth numbering, interproximal caries, and periapical lesion detection.',
      weightsFile: 'models/dentex_panoramic_yolov8.pt',
      datasetTrainedOn: 'DENTEX 2023 Panoramic Dental X-Ray Dataset',
      supportedClasses: ['tooth_fdi', 'interproximal_caries', 'periapical_radiolucency', 'bone_loss', 'restoration_margin_defect'],
      inputResolution: '1024x1024'
    }
  ];

  for (const m of models) {
    db.run(
      `INSERT OR REPLACE INTO models (id, name, modality, version, status, description, weights_file, dataset_trained_on, supported_classes, input_resolution)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id,
        m.name,
        m.modality,
        m.version,
        m.status,
        m.description,
        m.weightsFile || null,
        m.datasetTrainedOn || null,
        JSON.stringify(m.supportedClasses),
        m.inputResolution
      ]
    );
  }

  // Seed default settings
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, ['confidence_threshold', '0.65']);
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, ['image_retention_days', '30']);
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, ['privacy_anonymize', 'true']);
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, ['calibration_temperature', '1.28']);

  // Seed sample screenings
  const sample1: ScreeningResult = {
    id: 'SCR-20261026-8812',
    createdAt: '2026-10-26T09:14:22Z',
    modality: 'photograph',
    subType: 'front',
    imageFileName: 'frontal_smile_assessment_01.jpg',
    imageUrl: '/sample-images/photo_front_sample.svg',
    imageHash: 'a7b8c9d0e1f23456',
    patientReferenceId: 'PT-9041',
    modelName: 'Gemini Vision Screener (gemini-3-flash-preview)',
    modelVersion: '3.0-multimodal',
    modelStatus: 'active',
    inferenceDurationMs: 1240,
    quality: {
      isAcceptable: true,
      score: 92,
      blurScore: 480.2,
      isBlurry: false,
      resolution: { width: 1280, height: 960 },
      isLowResolution: false,
      exposure: 'normal',
      brightnessScore: 142,
      teethDetected: true,
      modalityMatch: true,
      detectedModality: 'photograph',
      expectedModality: 'photograph',
      qualityIssues: [],
      retakeSuggestions: []
    },
    findings: [
      {
        id: 'f-1',
        category: 'calculus',
        label: 'Visible calculus deposits at cervical margin',
        toothNumberFDI: '41',
        toothNumberUniversal: 25,
        toothRegion: 'gingival_margin',
        confidence: 0.88,
        calibratedConfidence: 0.84,
        uncertaintyMargin: 0.05,
        severity: 'moderate',
        boundingBox: { x: 44, y: 58, width: 6, height: 7 },
        description: 'Hardened supra-gingival calculus deposits visible along the cervical margin of the lower central incisor.',
        clinicalLimitation: 'Photographs cannot assess subgingival calculus beneath the periodontal pocket.',
        requiresReview: true
      },
      {
        id: 'f-2',
        category: 'gum_redness',
        label: 'Mild erythema at interdental papilla',
        toothNumberFDI: '31',
        toothNumberUniversal: 24,
        toothRegion: 'gingival_margin',
        confidence: 0.79,
        calibratedConfidence: 0.75,
        uncertaintyMargin: 0.07,
        severity: 'low',
        boundingBox: { x: 50, y: 60, width: 5, height: 6 },
        description: 'Localized marginal gingival redness indicative of mild early gingivitis.',
        clinicalLimitation: 'Photographs cannot measure bleeding on probing (BOP) or sulcus pocket depth.',
        requiresReview: false
      },
      {
        id: 'f-3',
        category: 'discoloration',
        label: 'Superficial enamel extrinsic staining',
        toothNumberFDI: '11',
        toothNumberUniversal: 8,
        toothRegion: 'crown',
        confidence: 0.91,
        calibratedConfidence: 0.88,
        uncertaintyMargin: 0.04,
        severity: 'low',
        boundingBox: { x: 45, y: 35, width: 8, height: 12 },
        description: 'Light tan extrinsic dietary discoloration on the labial surface of the upper right central incisor.',
        clinicalLimitation: 'Cannot differentiate between dietary extrinsic stain and developmental enamel hypoplasia.',
        requiresReview: false
      }
    ],
    teethAnnotations: [
      { fdiNumber: '11', universalNumber: 8, label: 'Upper Right Central Incisor', box: { x: 45, y: 32, width: 8, height: 16 }, status: 'finding_detected', findingsCount: 1 },
      { fdiNumber: '21', universalNumber: 9, label: 'Upper Left Central Incisor', box: { x: 53, y: 32, width: 8, height: 16 }, status: 'healthy_visible', findingsCount: 0 },
      { fdiNumber: '12', universalNumber: 7, label: 'Upper Right Lateral Incisor', box: { x: 37, y: 34, width: 7, height: 15 }, status: 'healthy_visible', findingsCount: 0 },
      { fdiNumber: '22', universalNumber: 10, label: 'Upper Left Lateral Incisor', box: { x: 61, y: 34, width: 7, height: 15 }, status: 'healthy_visible', findingsCount: 0 },
      { fdiNumber: '41', universalNumber: 25, label: 'Lower Right Central Incisor', box: { x: 44, y: 55, width: 6, height: 14 }, status: 'finding_detected', findingsCount: 1 },
      { fdiNumber: '31', universalNumber: 24, label: 'Lower Left Central Incisor', box: { x: 50, y: 55, width: 6, height: 14 }, status: 'finding_detected', findingsCount: 1 }
    ],
    summary: {
      totalTeethVisible: 8,
      findingsCount: 3,
      highestRisk: 'moderate',
      overallRecommendation: 'Professional dental hygiene cleaning (scaling) recommended to address supra-gingival calculus on lower incisors.',
      urgentReviewNeeded: false
    },
    uncertaintyMetrics: {
      meanConfidence: 0.86,
      meanCalibratedConfidence: 0.823,
      calibrationMethod: 'temperature_scaling',
      expectedCalibrationError: 0.038,
      inconclusiveCount: 0
    },
    notes: 'Standard frontal photograph. Good illumination, minimal motion artifact.'
  };

  const sample2: ScreeningResult = {
    id: 'SCR-20261025-4109',
    createdAt: '2026-10-25T14:38:10Z',
    modality: 'xray',
    subType: 'bitewing',
    imageFileName: 'right_posterior_bitewing_xray.png',
    imageUrl: '/sample-images/xray_bitewing_sample.svg',
    imageHash: 'f4e3d2c1b0a98765',
    patientReferenceId: 'PT-7382',
    modelName: 'Gemini Vision Screener (gemini-3-flash-preview)',
    modelVersion: '3.0-multimodal',
    modelStatus: 'active',
    inferenceDurationMs: 890,
    quality: {
      isAcceptable: true,
      score: 95,
      blurScore: 612.0,
      isBlurry: false,
      resolution: { width: 1400, height: 1050 },
      isLowResolution: false,
      exposure: 'normal',
      brightnessScore: 118,
      teethDetected: true,
      modalityMatch: true,
      detectedModality: 'xray',
      expectedModality: 'xray',
      qualityIssues: [],
      retakeSuggestions: []
    },
    findings: [
      {
        id: 'f-201',
        category: 'cavity_suspected',
        label: 'Suspected interproximal radiolucency in coronal enamel',
        toothNumberFDI: '16',
        toothNumberUniversal: 3,
        toothRegion: 'interproximal',
        confidence: 0.87,
        calibratedConfidence: 0.83,
        uncertaintyMargin: 0.06,
        severity: 'high',
        boundingBox: { x: 38, y: 44, width: 8, height: 10 },
        description: 'Triangular radiolucent shadow penetrating through the outer enamel layer into the dentino-enamel junction (DEJ) on the mesial surface.',
        clinicalLimitation: 'Radiographic radiolucency can be simulated by cervical burnout or overlapping tooth contacts. Requires clinical tactile probe examination.',
        requiresReview: true
      },
      {
        id: 'f-202',
        category: 'restoration_margin_defect',
        label: 'Existing amalgam restoration with intact coronal margin',
        toothNumberFDI: '46',
        toothNumberUniversal: 30,
        toothRegion: 'occlusal',
        confidence: 0.95,
        calibratedConfidence: 0.93,
        uncertaintyMargin: 0.03,
        severity: 'low',
        boundingBox: { x: 39, y: 64, width: 12, height: 12 },
        description: 'Radiopaque metallic restoration noted on lower right first molar with stable margins and no recurrent caries evident.',
        clinicalLimitation: 'X-rays cannot evaluate composite adhesive bonding integrity or micro-leakage.',
        requiresReview: false
      }
    ],
    teethAnnotations: [
      { fdiNumber: '17', universalNumber: 2, label: 'Upper Right Second Molar', box: { x: 20, y: 38, width: 14, height: 22 }, status: 'healthy_visible', findingsCount: 0 },
      { fdiNumber: '16', universalNumber: 3, label: 'Upper Right First Molar', box: { x: 36, y: 40, width: 14, height: 22 }, status: 'finding_detected', findingsCount: 1 },
      { fdiNumber: '15', universalNumber: 4, label: 'Upper Right Second Premolar', box: { x: 52, y: 42, width: 12, height: 20 }, status: 'healthy_visible', findingsCount: 0 },
      { fdiNumber: '47', universalNumber: 31, label: 'Lower Right Second Molar', box: { x: 22, y: 62, width: 15, height: 22 }, status: 'healthy_visible', findingsCount: 0 },
      { fdiNumber: '46', universalNumber: 30, label: 'Lower Right First Molar', box: { x: 38, y: 62, width: 15, height: 22 }, status: 'restored', findingsCount: 1 },
      { fdiNumber: '45', universalNumber: 29, label: 'Lower Right Second Premolar', box: { x: 54, y: 63, width: 13, height: 20 }, status: 'healthy_visible', findingsCount: 0 }
    ],
    summary: {
      totalTeethVisible: 6,
      findingsCount: 2,
      highestRisk: 'high',
      overallRecommendation: 'Clinical evaluation by a licensed dental professional is strongly advised for tooth 16 to confirm mesial proximal caries.',
      urgentReviewNeeded: true
    },
    uncertaintyMetrics: {
      meanConfidence: 0.91,
      meanCalibratedConfidence: 0.88,
      calibrationMethod: 'temperature_scaling',
      expectedCalibrationError: 0.031,
      inconclusiveCount: 0
    },
    notes: 'Proper bitewing angulation with clear interproximal contact separation between molars.'
  };

  insertScreening(db, sample1);
  insertScreening(db, sample2);
}

function insertScreening(db: Database, s: ScreeningResult) {
  db.run(
    `INSERT OR REPLACE INTO screenings (
      id, created_at, modality, sub_type, image_file_name, image_url, image_hash, patient_reference_id,
      model_name, model_version, model_status, inference_duration_ms, quality_json, findings_json,
      teeth_annotations_json, summary_json, uncertainty_json, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      s.id,
      s.createdAt,
      s.modality,
      s.subType || null,
      s.imageFileName,
      s.imageUrl,
      s.imageHash || null,
      s.patientReferenceId || null,
      s.modelName,
      s.modelVersion,
      s.modelStatus || 'active',
      s.inferenceDurationMs,
      JSON.stringify(s.quality),
      JSON.stringify(s.findings),
      JSON.stringify(s.teethAnnotations),
      JSON.stringify(s.summary),
      JSON.stringify(s.uncertaintyMetrics),
      s.notes || null
    ]
  );
}

export async function getAllScreenings(): Promise<ScreeningResult[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM screenings ORDER BY created_at DESC');
  const results: ScreeningResult[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, any>;
    results.push({
      id: row.id,
      createdAt: row.created_at,
      modality: row.modality,
      subType: row.sub_type,
      imageFileName: row.image_file_name,
      imageUrl: row.image_url,
      imageHash: row.image_hash || 'sha256-legacy',
      patientReferenceId: row.patient_reference_id,
      modelName: row.model_name,
      modelVersion: row.model_version,
      modelStatus: row.model_status || 'active',
      inferenceDurationMs: Number(row.inference_duration_ms),
      quality: JSON.parse(row.quality_json || '{}'),
      findings: JSON.parse(row.findings_json || '[]'),
      teethAnnotations: JSON.parse(row.teeth_annotations_json || '[]'),
      summary: JSON.parse(row.summary_json || '{}'),
      uncertaintyMetrics: JSON.parse(row.uncertainty_json || '{}'),
      notes: row.notes
    });
  }
  stmt.free();
  return results;
}

export async function getScreeningById(id: string): Promise<ScreeningResult | null> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM screenings WHERE id = ?');
  stmt.bind([id]);

  if (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, any>;
    stmt.free();
    return {
      id: row.id,
      createdAt: row.created_at,
      modality: row.modality,
      subType: row.sub_type,
      imageFileName: row.image_file_name,
      imageUrl: row.image_url,
      imageHash: row.image_hash || 'sha256-legacy',
      patientReferenceId: row.patient_reference_id,
      modelName: row.model_name,
      modelVersion: row.model_version,
      modelStatus: row.model_status || 'active',
      inferenceDurationMs: Number(row.inference_duration_ms),
      quality: JSON.parse(row.quality_json || '{}'),
      findings: JSON.parse(row.findings_json || '[]'),
      teethAnnotations: JSON.parse(row.teeth_annotations_json || '[]'),
      summary: JSON.parse(row.summary_json || '{}'),
      uncertaintyMetrics: JSON.parse(row.uncertainty_json || '{}'),
      notes: row.notes
    };
  }
  stmt.free();
  return null;
}

export async function saveScreening(screening: ScreeningResult): Promise<void> {
  const db = await getDb();
  insertScreening(db, screening);
  saveDbToDisk();
}

export async function deleteScreening(id: string): Promise<boolean> {
  const db = await getDb();
  db.run('DELETE FROM screenings WHERE id = ?', [id]);
  saveDbToDisk();
  return true;
}

export async function getModelsStatus(): Promise<SystemModelStatus[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT * FROM models');
  const models: SystemModelStatus[] = [];

  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, any>;
    models.push({
      id: row.id,
      name: row.name,
      modality: row.modality,
      version: row.version,
      status: row.status,
      description: row.description,
      weightsFile: row.weights_file,
      datasetTrainedOn: row.dataset_trained_on,
      supportedClasses: JSON.parse(row.supported_classes || '[]'),
      inputResolution: row.input_resolution
    });
  }
  stmt.free();
  return models;
}

export async function getDatabaseStats() {
  const db = await getDb();
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM screenings');
  countStmt.step();
  const totalScreenings = (countStmt.getAsObject() as any).count || 0;
  countStmt.free();

  const photoStmt = db.prepare("SELECT COUNT(*) as count FROM screenings WHERE modality = 'photograph'");
  photoStmt.step();
  const photoCount = (photoStmt.getAsObject() as any).count || 0;
  photoStmt.free();

  const xrayStmt = db.prepare("SELECT COUNT(*) as count FROM screenings WHERE modality = 'xray'");
  xrayStmt.step();
  const xrayCount = (xrayStmt.getAsObject() as any).count || 0;
  xrayStmt.free();

  return {
    totalScreenings,
    photoCount,
    xrayCount,
    storageEngine: 'SQLite (sql.js Wasm + disk persistence)',
    dbPath: DB_FILE
  };
}
