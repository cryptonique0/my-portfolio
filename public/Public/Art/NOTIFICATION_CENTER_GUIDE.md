# Notification Center - Complete Feature Documentation

## Overview

The Notification Center is a comprehensive system for managing in-app notifications, preferences, and communication with users. It includes a notification bell with badge, notification history, detailed preferences management, and multiple notification categories.

**Status:** ✅ **COMPLETE AND PRODUCTION READY**

---

## ✨ Features Implemented

### 1. **🔔 In-App Notification Bell**
- Sticky notification bell in header
- Unread count badge (shows 99+ if more than 99)
- Dropdown preview showing latest 10 notifications
- Quick access to mark all as read
- Auto-refreshes unread count every 30 seconds
- Close on click outside

### 2. **📬 Notification Preferences**
- 5 notification types: Sales, Offers, Follows, Bids, Messages
- 3 delivery channels: Email, Push, In-App
- Per-type, per-channel configuration
- Notification frequency settings (Instant, Daily, Weekly, Never)
- Global unsubscribe/resubscribe option
- Preferences persistence to database

### 3. **✅ Mark as Read/Unread**
- Individual notification marking
- Bulk mark all as read
- Read status persistence
- Visual indicators for unread notifications
- Unread count updates in real-time

### 4. **🗂️ Notification Categories**
- Sales notifications (💰)
- Offer notifications (🤝)
- Follow notifications (👥)
- Auction bid notifications (⚡)
- Message notifications (💬)
- Admin notifications (⚠️)
- System notifications (🔔)
- Color-coded by type
- Icons for quick identification

### 5. **🕐 Notification History**
- Full notification history view
- List and grid view modes
- Filter by notification type
- Time-based sorting (most recent first)
- Human-readable timestamps (e.g., "2 hours ago")
- Per-notification delete option

### Bonus Features
- Dark mode support
- Mobile responsive design
- Real-time updates
- Error handling and loading states
- Empty state messaging
- Unread count polling
- Preference summary view
- Settings link in notification center

---

## 📦 Files Created

### Backend (400+ lines)

#### 1. **`notification-preferences.service.ts`** (350+ lines)
- Location: `/backend/src/services/notification-preferences.service.ts`
- Purpose: Manage notification preferences
- Key Methods:
  - `getPreferences()` - Fetch user preferences
  - `updatePreferences()` - Update preference settings
  - `unsubscribeAll()` - Disable all notifications
  - `resubscribe()` - Re-enable notifications
  - `getNotificationSummary()` - Get preference overview
  - `bulkUpdatePreferences()` - Update multiple users
- Features: Defaults for new users, upsert operations, summary generation

#### 2. **`notification-center.ts`** (300+ lines)
- Location: `/backend/src/routes/notification-center.ts`
- Purpose: API endpoints for notification management
- Endpoints:
  - `GET /api/notifications` - Fetch notifications with pagination
  - `GET /api/notifications/unread` - Get unread notifications
  - `GET /api/notifications/count` - Get unread count
  - `PUT /api/notifications/:id/read` - Mark single notification as read
  - `PUT /api/notifications/mark-all-read` - Mark all as read
  - `DELETE /api/notifications/:id` - Delete notification
  - `GET /api/notifications/preferences` - Get preferences
  - `PUT /api/notifications/preferences` - Update preferences
  - `GET /api/notifications/preferences/summary` - Get summary
  - `POST /api/notifications/unsubscribe` - Unsubscribe from all
  - `POST /api/notifications/resubscribe` - Resubscribe
  - `GET /api/notifications/history/:type` - Get by category
- Features: Full error handling, JWT auth, pagination

### Frontend (1,100+ lines)

#### 1. **`useNotificationCenter.ts`** (300+ lines)
- Location: `/frontend/src/hooks/useNotificationCenter.ts`
- Purpose: React hooks for notification management
- Hooks:
  - `useNotificationCenter()` - Main notifications hook
    - State: notifications[], unreadCount, loading, error
    - Methods: fetch, unread, getCount, markAsRead, markAllAsRead, delete, getByType
  - `useNotificationPreferences()` - Preferences hook
    - State: preferences, loading, error
    - Methods: fetch, update, updateChannel, updateFrequency, unsubscribe, resubscribe
- Features: Auto-fetch on mount, error handling, loading states, token management

#### 2. **`NotificationBell.tsx`** (180+ lines)
- Location: `/frontend/src/components/NotificationBell.tsx`
- Purpose: Header notification bell component
- Features:
  - Bell icon with unread badge
  - Dropdown with latest notifications
  - Mark all as read button
  - Link to full notification center
  - Auto-closing dropdown
  - 30-second polling for updates
  - Dark mode support

