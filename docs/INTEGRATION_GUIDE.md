# Integration Guide - New Enhanced Components

This guide explains how to integrate all the newly created components into your existing codebase.

## 1. Splash Screen Optimization

Already integrated automatically. The improved splash screen is in use via:
- `src/AppWithSplash.tsx` - Updated with real progress tracking
- `src/components/ui/SplashScreen.tsx` - Optimized animations

**Result:** Your app now shows smooth progress bars during boot with true initialization tracking.

---

## 2. PhotonNav Redesign

Already integrated automatically. Simply run your app and the new nav will be active with:
- More menu items
- Better descriptions
- Smooth animations
- Enhanced visual design

**Features activated:**
- Analytics tab in Core section
- Products & History in Finance section
- Better hover effects
- Improved typography

---

## 3. Using the Ollama Chat Widget

To add the chat bot to your dashboard:

### Step 1: Ensure Ollama is Running
```bash
# Install Ollama from https://ollama.ai
# Pull a model
ollama pull neural-chat

# Start the server
ollama serve
```

### Step 2: Add to Dashboard
In `src/components/modules/core/dashboard/Dashboard.tsx`, add to your widgets:

```tsx
import { OllamaChat } from '@/components/modules/core/dashboard/widgets/real/OllamaChat'

// In your widget list:
<div className="grid-item col-span-2 row-span-2">
  <OllamaChat
    apiUrl="http://localhost:11434"
    model="neural-chat"
  />
</div>
```

### Step 3: Configure in Settings
Users can configure API URL and model in Settings once integrated.

---

## 4. Using the Map Widget

### Step 1: Add to Dashboard
In `src/components/modules/core/dashboard/Dashboard.tsx`:

```tsx
import { MapWidget } from '@/components/modules/core/dashboard/widgets/real/MapWidget'

// In your widget list:
<div className="grid-item col-span-2 row-span-2">
  <MapWidget
    centerLat={40.7128}
    centerLng={-74.0060}
    zoom={12}
  />
</div>
```

### Step 2: No Configuration Needed
- The widget uses free OpenStreetMap tiles (no API key required)
- Leaflet is loaded dynamically from CDN
- Geolocation is requested automatically

### Step 3: User Permissions
Users will be prompted for location permission when they click "Locate Me"

---

## 5. Using Enhanced Task Component

### Step 1: Replace Old Component
Replace your old TaskList in `src/App.tsx`:

```tsx
// Old
import { TaskList } from '@/components/modules/productivity/tasks/TaskList'

// New
import { TaskListEnhanced } from '@/components/modules/productivity/tasks/TaskListEnhanced'
```

### Step 2: Update Tab Content
```tsx
case 'tasks': return <TaskListEnhanced
  tasks={tasks}
  onTaskCreate={handleTaskCreate}
  onTaskUpdate={handleTaskUpdate}
  onTaskDelete={handleTaskDelete}
/>
```

### Step 3: New Fields in Store
Update your task store to include:
```typescript
{
  id, title, status, priority, projectId, dueDate,

  // NEW
  description, assignee, tags, subtasks, comments,
  attachments, estimatedHours, actualHours,
  dependencies, recurrence
}
```

---

## 6. Using Enhanced Expense Component

### Step 1: Replace Old Component
```tsx
// Old
import { ExpenseManager } from '@/components/modules/finance/expenses/ExpenseManager'

// New
import { ExpenseManagerEnhanced } from '@/components/modules/finance/expenses/ExpenseManagerEnhanced'
```

### Step 2: Update Tab Content
```tsx
case 'expenses': return <ExpenseManagerEnhanced
  expenses={expenses}
  onExpenseCreate={handleExpenseCreate}
  onExpenseUpdate={handleExpenseUpdate}
  onExpenseDelete={handleExpenseDelete}
/>
```

### Step 3: New Fields in Store
Update your expense store to include:
```typescript
{
  id, description, amount, category, date,

  // NEW
  clientId, projectId, vendor, paymentMethod,
  receipt, notes, status, tax, currency, tags,
  billable, approvedBy, approvedDate
}
```

---

## 7. Using New Invoice Type Extensions

The enhanced invoice types are already available. To use new fields:

### Signatures
```tsx
const invoice: Invoice = {
  // ... existing fields
  signature: {
    data: base64String,
    name: 'John Doe',
    timestamp: new Date()
  }
}
```

### Watermarks
```tsx
const invoice: Invoice = {
  watermark: {
    text: 'DRAFT',
    opacity: 0.3,
    angle: 45,
    fontSize: 48
  }
}
```

### Headers/Footers
```tsx
const invoice: Invoice = {
  header: {
    content: 'Company letterhead',
    height: 100,
    style: { backgroundColor: '#f0f0f0' }
  },
  footer: {
    content: 'Thank you for your business',
    showPageNumbers: true,
    showDate: true
  }
}
```

