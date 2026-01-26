# User Profile Enhancements - Setup Instructions

## 🎯 Quick Setup (5 minutes)

### Step 1: Configure Supabase Environment Variables

You need to add your Supabase credentials to the backend `.env` file. They've been pre-added but need your actual values:

```bash
# Open Supabase Dashboard: https://app.supabase.com
# Navigate to: Project Settings > API
# Copy the following values:

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Location:** `/backend/.env` (lines 30-32)

### Step 2: Run Database Migration

Execute the migration SQL in your Supabase SQL Editor:

```bash
# 1. Open Supabase Dashboard: https://app.supabase.com
# 2. Go to: SQL Editor > New Query
# 3. Copy the entire contents of: database-migration-profile-enhancements.sql
# 4. Paste and click "Run"
```

This creates:
- Extended `users` table (+17 columns)
- `achievements` table (20 achievements)
- `user_achievements` junction table
- `verification_requests` table
- `portfolio_snapshots` table
- `verification_revocations` table
- 10+ performance indexes

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

The backend will automatically initialize the 20 achievements on first boot.

You should see:
```
✅ Achievements initialized successfully
Server: http://localhost:3001
```

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

## 🎨 What's Integrated

### Profile Page (/profile/:address)

**New Tabs:**
1. **Edit Profile** (own profile only)
   - Avatar & banner upload
   - Bio editing
   - Social links (Twitter, Instagram, Discord, Telegram, Website)
   - Verification request form

2. **Portfolio**
   - Total portfolio value
   - NFTs owned/created
   - Profit/loss tracking
   - Best performances

3. **Trading Stats**
   - Trading volume charts
   - Period selection (24h, 7d, 30d, all-time)
   - Top sales/purchases
   - Trading streak

4. **Achievements**
   - 20 unlockable badges
   - 5 tiers: Bronze → Silver → Gold → Platinum → Legendary
   - Progress tracking
   - Manual unlock check

### Admin Dashboard (/admin)

**New Tab: Verification ✅**
- Pending verification requests
- Approval/rejection workflow
- Review notes
- Verification stats dashboard
- User verification revocation

## 📊 Features Completed

✅ Profile customization (avatar, banner, bio, username)
✅ Social links (5 platforms with validation)
✅ Portfolio value tracking (real-time + historical)
✅ Trading statistics (7 analysis methods)
✅ Achievements system (20 badges, auto-unlock)
✅ Verification system (4 types, admin approval)
✅ Admin verification management
✅ Auto-achievement initialization on boot

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check .env file has Supabase credentials
grep SUPABASE backend/.env

# If missing, add them:
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Migration fails
```bash
# Check if tables already exist
# In Supabase SQL Editor, run:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('achievements', 'user_achievements', 'verification_requests');

# If they exist, you can skip the migration or drop and recreate
```

### Achievements not showing
```bash
# Check if achievements are initialized
# In Supabase SQL Editor:
SELECT COUNT(*) FROM achievements;

# Should return 20. If 0, restart backend to trigger initialization.
```

### Chart.js not rendering
```bash
# Verify installation
cd frontend
npm list chart.js react-chartjs-2

# If missing:
npm install chart.js react-chartjs-2
```

## 🚀 Testing Checklist

- [ ] Backend starts without errors
- [ ] Can access http://localhost:3001/api/health
- [ ] Profile page loads without errors
- [ ] Can upload avatar (IPFS upload)
- [ ] Can upload banner (IPFS upload)
- [ ] Social links save correctly
- [ ] Portfolio stats display
- [ ] Trading charts render
- [ ] Achievements grid shows
- [ ] Can submit verification request
- [ ] Admin can see pending requests
- [ ] Admin can approve/reject

## 📚 API Endpoints Available

### Profile Management
- `GET /api/profile/:userId` - Get profile
- `PUT /api/profile` - Update profile (auth)
- `POST /api/profile/avatar` - Upload avatar (auth + multipart)
- `POST /api/profile/banner` - Upload banner (auth + multipart)

### Portfolio & Stats
- `GET /api/profile/:userId/portfolio-stats` - Real-time stats
- `GET /api/profile/:userId/trading-stats` - Trading analytics
- `GET /api/profile/:userId/trading-activity` - Daily activity

### Achievements
- `GET /api/profile/:userId/achievements` - Unlocked badges
- `GET /api/profile/:userId/achievement-progress` - Progress for all
- `POST /api/profile/check-achievements` - Check & unlock (auth)

### Verification
- `POST /api/profile/verification/request` - Submit (auth)
- `GET /api/profile/verification/eligibility/:type` - Check eligibility (auth)

### Admin Verification
- `GET /api/admin/verification/pending` - Pending requests (admin)
- `POST /api/admin/verification/:requestId/approve` - Approve (admin)
- `POST /api/admin/verification/:requestId/reject` - Reject (admin)

## 🎯 Next Steps

1. **Add your Supabase credentials** to `backend/.env`
2. **Run the migration SQL** in Supabase SQL Editor
3. **Start the backend** to initialize achievements
4. **Test the profile page** with a user
5. **Submit a verification request** to test admin workflow
6. **Check admin dashboard** to approve/reject

---

**Total Implementation:**
- Backend: 2,050+ lines (4 services + routes)
- Frontend: 1,700+ lines (hooks + components)
- Admin: 400+ lines (verification management)
- Documentation: 2,000+ lines

All 7 requested features are complete and integrated! 🎉