#### 3. **`NotificationCenter.tsx`** (400+ lines)
- Location: `/frontend/src/components/NotificationCenter.tsx`
- Purpose: Full notification history page
- Features:
  - Filter by type (All, Sales, Offers, Follows, Bids, Messages)
  - List and grid view modes
  - Mark as read per notification
  - Delete notifications
  - Human-readable timestamps
  - Color-coded notifications
  - Empty state messaging
  - Settings link
  - Dark mode support
  - Mobile responsive

#### 4. **`NotificationPreferences.tsx`** (380+ lines)
- Location: `/frontend/src/components/NotificationPreferences.tsx`
- Purpose: Notification settings page
- Features:
  - Per-type, per-channel toggles
  - Frequency selection (Instant, Daily, Weekly, Never)
  - Unsubscribe/resubscribe section
  - Preference summary
  - Settings persistence
  - Success/error messages
  - Confirmation dialogs
  - Dark mode support

#### 5. **`index.notifications.ts`** (10 lines)
- Location: `/frontend/src/components/index.notifications.ts`
- Purpose: Component exports

---

## 🏗️ Architecture

### Backend Architecture
```
Express Routes (notification-center.ts)
    ↓
NotificationService (existing)
NotificationPreferencesService (new)
    ↓
Supabase Database
    ├── notifications table (existing)
    └── notification_preferences table (new)
```

### Frontend Architecture
```
NotificationBell (Header Component)
    ↓
useNotificationCenter Hook
    ↓
Fetch API → /api/notifications/*

NotificationCenter Page
    ↓
useNotificationCenter Hook

NotificationPreferences Page
    ↓
useNotificationPreferences Hook
```

---

## 🔌 API Endpoints

### Notifications Retrieval
```
GET /api/notifications
Query: limit=50, offset=0
Response: { notifications[], unreadCount, limit, offset }

GET /api/notifications/unread
Response: { notifications[], count }

GET /api/notifications/count
Response: { unreadCount }
```

### Notification Management
```
PUT /api/notifications/:id/read
Response: { success, message }

PUT /api/notifications/mark-all-read
Response: { success, message }

DELETE /api/notifications/:id
Response: { success, message }

GET /api/notifications/history/:type
Query: limit=50, offset=0
Response: { notifications[], type, limit, offset }
```

### Preferences Management
```
GET /api/notifications/preferences
Response: { data: NotificationPreferences }

PUT /api/notifications/preferences
Body: { partial NotificationPreferences }
Response: { success, data: NotificationPreferences, message }

GET /api/notifications/preferences/summary
Response: { enabledChannels[], notificationTypes[], frequency, isUnsubscribed }

POST /api/notifications/unsubscribe
Response: { success, message }

POST /api/notifications/resubscribe
Response: { success, message }
```

---

## 📝 Data Models

### Notification
```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'sale' | 'offer' | 'follow' | 'auction_bid' | 'message' | 'admin' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  created_at: string;
}
```

### NotificationPreferences
```typescript
interface NotificationPreferences {
  user_id: string;
  // Email channel
  email_on_sale: boolean;
  email_on_offer: boolean;
  email_on_follow: boolean;
  email_on_auction_bid: boolean;
  email_on_message: boolean;
  // Push channel
  push_on_sale: boolean;
  push_on_offer: boolean;
  push_on_follow: boolean;
  push_on_auction_bid: boolean;
  push_on_message: boolean;
  // In-App channel
  in_app_on_sale: boolean;
  in_app_on_offer: boolean;
  in_app_on_follow: boolean;
  in_app_on_auction_bid: boolean;
  in_app_on_message: boolean;
  // Settings
  notify_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  unsubscribe_all: boolean;
  updated_at: string;
}
```

---

## 💻 Usage Examples

### Using NotificationBell Component
```tsx
import { NotificationBell } from './components';

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>BitArt Market</h1>
      <NotificationBell />
    </header>
  );
}
```

### Using NotificationCenter Component
```tsx
import { NotificationCenter } from './components';

function NotificationsPage() {
  return <NotificationCenter />;
}
```

### Using NotificationPreferences Component
```tsx
import { NotificationPreferences } from './components';

function SettingsPage() {
  return <NotificationPreferences />;
}
```

### Using Hooks in Custom Components
```tsx
import { useNotificationCenter, useNotificationPreferences } from './hooks/useNotificationCenter';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  } = useNotificationCenter();

  const {
    preferences,
    updateChannel,
    updateFrequency,
  } = useNotificationPreferences();

  return (
    <div>
      {/* Custom UI using hooks */}
    </div>
  );
}
```

---

## 🔧 Integration Guide

### 1. Backend Integration

#### Add route to `index.ts`
```typescript
import notificationCenterRoutes from './routes/notification-center';

app.use('/api/notifications', notificationCenterRoutes);
```