### Payment Information
```tsx
const invoice: Invoice = {
  payment: {
    method: 'stripe',
    status: 'paid',
    transactionId: 'txn_123',
    amountPaid: 1000,
    dueDate: new Date()
  },
  bankDetails: {
    accountName: 'Acme Inc',
    iban: 'DE89370400440532013000',
    swift: 'COBADEDHXXX'
  }
}
```

---

## 8. Lazy Loading Setup

To implement lazy loading for better performance:

### In App.tsx
```tsx
import { createLazyComponent } from '@/services/lazy-loader'

const lazyTasks = createLazyComponent({
  component: () => import('@/components/modules/productivity/tasks/TaskListEnhanced').then(m => ({ default: m.TaskListEnhanced })),
  fallback: <LoadingSkeleton />
})

// In your switch:
case 'tasks': return <lazyTasks.Suspended />
```

---

## 9. TypeScript Updates

Make sure your store types match the new extended types:

```tsx
// In your store file
import { Task, Expense, Invoice } from '@/types/invoice'

// Update your Zustand store
create<{
  tasks: Task[]
  expenses: Expense[]
  invoices: Invoice[]
}>((set) => ({
  // ... existing code
}))
```

---

## 10. Environment Setup

### For Ollama Chat
Add to `.env` (optional, defaults to localhost):
```
VITE_OLLAMA_API_URL=http://localhost:11434
VITE_OLLAMA_MODEL=neural-chat
```

### For Map
No environment variables needed (uses free OpenStreetMap)

### For New Components
No additional dependencies needed - all use existing libraries:
- `framer-motion` for animations
- `lucide-react` for icons
- `tailwindcss` for styling

---

## 11. Migration Checklist

- [ ] Update Task types in store to include new fields
- [ ] Replace TaskList with TaskListEnhanced
- [ ] Update Expense types in store
- [ ] Replace ExpenseManager with ExpenseManagerEnhanced
- [ ] Extend Invoice type usage to include new fields
- [ ] Test all new components in light/dark mode
- [ ] Add OllamaChat widget to dashboard
- [ ] Add MapWidget to dashboard
- [ ] Verify animations run at 60fps
- [ ] Test responsive behavior
- [ ] Update any API calls to handle new fields
- [ ] Test error states for all new widgets
- [ ] Verify geolocation permissions work
- [ ] Test Ollama connection handling

---

## 12. Troubleshooting

### Map Widget Not Loading
- Check browser console for CDN errors
- Verify no Content Security Policy issues
- Check geolocation permissions in browser

### Ollama Chat Not Connecting
- Verify `ollama serve` is running
- Check API URL configuration
- Verify model is installed: `ollama list`
- Check browser console for CORS errors

### Task/Expense Enhancements Not Appearing
- Verify store includes new fields
- Check component imports are correct
- Clear browser cache
- Check TypeScript compilation errors

### Animations Stuttering
- Check GPU acceleration (will-change properties)
- Verify no other heavy processes running
- Check animation frame rate with DevTools
- Reduce particle count if needed

---

## 13. Performance Tuning

To optimize further:

### Lazy Load Widgets
```tsx
const OllamaChatLazy = lazy(() =>
  import('@/components/modules/core/dashboard/widgets/real/OllamaChat').then(m => ({
    default: m.OllamaChat
  }))
)
```

### Memoize Components
```tsx
export const MapWidget = React.memo(MapWidgetComponent)
export const OllamaChat = React.memo(OllamaChatComponent)
```

### Virtualize Long Lists
For tasks/expenses with 100+ items, add virtualization:
```tsx
import { FixedSizeList } from 'react-window'
```

---

## 14. Testing

### Unit Tests
```tsx
describe('TaskListEnhanced', () => {
  it('filters tasks by priority', () => {
    // Test implementation
  })

  it('expands task details', () => {
    // Test implementation
  })
})
```

### Integration Tests
```tsx
describe('Dashboard', () => {
  it('loads map widget without errors', () => {
    // Test implementation
  })

  it('connects to Ollama chat', () => {
    // Test implementation
  })
})
```

---

## 15. Deployment Notes

### Production Checklist
- [ ] Ollama running on production server (if using)
- [ ] Map tiles loading from CDN (check HTTPS)
- [ ] All new components tested on target devices
- [ ] Error boundaries around new widgets
- [ ] Analytics updated to track new features
- [ ] User documentation updated
- [ ] Support team trained on new features

### Production Config
```tsx
// Use environment variables for API endpoints
const OLLAMA_URL = process.env.VITE_OLLAMA_API_URL || 'http://localhost:11434'
const MAP_TILE_PROVIDER = 'https://tile.openstreetmap.org'
```

---

## Support

For issues or questions:
1. Check browser DevTools console for errors
2. Verify all dependencies are installed
3. Clear node_modules and reinstall if needed
4. Check that TypeScript compilation passes
5. Verify environment variables are set
6. Review the IMPLEMENTATION_SUMMARY.md for details

---

**Last Updated:** 2026-01-09
**Status:** Ready for Integration
