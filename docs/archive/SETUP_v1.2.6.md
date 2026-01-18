# 🚀 FTWOS v1.2.6 Setup Guide
## Quick Start with Neural Flow Widget

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Git (for cloning)

---

## 🔧 Installation Steps

### 1. Clone or Update Repository

**New Installation:**
```bash
git clone <repository-url>
cd FTW-OS-main
```

**Existing Installation (Upgrade from v1.2.5):**
```bash
cd FTW-OS-main
git pull origin main
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18.2.0
- @tanstack/react-query 5.90.16
- Framer Motion 12.24.12
- And all other dependencies

### 3. Configure Supabase

#### A. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Note your project URL and anon key

#### B. Set Environment Variables
Create `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### C. Run Database Migrations

**Step 1: Run Performance Optimization (Optional but Recommended)**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `performance_optimization.sql`
4. Run the script
5. Verify success message

**Step 2: Run Neural Flow Migration (REQUIRED)**
1. In Supabase SQL Editor
2. Copy contents of `neural_flow_migration.sql`
3. Run the script
4. Verify tables created:
   - `activity_logs`
   - Functions: `get_productivity_metrics`, `log_activity`
   - View: `recent_activity_summary`

### 4. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

This creates optimized production build in `dist/` folder.

### 6. Run Electron App

```bash
npm start
```

Or for development with hot reload:

```bash
npm run dev:electron
```

---

## 🧠 Using Neural Flow Widget

### Add Widget to Dashboard

1. **Open Dashboard**
   - Launch FTWOS
   - Navigate to Dashboard tab

2. **Add Neural Flow Widget**
   - Click the "+" button (bottom right)
   - Click "Add Widget"
   - Find "Neural Flow" in the library
   - Click to add to dashboard

3. **Position Widget**
   - Click "Edit" button (top right)
   - Drag widget to desired position
   - Resize as needed
   - Click "Done" when finished

### Let It Learn

The Neural Flow widget needs data to provide insights:

**Automatic Tracking:**
- Works in the background
- Tracks focus sessions
- Monitors context switches
- Calculates productivity metrics

**Manual Logging (Optional):**
```typescript
import { activityTrackingService } from '@/services/activity-tracking-service'

// Start a focus session
activityTrackingService.startFocusSession('coding')

// Record context switch
activityTrackingService.recordContextSwitch()

// End session with focus score
await activityTrackingService.endFocusSession(85)
```

### View Insights

After 2-3 days of usage, you'll see:
- **Focus Score**: Your concentration level (0-100)
- **Peak Hours**: When you're most productive
- **Context Switches**: Distraction tracking
- **Burnout Risk**: Early warning system (0-100%)
- **Productivity Trend**: Increasing, stable, or decreasing

---

## 🎨 Widget Features

### Neural Network Visualization
- Animated nodes representing activity
- Color-coded by productivity level:
  - 🟢 Green: High activity (70%+)
  - 🟣 Purple: Medium activity (40-70%)
  - 🔴 Red: Low activity (<40%)
- Pulsing effects for real-time feel
- Connection lines showing relationships

### Metrics Dashboard
- **Peak Hours**: Top 5 most productive hours
- **Focus Time**: Total time in deep work
- **Switches**: Number of context switches
- **Burnout Risk**: Percentage with color indicator

### Smart Alerts
- High burnout risk warnings
- Productivity improvement celebrations
- Personalized recommendations

---

## 🔍 Troubleshooting

### Widget Not Showing Data

**Problem:** Neural Flow shows "No data"

**Solutions:**
1. Verify database migration ran successfully
2. Check Supabase connection
3. Wait 24 hours for data collection
4. Check browser console for errors

### Database Connection Error

**Problem:** "Not authenticated" or connection errors

**Solutions:**
1. Verify `.env` file exists with correct values
2. Check Supabase project is active
3. Verify RLS policies are enabled
4. Test connection in Supabase dashboard

### Build Errors

**Problem:** `npm run build` fails

**Solutions:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check Node.js version (18+ required)
4. Clear npm cache: `npm cache clean --force`

### Widget Not Appearing in Library

**Problem:** Can't find Neural Flow in widget library

**Solutions:**
1. Verify `src/stores/widget-registry.ts` includes Neural Flow
2. Check `src/components/modules/core/dashboard/Dashboard.tsx` has import
3. Restart development server
4. Clear browser cache

---

## 📊 Performance Tips

### Optimize for 10 Users

1. **Database Indexes**
   - Run `performance_optimization.sql`
   - Verify indexes created
   - Monitor query performance

2. **Caching**
   - React Query caches for 5 minutes
   - Reduces API calls
   - Improves response time

3. **Lazy Loading**
   - Widgets load on demand
   - Reduces initial bundle size
   - Faster app startup

### Monitor Performance

```bash
# Check bundle size
npm run build
du -sh dist/

# Run Lighthouse audit
# Open Chrome DevTools
# Go to Lighthouse tab
# Run audit
```

---

## 🔐 Security Notes

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only see their own data
- Automatic user_id filtering
- Secure by default

### API Keys

Never commit `.env` file:
```bash
# Add to .gitignore
.env
.env.local
```

---

## 📚 Additional Resources

### Documentation
- [Release Notes](./RELEASE_NOTES_v1.2.6.md) - Full changelog
- [Revolutionary Widgets](./REVOLUTIONARY_WIDGETS.md) - Widget designs
- [Implementation Progress](./IMPLEMENTATION_PROGRESS.md) - Development status

### Code Examples
- [Activity Tracking Service](./src/services/activity-tracking-service.ts)
- [Neural Flow Widget](./src/components/widgets/revolutionary/NeuralFlowWidget.tsx)
- [Database Migration](./neural_flow_migration.sql)

### Support
- GitHub Issues: Report bugs
- GitHub Discussions: Ask questions
- Email: support@ftwos.dev

---

## 🎯 Next Steps

After setup:

1. **Explore Dashboard**
   - Try different widgets
   - Customize layout
   - Test features

2. **Use Neural Flow**
   - Let it collect data
   - Review insights daily
   - Act on recommendations

3. **Provide Feedback**
   - Report bugs
   - Suggest improvements
   - Share use cases

4. **Stay Updated**
   - Watch for v1.2.7 (Revenue Reactor)
   - Follow development progress
   - Join community discussions

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Dependencies installed (`npm install` successful)
- [ ] Environment variables configured (`.env` file created)
- [ ] Database migrations run (both SQL files)
- [ ] Development server starts (`npm run dev` works)
- [ ] App loads in browser (no console errors)
- [ ] Can log in / create account
- [ ] Dashboard displays correctly
- [ ] Can add Neural Flow widget
- [ ] Widget shows loading state
- [ ] No critical errors in console

---

## 🚀 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run dev:electron     # Start Electron with hot reload

# Building
npm run build           # Production build
npm run build:react     # Build React only
npm run build:electron  # Build Electron only

# Testing
npm run typecheck       # Check TypeScript
npm run lint           # Run ESLint

# Cleaning
npm run clean          # Remove build folders
```

---

**Setup Time:** ~15 minutes  
**Difficulty:** Easy  
**Support:** Available via GitHub Issues

---

*Happy building with FTWOS v1.2.6! 🎉*
