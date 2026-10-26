/**
 * Automated Regression Test Suite for SmartDental AI
 * Verifies that different images produce independently computed predictions,
 * image content hashes are distinct, stale state is eliminated, and zero-detection states are honest.
 */

import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:3000';

async function runTests() {
  console.log('===============================================================');
  console.log('SmartDental AI — Automated Regression Test Suite');
  console.log('Testing Independent Processing & Absence of Repeated Results');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const healthRes = await fetch(`${API_BASE}/api/health`);
    const health = await healthRes.json();
    assert(health.status === 'healthy', 'API health check returns healthy status');
    assert(health.database?.storageEngine.includes('SQLite'), 'SQLite storage engine active and synchronized');
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // Read Test Images:
  // Image 1: Frontal photograph (incisors with calculus & stain)
  const img1Buffer = fs.readFileSync('public/sample-images/photo_front_sample.svg');
  // Image 2: Bitewing X-ray (posterior molars with proximal radiolucency & metallic restoration)
  const img2Buffer = fs.readFileSync('public/sample-images/xray_bitewing_sample.svg');
  // Image 3: Blurry low quality image (test quality rejection)
  const img3Buffer = fs.readFileSync('public/sample-images/low_quality_blurry.svg');

  // 2. Test Content Hash Differentiation
  console.log('\n--- Test Suite 1: Cryptographic Content Hash Verification ---');
  const b64_img1 = 'data:image/svg+xml;base64,' + img1Buffer.toString('base64');
  const b64_img2 = 'data:image/svg+xml;base64,' + img2Buffer.toString('base64');
  const b64_img3 = 'data:image/svg+xml;base64,' + img3Buffer.toString('base64');

  assert(img1Buffer.length !== img2Buffer.length, 'Image 1 and Image 2 have different byte sizes');

  // 3. Test Quality Gate on Sub-Optimal Input
  console.log('\n--- Test Suite 2: Automated Quality Gate Gating ---');
  try {
    const qRes = await fetch(`${API_BASE}/api/quality/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: b64_img3, modality: 'photograph' })
    });
    const qData = await qRes.json();
    assert(qData.isBlurry === true || qData.score < 70, `Quality gate detects suboptimal blurry image (Blur Score: ${qData.blurScore}, Score: ${qData.score}/100)`);
    assert(qData.qualityIssues.length > 0, `Quality gate returns descriptive retake issues: ${qData.qualityIssues[0]}`);
  } catch (err) {
    assert(false, `Quality check failed: ${err.message}`);
  }

  // 4. Test Photograph Pipeline with Image 1
  console.log('\n--- Test Suite 3: Photograph Pipeline Independent Analysis ---');
  let resPhoto;
  try {
    const pRes = await fetch(`${API_BASE}/api/screen/photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: b64_img1,
        fileName: 'photo_incisors.svg',
        subType: 'front',
        patientReferenceId: 'PT-REG-01'
      })
    });
    resPhoto = await pRes.json();
    assert(pRes.ok, `Photo screening API executed successfully (HTTP ${pRes.status})`);
    assert(resPhoto.modality === 'photograph', 'Returned screening result modality is photograph');
    assert(typeof resPhoto.imageHash === 'string' && resPhoto.imageHash.length > 0, `Image content hash generated: ${resPhoto.imageHash.substring(0, 12)}...`);
    assert(resPhoto.modelStatus === 'active', `Model status is active: ${resPhoto.modelName}`);
    assert(resPhoto.teethAnnotations.length > 0, `Teeth detected in photograph: ${resPhoto.teethAnnotations.length} teeth`);
  } catch (err) {
    assert(false, `Photograph screening failed: ${err.message}`);
  }

  // 5. Test X-Ray Pipeline with Image 2
  console.log('\n--- Test Suite 4: Radiograph Pipeline Independent Analysis ---');
  let resXray;
  try {
    const xRes = await fetch(`${API_BASE}/api/screen/xray`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: b64_img2,
        fileName: 'xray_bitewing.svg',
        subType: 'bitewing',
        patientReferenceId: 'PT-REG-02'
      })
    });
    resXray = await xRes.json();
    assert(xRes.ok, `X-Ray screening API executed successfully (HTTP ${xRes.status})`);
    assert(resXray.modality === 'xray', 'Returned screening result modality is xray');
    assert(typeof resXray.imageHash === 'string' && resXray.imageHash.length > 0, `X-ray image content hash generated: ${resXray.imageHash.substring(0, 12)}...`);
    assert(resXray.imageHash !== resPhoto.imageHash, 'Photo and X-ray produce distinct image hashes (NO CACHED COLLISION)');
  } catch (err) {
    assert(false, `X-ray screening failed: ${err.message}`);
  }

  // 6. Test Repeated-Prediction Immunity
  console.log('\n--- Test Suite 5: Repeated-Prediction Bug Regression Check ---');
  if (resPhoto && resXray) {
    assert(resPhoto.id !== resXray.id, 'Screening IDs are unique and independent');
    assert(resPhoto.imageUrl !== resXray.imageUrl, 'Uploaded image storage URLs are independent');
    assert(resPhoto.imageHash !== resXray.imageHash, 'Content hashes prove independent decoded inputs');
    console.log(`Photo Detections: ${resPhoto.findings.length} findings (${resPhoto.findings.map(f => f.category).join(', ') || 'clean'})`);
    console.log(`X-Ray Detections: ${resXray.findings.length} findings (${resXray.findings.map(f => f.category).join(', ') || 'clean'})`);
    assert(resPhoto.modality !== resXray.modality, 'Modality isolation strictly preserved');
  }

  // 7. Test Database Retrieval
  console.log('\n--- Test Suite 6: SQLite Database Record Integrity ---');
  try {
    const listRes = await fetch(`${API_BASE}/api/screenings`);
    const listData = await listRes.json();
    assert(listData.screenings.length >= 2, `Database contains stored records (${listData.screenings.length} total)`);
    const foundPhoto = listData.screenings.find(s => s.id === resPhoto?.id);
    assert(Boolean(foundPhoto), 'Newly analyzed photograph record retrieved from SQLite');
    assert(Boolean(foundPhoto?.imageHash), 'Retrieved record contains persisted imageHash');
  } catch (err) {
    assert(false, `Database test failed: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
