# TitanEngine Demo Guide - LOCKED

## 🚀 TitanEngine is Running
- Server: http://localhost:8080
- Admin Interface: http://localhost:8080/admin
- Status: ✅ ACTIVE

## 📋 Demo Flow

### Step 1: Import Images from Pexels
```bash
curl -X POST http://localhost:8080/api/images/import/pexels \
  -H "Content-Type: application/json" \
  -d '{"query":"Black women wellness","category":"wellness","count":5}'
```
**Result**: Images imported to "pending" status

### Step 2: Validate Images  
1. Open browser to: http://localhost:8080/admin
2. Review pending images
3. Click "Approve" for culturally appropriate images
4. Click "Reject" for inappropriate ones

### Step 3: Get Approved Images
```bash
# Get wellness image
curl "http://localhost:8080/api/images/select?context=wellness"

# Get community image  
curl "http://localhost:8080/api/images/select?context=community"

# Response example:
{
  "id": 6,
  "url": "/images/pexels_7219669.jpg",
  "category": "wellness",
  "altText": "Authentic Black women - wellness"
}
```

### Step 4: Use in Frontend
```html
<img src="http://localhost:8080/images/pexels_7219669.jpg" alt="Wellness image" />
```

## 🎯 API Endpoints

### Import Endpoints
- `POST /api/images/import/pexels` - Import from Pexels API
- `POST /api/images/import/unsplash` - Import from Unsplash
- `POST /api/images/import/cultural` - Import culturally curated

### Management Endpoints  
- `GET /admin` - Admin validation interface
- `GET /api/images/pending` - List pending images
- `POST /api/images/validate` - Approve/reject images
- `GET /api/images/select` - Get approved images for use

### Static Files
- `/images/filename.jpg` - Direct image access

## 🎬 Demo Script (5 minutes)

1. **Show Admin Interface** (1 min)
   - Open http://localhost:8080/admin
   - Show pending images awaiting validation

2. **Import New Images** (2 min)
   - Run Pexels import command
   - Refresh admin page
   - Show new pending images

3. **Validate Images** (1 min)  
   - Approve culturally appropriate images
   - Reject problematic ones
   - Explain cultural validation process

4. **Show API Usage** (1 min)
   - Run select endpoint
   - Show JSON response with image URLs
   - Demonstrate how frontend would consume

## 🔧 Troubleshooting

### Server Not Running
```bash
cd /Users/coreyalejandro/Repos/kiro-hackathon-mad-mall/madmall-web-legacy-backup/src/services/titanEngine
npm start
```

### No Images Available
```bash
curl -X POST http://localhost:8080/api/images/import/pexels \
  -H "Content-Type: application/json" \
  -d '{"query":"Black women wellness","category":"wellness","count":3}'
```

### Admin Interface Not Loading
- Check server is running on port 8080
- Try: curl http://localhost:8080/api/health

## 🌟 Key Demo Points

1. **Cultural Validation**: Every image requires human approval
2. **Fast Import**: Pexels API is much faster than Unsplash  
3. **Production Ready**: SQLite storage, proper error handling
4. **API First**: Clean REST endpoints for frontend integration
5. **Authentic Representation**: Curated search terms for Black women wellness

## 📊 Current Status
- ✅ Server Running
- ✅ Pexels Integration Working
- ✅ Admin Interface Active
- ✅ Images Approved and Available
- ✅ API Endpoints Responding

---
**Demo Ready!** 🎉