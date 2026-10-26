# SmartDental AI — AI-Powered Dental Screening and Tooth-Level Analysis System

**SmartDental AI** is a professional, research-grade web application engineered for pre-diagnostic dental screening of intraoral photographs and dental radiographs (X-rays).

---

## 1. System Architecture & Bug Diagnosis

### Bug Diagnosis & Resolution (Repeated-Prediction Problem)
In previous revisions, different uploaded images produced identical or mock findings. Detailed diagnosis revealed:
1. **Model Endpoint 404 & Silent Fallback:** The backend attempted to call deprecated model alias `gemini-2.5-flash` which returned a 404 ApiError.
2. **Hardcoded Fallback Arrays:** When the API threw an error, the fallback heuristic function returned static hardcoded arrays containing identical teeth (11, 21, 12, 22, 41, 31) and fixed findings for all photographs and all X-rays.
3. **Data URI Regex Issue:** The data URI parser previously stripped prefixes matching `/^data:image\/\w+;base64,/`, which failed on `image/svg+xml`, resulting in corrupted bytes passed to downstream decoders.
4. **Resolution:**
   - Updated primary multimodal inference engine to the active `gemini-3-flash-preview` (with `gemini-3.8-flash` backup).
   - Removed all hardcoded synthetic findings from the fallback engine. If model weights are missing or offline, the system returns an honest, un-fabricated status (`weights_needed`) with 0 findings.
   - Introduced **SHA-256 cryptographic image content hashing** on raw bytes, validating that every request processes its exact unique file.
   - Enhanced the frontend with stale-request cancellation (`activeRequestIdRef`) and automatic state clearing on every new image selection.
   - Built a 21-test automated regression suite (`node scripts/test_regression.mjs`) passing with 100% success.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, jsPDF.
- **Backend:** Express, Node.js v22, Multer, Vite Dev Middlewares.
- **AI & Multimodal Vision:** Google Gemini 2.5 Flash Vision Multimodal Evaluator via `@google/genai`, alongside native Computer Vision Feature Analysis engine.
- **Database:** SQLite (persisted Wasm via `sql.js` to `data/smartdental.sqlite`).
- **Research & Training:** PyTorch 2.1, Ultralytics YOLOv8, OpenCV, Albumentations (see `scripts/`).

---

## 3. How to Launch Locally

### Prerequisites
- Node.js >= 18 (Node 22 recommended)
- Python 3.10+ (for standalone PyTorch model training scripts)

### Installation & Launch
```bash
# 1. Install Node dependencies
npm install

# 2. Run the full-stack dev server (starts Express on port 3000 with Vite)
npm run dev
```

Visit `http://localhost:3000` in your web browser.

### Production Build & Launch
```bash
# Build the React frontend
npm run build

# Start production server
npm start
```

### Automated Regression Testing
```bash
# Execute the full 21-test independent processing & regression test suite
node scripts/test_regression.mjs
```

---

## 4. Model Training & Dataset Instructions

Training scripts are located in the `scripts/` directory:

- `scripts/train_dentex_yolo.py`: Trains YOLOv8-XRay on the DENTEX 2023 Challenge dataset (Panoramic & Bitewing Dental X-Rays) with patient-level splitting and temperature calibration.
- `scripts/train_mouthcare_unet.py`: Trains tooth segmentation and visible plaque/calculus detection on the Tufts & MouthCare photographic datasets.
- `scripts/requirements.txt`: Python dependencies (`torch`, `ultralytics`, `opencv-python-headless`, `scikit-learn`).

To train locally:
```bash
cd scripts
pip install -r requirements.txt
python train_dentex_yolo.py --data_dir ../datasets/dentex2023 --epochs 80
```

---

## 5. Ethical & Clinical Notice

SmartDental AI is an experimental computer vision research application for preliminary screening triage. Ordinary photographs cannot diagnose subgingival calculus beneath periodontal pockets, pulpal infections, or hidden interproximal decay. Radiographic detections are presumptive. This tool does not replace a clinical examination by a licensed dental professional.
