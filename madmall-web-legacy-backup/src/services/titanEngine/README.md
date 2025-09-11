# Authentic Image Integration — Zero-Cost, Standalone Microservice (TypeScript)

A production-grade, minimal-cost microservice that:
- Imports curated photos of **authentic Black women** (Unsplash free API)
- Optionally **generates** images via **Stable Diffusion Automatic1111** (local WebUI API)
- Enforces **manual cultural validation** (approve/reject UI)
- Serves **context-aware selection** via a clean API
- Stores metadata & feedback in **SQLite** (file-based, no cloud cost)

## 1) Prerequisites
- Node.js 18+
- (Optional) Stable Diffusion **Automatic1111** running locally (`SD_WEBUI_URL`)
- Unsplash API Access Key (free): https://unsplash.com/developers

## 2) Setup
```bash
git clone <this-zip-extracted-folder>
cd authentic-image-integration-microservice
cp .env.example .env
# edit .env: add UNSPLASH_ACCESS_KEY (required)
npm install
npm run dev
```

- Open **http://localhost:8080/admin** to review & approve images.

## 3) Import Curated Images (free)
```bash
# wellness theme (Black women wellness)
curl -X POST http://localhost:8080/api/images/import/unsplash   -H "Content-Type: application/json"   -d '{"query":"Black women wellness portrait","category":"wellness","count":10}'
```

## 4) (Optional) Generate AI Images (local, no cost)
Ensure Automatic1111 is running locally. Then:
```bash
curl -X POST http://localhost:8080/api/images/generate   -H "Content-Type: application/json"   -d '{"category":"community","count":2,"prompt":"Group of Black women supporting each other, dignified, community wellness"}'
```

## 5) Validate (Manual — approve/reject)
- Visit **http://localhost:8080/admin**
- Approve only **authentic, dignified, contextually relevant** images
- Reject with reasons (stored as feedback)

## 6) Select Images for Your App
```bash
curl "http://localhost:8080/api/images/select?context=wellness"
# → { id, category, url, altText, ... }
```
Embed `url` in your frontend `<img src="...">`

## 7) Feedback API (community loop)
```bash
curl -X POST http://localhost:8080/api/images/feedback   -H "Content-Type: application/json"   -d '{"imageId":1,"vote":1,"comment":"Strong, dignified"}'
```

## Design Choices (Clean Code, DI, Law of Demeter)
- **Modular providers**: `UnsplashProvider` and `Automatic1111Provider` are swappable.
- **Encapsulated boundary conditions**: selection & validation are centralized in `services/`.
- **No global state**: storage via SQLite; config via `.env`.
- **No placeholders**: all endpoints are real & runnable.

## Safeguards (Cultural Governance)
- Nothing is **auto-approved**.
- Every image **requires human validation**.
- Feedback stored for continuous improvement.

## Troubleshooting
- If `/api/images/generate` fails: ensure `SD_WEBUI_URL` is set and WebUI is running.
- If Unsplash import fails: check `UNSPLASH_ACCESS_KEY` & rate limits.
- Images store under `public/images` and served from `/images/<file>`.

## License
MIT
