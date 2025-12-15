# SwapCircle Components Documentation

This document describes all React components in the SwapCircle frontend application.

## Component Overview

All components are located in `Frontend/src/components/` and follow these patterns:
- Use utility classes from `globals.css` (no inline styles)
- Integrate with `AuthContext` for authentication
- Use API services from `@/services/api` for backend communication
- Follow Next.js 15 App Router patterns with `'use client'` directives

---

## Core Layout Components

### Logo Component

**Location**: `Frontend/src/components/Logo.js`

**Description**: Reusable logo component displaying the SwapCircle logo with blue circular icon and optional text.

**Props:**
- `className` (string, optional): Additional CSS classes
- `showText` (boolean, optional, default: `true`): Whether to show "SwapCircle" text

**Usage:**
```jsx
import Logo from './Logo';

<Logo />
<Logo showText={false} />
<Logo className="my-custom-class" />
```

---

### Header Component

**Location**: `Frontend/src/components/Header.js`

**Description**: Main navigation header with logo, search bar, navigation links, and user actions.

**Features:**
- Responsive design with mobile menu
- Search bar with tube/pill shape styling
- Navigation links: Browse, How it works, Profile
- Credit display button (shows user's credit balance)
- "List Item" button
- User menu with logout option
- Notification center integration
- Authentication modal integration

**State Management:**
- Uses `AuthContext` for user authentication state
- Manages mobile menu open/close state
- Handles authentication modal display

**Usage:**
```jsx
import Header from './Header';

<Header />
```

---

### Footer Component

**Location**: `Frontend/src/components/Footer.js`

**Description**: Site footer with links and copyright information.

**Usage:**
```jsx
import Footer from './Footer';

<Footer />
```

---

### Navbar Component

**Location**: `Frontend/src/components/Navbar.jsx`

**Description**: Alternative navigation bar component.

**Usage:**
```jsx
import Navbar from './Navbar';

<Navbar />
```

---

## Page Components

### HeroSection Component

**Location**: `Frontend/src/components/HeroSection.js`

**Description**: Main hero section on the landing page with headline and call-to-action buttons.

**Features:**
- Main headline in script font: "The best way to swap clothes on campus."
- Sub-headline explaining the concept
- Two call-to-action buttons: "Swap now" and "List an item"
- Smooth scroll to sections

**Usage:**
```jsx
import HeroSection from './HeroSection';

<HeroSection />
```

---

### ValueProposition Component

**Location**: `Frontend/src/components/ValueProposition.js`

**Description**: "How it works" section displaying three steps of the swap process.

**Features:**
- Three-step process visualization
- Script font for section title
- Clean, minimalist design

**Usage:**
```jsx
import ValueProposition from './ValueProposition';

<ValueProposition />
```

---

### ListingPage Component

**Location**: `Frontend/src/components/ListingPage.js`

**Description**: Main page component for browsing items with filters and sorting.

**Features:**
- Item grid display
- Filter sidebar integration
- Sort dropdown
- Search functionality
- Loading and error states

**Usage:**
```jsx
import ListingPage from './ListingPage';

<ListingPage />
```

---

## Item Display Components

### ListingCard Component

**Location**: `Frontend/src/components/ListingCard.js`

**Description**: Card component for displaying individual items in listings.

**Props:**
- `id` (string, required): Item ID
- `image` (string, required): Image URL
- `title` (string, required): Item title
- `size` (string, optional): Item size
- `credits` (number, optional): Credits required
- `condition` (string, optional): Item condition
- `timestamp` (string, optional): Listing timestamp
- `status` (string, optional): Item status (`available`, `pending`, `sold`)
- `showSwappedStatus` (boolean, optional, default: `false`): Show swapped badge

**Features:**
- Favorite button (requires authentication)
- Status badges (Pending, Unavailable, Swapped)
- Click to navigate to product detail page
- Image with fallback placeholder

**Usage:**
```jsx
import ListingCard from './ListingCard';

<ListingCard
  id="item123"
  image="/images/item.jpg"
  title="Blue Jeans"
  size="M"
  credits={2}
  condition="Like New"
  status="available"
/>
```

---

### ItemCard Component

**Location**: `Frontend/src/components/ItemCard.jsx`

**Description**: Alternative item card component with different styling.

**Props:**
- Similar to `ListingCard`

**Usage:**
```jsx
import ItemCard from './ItemCard';

<ItemCard {...itemProps} />
```

---

### ListingsGrid Component

**Location**: `Frontend/src/components/ListingsGrid.js`

**Description**: Grid layout component for displaying multiple listing cards.

**Props:**
- `title` (string, optional, default: `'Latest Swaps'`): Grid title
- `listings` (array, optional, default: `[]`): Array of listing objects

**Usage:**
```jsx
import ListingsGrid from './ListingsGrid';

<ListingsGrid
  title="Featured Items"
  listings={items}
/>
```

---

### ProductDetail Component

**Location**: `Frontend/src/components/ProductDetail.js`

**Description**: Detailed product view with images, description, seller info, and swap actions.

**Props:**
- `product` (object, required): Product data object

**Features:**
- Image carousel with thumbnails
- Product metadata display (size, condition, credits, etc.)
- Seller information with rating display
- "Want This Item" button (creates swap request)
- Cancel swap request functionality
- Favorite button
- Share and report buttons
- Swap success modal integration
- Swap processing modal integration
- Authentication modal for unauthenticated users

**State Management:**
- Manages current image index
- Tracks swap request status
- Manages favorite status
- Handles toast notifications

**Usage:**
```jsx
import ProductDetail from './ProductDetail';

<ProductDetail product={productData} />
```

---

## Form Components

### UploadForm Component

**Location**: `Frontend/src/components/UploadForm.js`

**Description**: Form for creating new item listings with image upload.

**Features:**
- Drag and drop image upload
- Multiple image support with preview
- Image removal functionality
- Form fields:
  - Title (required)
  - Description (required)
  - Category (dropdown: Tops, Bottoms, Dresses, Jackets, Sweaters, Shoes, Accessories)
  - Size (dropdown: XS, S, M, L, XL, XXL)
  - Location (dropdown: San Francisco, Berlin, Buenos Aires, Hyderabad, Seoul, Taipei, Tokyo, Other)
  - Condition (dropdown: Like New, Excellent, Good, Gently Used)
  - Branded (Yes/No)
  - Credits (number input, default: 1)
- Form validation
- Loading state during submission
- Redirects to profile page on success

**Usage:**
```jsx
import UploadForm from './UploadForm';

<UploadForm />
```

---

### EditItemForm Component

**Location**: `Frontend/src/components/EditItemForm.js`

**Description**: Form for editing existing item listings.

**Props:**
- `itemId` (string, required): ID of item to edit
- `initialItem` (object, required): Initial item data

**Features:**
- Pre-populated form fields
- Image management (add/remove)
- Same validation as UploadForm
- Updates existing item via API

**Usage:**
```jsx
import EditItemForm from './EditItemForm';

<EditItemForm
  itemId="item123"
  initialItem={itemData}
/>
```

---

## Authentication Components

### AuthModal Component

**Location**: `Frontend/src/components/AuthModal.js`

**Description**: Modal for user login and registration.

**Props:**
- `isOpen` (boolean, required): Whether modal is open
- `onClose` (function, required): Callback to close modal
- `mode` (string, optional, default: `'login'`): Modal mode (`'login'` or `'register'`)

**Features:**
- Login form (email, password)
- Registration form (email, username, password, confirm password, full name)
- Form validation
- Error message display
- Loading state during submission
- Keyboard support (ESC to close)
- Body scroll lock when open

**Usage:**
```jsx
import AuthModal from './AuthModal';

<AuthModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  mode="login"
/>
```

---

### ProtectedRoute Component

**Location**: `Frontend/src/components/ProtectedRoute.js`

**Description**: Route wrapper that requires authentication.

**Props:**
- `children` (ReactNode, required): Child components to render

**Features:**
- Redirects to home page if not authenticated
- Shows authentication modal
- Preserves intended destination

**Usage:**
```jsx
import ProtectedRoute from './ProtectedRoute';

<ProtectedRoute>
  <UploadForm />
</ProtectedRoute>
```

---

### GuestRoute Component

**Location**: `Frontend/src/components/GuestRoute.js`

**Description**: Route wrapper that requires user to be unauthenticated (guest).

**Props:**
- `children` (ReactNode, required): Child components to render

**Features:**
- Redirects authenticated users away
- Used for login/register pages

**Usage:**
```jsx
import GuestRoute from './GuestRoute';

<GuestRoute>
  <LoginPage />
</GuestRoute>
```

---

## User Profile Components

### Profile Component

**Location**: `Frontend/src/components/Profile.js`

**Description**: User profile page with listings, favorites, swap requests, and history.

**Props:**
- `username` (string, optional): Username for public profile view

**Features:**
- Tab navigation:
  - My Listings
  - Favorites
  - Swap Requests
  - Swap History
- User information display (name, username, credits, bio, social links)
- Rating display
- Profile picture display
- Edit profile button (for own profile)
- Public profile view (for other users)
- Loading and error states

**State Management:**
- Fetches user data and listings
- Manages active tab
- Handles favorites and swap history

**Usage:**
```jsx
import Profile from './Profile';

// Own profile
<Profile />

// Public profile
<Profile username="johndoe" />
```

---

### Settings Component

**Location**: `Frontend/src/components/Settings.js`

**Description**: User settings page for editing profile information.

**Features:**
- Edit profile form
- Update bio, social links
- Change password (future)
- Account settings

**Usage:**
```jsx
import Settings from './Settings';

<Settings />
```

---

## Swap Components

### SwapRequests Component

**Location**: `Frontend/src/components/SwapRequests.js`

**Description**: Component for displaying and managing swap requests.

**Features:**
- Lists pending swap requests
- Approve/reject swap requests
- View request details
- Filter by status

**Usage:**
```jsx
import SwapRequests from './SwapRequests';

<SwapRequests />
```

---

### SwapHistory Component

**Location**: `Frontend/src/components/SwapHistory.js`

**Description**: Component for displaying swap transaction history.

**Features:**
- Tab navigation (All, Completed, Pending, Cancelled)
- Lists swap transactions
- Shows item details for each swap
- Loading and error states

**Usage:**
```jsx
import SwapHistory from './SwapHistory';

<SwapHistory />
```

---

### SwapSuccessModal Component

**Location**: `Frontend/src/components/SwapSuccessModal.js`

**Description**: Modal displayed after successful swap request.

**Props:**
- `isOpen` (boolean, required): Whether modal is open
- `onClose` (function, required): Callback to close modal

**Features:**
- Animated circle merge effect
- Success checkmark animation
- Auto-closes after 4 seconds

**Usage:**
```jsx
import SwapSuccessModal from './SwapSuccessModal';

<SwapSuccessModal
  isOpen={showSuccess}
  onClose={() => setShowSuccess(false)}
/>
```

---

### SwapProcessingModal Component

**Location**: `Frontend/src/components/SwapProcessingModal.js`

**Description**: Modal displayed during swap request processing.

**Props:**
- `isOpen` (boolean, required): Whether modal is open
- `status` (string, optional, default: `'processing'`): Status (`'processing'`, `'success'`, `'error'`)
- `actionType` (string, optional, default: `'request'`): Action type (`'request'`, `'cancel'`)
- `onClose` (function, required): Callback to close modal

**Features:**
- Loading animation
- Success/error states
- Different animations for request vs cancel

**Usage:**
```jsx
import SwapProcessingModal from './SwapProcessingModal';

<SwapProcessingModal
  isOpen={isProcessing}
  status="processing"
  actionType="request"
  onClose={() => setIsProcessing(false)}
/>
```

---

## Rating Components

### RatingDisplay Component

**Location**: `Frontend/src/components/RatingDisplay.js`

**Description**: Component for displaying user rating statistics.

**Props:**
- `averageRating` (number, optional): Average rating (0-5)
- `totalRatings` (number, optional): Total number of ratings

**Features:**
- Star display
- Rating count
- Handles null/undefined ratings

**Usage:**
```jsx
import RatingDisplay from './RatingDisplay';

<RatingDisplay
  averageRating={4.5}
  totalRatings={10}
/>
```

---

### StarRating Component

**Location**: `Frontend/src/components/StarRating.js`

**Description**: Interactive star rating component for giving ratings.

**Props:**
- `ratedUserId` (string, required): ID of user being rated
- `onRatingChange` (function, optional): Callback when rating changes

**Features:**
- Clickable stars (1-5)
- Visual feedback
- Submits rating to backend

**Usage:**
```jsx
import StarRating from './StarRating';

<StarRating
  ratedUserId="user123"
  onRatingChange={(rating) => console.log(rating)}
/>
```

---

## UI Components

### FilterSidebar Component

**Location**: `Frontend/src/components/FilterSidebar.js`

**Description**: Sidebar component for filtering items.

**Props:**
- `filters` (object, required): Current filter values
- `onChange` (function, required): Callback when filters change
- `onClose` (function, required): Callback to close sidebar

**Features:**
- Category filter
- Location filter
- Size filter
- Condition filter
- Price/credits range filter
- Clear filters button

**Usage:**
```jsx
import FilterSidebar from './FilterSidebar';

<FilterSidebar
  filters={currentFilters}
  onChange={handleFilterChange}
  onClose={() => setShowFilters(false)}
/>
```

---

### SortDropdown Component

**Location**: `Frontend/src/components/SortDropdown.js`

**Description**: Dropdown for sorting items.

**Props:**
- `value` (string, required): Current sort value
- `onChange` (function, required): Callback when sort changes

**Features:**
- Sort options: Newest, Oldest, Price Low to High, Price High to Low, etc.

**Usage:**
```jsx
import SortDropdown from './SortDropdown';

<SortDropdown
  value={sortBy}
  onChange={handleSortChange}
/>
```

---

### SearchBar Component

**Location**: `Frontend/src/components/SearchBar.js`

**Description**: Search input component.

**Props:**
- `value` (string, required): Current search value
- `onChange` (function, required): Callback when search changes
- `placeholder` (string, optional, default: `'Search...'`): Placeholder text

**Usage:**
```jsx
import SearchBar from './SearchBar';

<SearchBar
  value={searchQuery}
  onChange={handleSearchChange}
  placeholder="Search items..."
/>
```

---

## Notification Components

### NotificationCenter Component

**Location**: `Frontend/src/components/NotificationCenter.js`

**Description**: Component for displaying and managing notifications.

**Features:**
- Notification list
- Mark as read functionality
- Delete notifications
- Unread count badge
- Real-time updates

**Usage:**
```jsx
import NotificationCenter from './NotificationCenter';

<NotificationCenter />
```

---

### NotificationContainer Component

**Location**: `Frontend/src/components/NotificationContainer.js`

**Description**: Container component for notification system.

**Features:**
- Manages notification state
- Provides notification context
- Handles notification display

**Usage:**
```jsx
import NotificationContainer from './NotificationContainer';

<NotificationContainer>
  <App />
</NotificationContainer>
```

---

### Toast Component

**Location**: `Frontend/src/components/Toast.js`

**Description**: Toast notification component for temporary messages.

**Props:**
- `message` (string, required): Toast message
- `isVisible` (boolean, required): Whether toast is visible
- `onClose` (function, required): Callback to close toast
- `type` (string, optional, default: `'success'`): Toast type (`'success'`, `'error'`, `'info'`, `'warning'`)
- `index` (number, optional, default: `0`): Index for stacking multiple toasts

**Features:**
- Auto-dismiss after timeout
- Stack multiple toasts
- Different styles for different types

**Usage:**
```jsx
import Toast from './Toast';

<Toast
  message="Item added to favorites"
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  type="success"
/>
```

---

### ToastNotification Component

**Location**: `Frontend/src/components/ToastNotification.js`

**Description**: Alternative toast notification component.

**Props:**
- Similar to `Toast` component

**Usage:**
```jsx
import ToastNotification from './ToastNotification';

<ToastNotification {...toastProps} />
```

---

## Component Patterns

### Styling
- All components use utility classes from `globals.css`
- No inline styles (except for dynamic values)
- Responsive design with Tailwind CSS classes

### State Management
- Local state with `useState` hook
- Global state via `AuthContext` and `NotificationContext`
- API calls via service layer (`@/services/api`)

### Error Handling
- Try-catch blocks for API calls
- Error state management
- User-friendly error messages
- Loading states during async operations

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals

---

## Component Testing

Many components have corresponding test files:
- `Logo.test.js`
- `Header.test.js`
- `Footer.test.js`
- `ListingCard.test.js`
- `ProtectedRoute.test.js`
- `GuestRoute.test.js`
- `SwapHistory.test.js`

Tests use Jest and React Testing Library.

---

## Notes

- Components prefixed with `-improved` (e.g., `ProductDetail-improved.js`) are alternative implementations
- All components are client components (`'use client'`) for Next.js App Router
- Components integrate with backend via API service layer
- Authentication is handled via `AuthContext` hook
