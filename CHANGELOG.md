# Changelog - Recent Updates

## Summary of Changes Since Last Push

### 1. MongoDB Connection Error Handling
**File**: `Backend/database/connection.py`
- Added comprehensive error handling for MongoDB authentication failures
- Added detailed error messages with troubleshooting guidance
- Improved error messages for connection issues

### 2. Authentication Fixes
**Files**: 
- `Frontend/src/services/api.js`
- `Frontend/src/contexts/AuthContext.js`

**Changes**:
- **Fixed registration token storage**: Tokens are now properly stored in localStorage after registration
- **Fixed logout on navigation**: Users now stay logged in when navigating between pages
- **Improved token persistence**: Tokens persist across page reloads

### 3. Notification System Fixes
**Files**:
- `Frontend/src/contexts/NotificationContext.js`
- `Frontend/src/components/NotificationContainer.js`

**Changes**:
- **Fixed duplicate toast notifications**: Added tracking to prevent showing the same toast multiple times
- **Fixed "mark as read" persistence**: Read state now persists across reloads
- **Fixed React render error**: Moved toast notifications outside render cycle using `setTimeout`
- **Improved authentication checks**: Notifications only poll when user is fully authenticated

### 4. Notification System Migration to MongoDB Backend

#### Backend Changes

**`Backend/services/notification_service.py`** (Complete Rewrite):
- Created MongoDB `notifications` collection for persistent storage
- Added `create_notification()` - Creates notification records in database
- Added `get_user_notifications()` - Retrieves notifications with pagination and filtering
- Added `get_unread_count()` - Gets count of unread notifications
- Added `mark_notification_as_read()` - Marks single notification as read
- Added `mark_all_as_read()` - Marks all notifications as read for a user
- Added `delete_notification()` - Deletes a notification
- Replaced event-based queries with stored notification records
- Maintains backward compatibility with legacy `get_recent_swap_events()` function

**`Backend/routes/notification_routes.py`** (Complete Rewrite):
- `GET /notifications` - Get all notifications for authenticated user (with limit and unread_only params)
- `GET /notifications/unread-count` - Get count of unread notifications
- `PATCH /notifications/{notification_id}/read` - Mark a notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/{notification_id}` - Delete a notification
- Kept `/notifications/recent` endpoint for backward compatibility

**`Backend/routes/swap_routes.py`**:
- Added notification creation when swap requests are created (notifies item owner)
- Added notification creation when swaps are approved (notifies requester)
- Added notification creation when swaps are rejected (notifies requester)
- Integrated with `notification_service` to automatically create notifications on swap events

#### Frontend Changes

**`Frontend/src/services/api.js`**:
- Added `notificationsAPI.getAll()` - Get all notifications from backend
- Added `notificationsAPI.getUnreadCount()` - Get unread count from backend
- Added `notificationsAPI.markAsRead()` - Mark single notification as read
- Added `notificationsAPI.markAllAsRead()` - Mark all notifications as read
- Added `notificationsAPI.delete()` - Delete a notification
- Kept `getRecent()` method for backward compatibility

**`Frontend/src/contexts/NotificationContext.js`** (Complete Rewrite):
- **Removed all localStorage logic** - No longer needed with backend persistence
- **Fetches notifications from backend MongoDB** - All data now comes from server
- **Uses backend endpoints** for all notification operations (mark as read, delete, etc.)
- **Polls backend every 5 seconds** for new notifications
- **Simplified state management** - No need for client-side persistence
- **Better error handling** - Handles API errors gracefully

### Benefits of the Migration

✅ **Persistent across devices** - Notifications sync across all user devices  
✅ **Persistent across sessions** - Read state survives browser restarts  
✅ **Server-side tracking** - All notification state managed in database  
✅ **Scalable architecture** - Can handle large numbers of notifications  
✅ **No client-side limitations** - No localStorage size limits or browser-specific issues

### Technical Improvements

- ✅ Better error handling for database connections
- ✅ Improved authentication flow and token management
- ✅ Fixed React rendering issues with proper async handling
- ✅ Cleaner separation of concerns (backend handles persistence)

### Database Schema

**New MongoDB Collection: `notifications`**

```javascript
{
  user_id: String,           // Recipient user ID
  event_type: String,        // "new_request", "approved", "rejected"
  request_id: String,        // Associated swap request ID
  item_id: String,          // Associated item ID
  message: String,           // Notification message
  read: Boolean,             // Read status
  created_at: String,        // ISO timestamp
  read_at: String,           // ISO timestamp when marked as read (optional)
  item_title: String,        // Item title for display
  other_user_id: String,     // ID of other user involved
  other_user_name: String,   // Name of other user
  status: String             // Swap request status
}
```

### API Endpoints

#### New Endpoints

- `GET /notifications` - Get all notifications
  - Query params: `limit` (default: 50), `unread_only` (default: false)
- `GET /notifications/unread-count` - Get unread count
- `PATCH /notifications/{notification_id}/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all as read
- `DELETE /notifications/{notification_id}` - Delete notification

#### Legacy Endpoints (Maintained)

- `GET /notifications/recent?since_minutes=5` - Get recent notifications (backward compatible)

### Migration Notes

- All changes are **backward compatible**
- Existing frontend code using `/notifications/recent` will continue to work
- New frontend code should use `/notifications` for better functionality
- No database migration needed - notifications collection is created automatically on first use

### Testing Recommendations

1. Test notification creation when swap requests are made
2. Test notification creation when swaps are approved/rejected
3. Test marking notifications as read (single and all)
4. Test notification persistence across page reloads
5. Test notification sync across multiple browser tabs
6. Test unread count accuracy
7. Test notification deletion

---

**All changes are ready for deployment and maintain backward compatibility.**