#### Create database table (if not exists)
```sql
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY,
  email_on_sale BOOLEAN DEFAULT true,
  email_on_offer BOOLEAN DEFAULT true,
  email_on_follow BOOLEAN DEFAULT false,
  email_on_auction_bid BOOLEAN DEFAULT true,
  email_on_message BOOLEAN DEFAULT true,
  push_on_sale BOOLEAN DEFAULT true,
  push_on_offer BOOLEAN DEFAULT true,
  push_on_follow BOOLEAN DEFAULT false,
  push_on_auction_bid BOOLEAN DEFAULT true,
  push_on_message BOOLEAN DEFAULT true,
  in_app_on_sale BOOLEAN DEFAULT true,
  in_app_on_offer BOOLEAN DEFAULT true,
  in_app_on_follow BOOLEAN DEFAULT true,
  in_app_on_auction_bid BOOLEAN DEFAULT true,
  in_app_on_message BOOLEAN DEFAULT true,
  notify_frequency TEXT DEFAULT 'instant',
  unsubscribe_all BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Frontend Integration

#### Add NotificationBell to Header
```tsx
import { NotificationBell } from './components/index.notifications';

function Header() {
  return (
    <header>
      {/* ... other header content ... */}
      <NotificationBell />
    </header>
  );
}
```

#### Add Routes
```tsx
import { NotificationCenter, NotificationPreferences } from './components/index.notifications';

<Route path="/notifications" element={<NotificationCenter />} />
<Route path="/settings/notifications" element={<NotificationPreferences />} />
```

---

## 🔒 Security & Validation

- ✅ JWT authentication on all endpoints
- ✅ User ID validation
- ✅ Input sanitization
- ✅ Rate limiting applicable
- ✅ Error handling without info leaking
- ✅ CORS configured
- ✅ Secure token storage (localStorage)

---

## 🎨 Customization

### Change Notification Types
Edit in both service files:
```typescript
type: 'sale' | 'offer' | 'follow' | 'auction_bid' | 'message' | 'your_type';
```

### Change Default Preferences
Edit in `notification-preferences.service.ts`:
```typescript
static getDefaultPreferences(userId: string): NotificationPreferences {
  return {
    // Change defaults here
    email_on_sale: false, // Set to false
    // ...
  };
}
```

### Customize Icons
Edit in components:
```typescript
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'custom_type':
      return '🎨'; // Your custom emoji
    // ...
  }
};
```

---

## 📊 Performance

- Pagination: 50 items per page default (max 100)
- Polling: 30 seconds for unread count updates
- Lazy loading: Preferences loaded on demand
- Caching: Client-side notification state
- Optimizations: Minimize re-renders, memoization ready

---

## 🐛 Troubleshooting

### Notifications not loading
1. Check JWT token in localStorage
2. Verify API endpoint is `/api/notifications`
3. Check browser console for errors
4. Verify backend routes are registered

### Preferences not saving
1. Ensure user is authenticated
2. Check notification_preferences table exists
3. Verify UPSERT is working
4. Check database permissions

### Badge not updating
1. Wait for next 30-second poll
2. Refresh page to update
3. Check network requests in DevTools
4. Verify /api/notifications/count endpoint

### Notification types not showing
1. Verify type matches interface
2. Check notification creation service
3. Verify database has correct type values

---

## 📈 Future Enhancements

1. **Email Notifications** - Send emails for important events
2. **Push Notifications** - Browser/mobile push support
3. **Webhook Support** - Custom webhook integrations
4. **Notification Templates** - Customizable message templates
5. **Scheduled Notifications** - Schedule notifications for later
6. **Notification Analytics** - Track read rates, engagement
7. **Bulk Actions** - Delete, archive multiple notifications
8. **Notification Threads** - Group related notifications
9. **Rich Media** - Images, videos in notifications
10. **Smart Bundling** - Group similar notifications

---

## 📚 Related Features

- Event Listener Service - Triggers notifications
- WebSocket Service - Real-time updates
- User Service - User management
- Email Service - Email notifications (optional)

---

## ✅ Deployment Checklist

- [x] Backend service implemented
- [x] API routes created
- [x] Frontend hooks created
- [x] Components created
- [x] Dark mode support
- [x] Mobile responsive
- [x] Error handling
- [x] Documentation
- [x] TypeScript types
- [x] Ready for production

---

## 📞 Support

### Files
- Backend Service: `/backend/src/services/notification-preferences.service.ts`
- Backend Routes: `/backend/src/routes/notification-center.ts`
- Frontend Hooks: `/frontend/src/hooks/useNotificationCenter.ts`
- Frontend Components: `/frontend/src/components/Notification*.tsx`

### API Documentation
- Available at `/api-docs` (Swagger UI)

### Code Examples
- See usage examples above
- Check component JSDoc comments
- Review hook implementations

---

**Status:** ✅ **PRODUCTION READY**
**Version:** 1.0.0
**Last Updated:** 2024

---

For more information, see:
- [Integration Guide](#integration-guide)
- [API Endpoints](#-api-endpoints)
- [Usage Examples](#-usage-examples)
- [Troubleshooting](#-troubleshooting)
