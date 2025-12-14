# API Integration Documentation

This document describes how the frontend is connected to the backend APIs.

## Overview

The frontend and backend are now fully connected. All major components fetch data from the backend API instead of using mock data.

## Interactive API Documentation

FastAPI automatically provides interactive API documentation that you can use to explore and test all endpoints:

- **Swagger UI**: `http://localhost:8000/docs` - Interactive API explorer where you can try out endpoints
- **ReDoc**: `http://localhost:8000/redoc` - Clean, readable API documentation
- **OpenAPI Schema**: `http://localhost:8000/openapi.json` - Machine-readable schema for API tools

When the backend is running, visit `http://localhost:8000/docs` to see all available endpoints, their parameters, request/response schemas, and test them directly in your browser.

## API Service

The main API service is located at `Frontend/src/services/api.js`. It provides:

- **Authentication API** (`authAPI`): Login, register, get current user, verify email
- **User API** (`userAPI`): Get user by ID, update user profile
- **Items API** (`itemsAPI`): Get items, get item by ID, create item, update item, delete item

### Configuration

- **API Base URL**: Set via `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8000`)
- **Mock Mode**: Can be enabled with `NEXT_PUBLIC_MOCK_AUTH=true` for testing without backend

## Connected Components

### 1. UploadForm (`Frontend/src/components/UploadForm.js`)
- **Connected**: Creates items via `itemsAPI.createItem()`
- **Features**: 
  - Supports multipart/form-data for image uploads
  - Validates form data before submission
  - Shows loading and error states
  - Redirects to profile page after successful submission

### 2. ListingPage (`Frontend/src/components/ListingPage.js`)
- **Connected**: Fetches all items via `itemsAPI.getItems()`
- **Features**:
  - Displays items in a grid
  - Shows loading state while fetching
  - Handles errors gracefully
  - Transforms backend item format to component format
  - Uses `parseItemMetadata()` and `getImageUrl()` utilities for data transformation

### 3. ProductDetail (`Frontend/src/components/ProductDetail.js`)
- **Connected**: 
  - Fetches item details via `itemsAPI.getItem(itemId)`
  - Fetches seller info via `userAPI.getUser(ownerId)`
- **Features**:
  - Displays item images, details, and seller information
  - Shows user credits from auth context
  - Handles missing data gracefully
  - Uses `parseItemMetadata()` and `getImageUrl()` utilities for data transformation

### 4. Browse Page (`Frontend/src/app/browse/page.js`)
- **Connected**: Fetches all items via `itemsAPI.getItems()`
- **Features**:
  - Displays items with filtering and sorting
  - Transforms backend data to listing format
  - Shows loading and error states
  - Uses `parseItemMetadata()` and `getImageUrl()` utilities for data transformation

### 5. Profile (`Frontend/src/components/Profile.js`)
- **Connected**: 
  - Fetches user data via `userAPI.getUser(userId)`
  - Fetches user's items via `itemsAPI.getItems()` and filters by `owner_id`
- **Features**:
  - Displays user profile information
  - Shows user's listings
  - Calculates stats (credits, listed items)
  - Uses `parseItemMetadata()` and `getImageUrl()` utilities for data transformation

### 6. Product Page (`Frontend/src/app/product/[id]/page.js`)
- **Connected**: Fetches item details via `itemsAPI.getItem(itemId)`
- **Features**:
  - Dynamic routing for product pages
  - Shows loading and error states
  - Passes data to ProductDetail component

## Backend Updates

### Item Routes (`Backend/routes/item_routes.py`)
- Updated to handle multipart/form-data requests with JSON in form field
- Supports both JSON body and multipart form data
- Parses `item` field from multipart form data as JSON string

## Image Handling

- Images are uploaded as multipart/form-data files
- Backend stores images in `Backend/static/images/`
- Image URLs are returned as `/static/images/{filename}`
- Frontend constructs full URLs using `NEXT_PUBLIC_API_URL` when needed
- Static files are served via FastAPI's StaticFiles mount at `/static`
- Image serving uses absolute paths for reliability

## Authentication

- Uses Bearer token authentication
- Token stored in localStorage
- Automatically included in API requests via `apiRequest()` function
- Auth context (`Frontend/src/contexts/AuthContext.js`) manages authentication state

## Error Handling

All API calls include error handling:
- Network errors show user-friendly messages
- Backend errors display `detail` or `message` from response
- Components show loading states during API calls
- Error states are displayed to users

## Data Transformation

Backend item format is transformed to match frontend component expectations:
- Image URLs are converted to full URLs using `getImageUrl()` utility
- Metadata stored in description is parsed using `parseItemMetadata()` utility
- The `UploadForm` stores metadata (category, size, location, condition, credits) in the description field
- All components use the `itemParser.js` utility to extract this metadata
- Missing fields use sensible defaults

### Item Metadata Parser (`Frontend/src/utils/itemParser.js`)

A utility module that provides:
- `parseItemMetadata(description)`: Extracts metadata from item descriptions
  - Parses: category, size, location, condition, branded status, credits
  - Returns main description and extracted fields
- `getImageUrl(image, apiBaseUrl)`: Constructs full image URLs
  - Handles relative and absolute URLs
  - Prepends API base URL when needed

## Testing

To test the integration:
1. Start the backend: `cd Backend && uvicorn main:app --reload`
2. Start the frontend: `cd Frontend && npm run dev`
3. Ensure `NEXT_PUBLIC_MOCK_AUTH` is not set (or set to `false`)
4. Test creating items, browsing, viewing details, and profile

## Future Improvements

- Store item metadata (size, location, condition, credits) as separate fields in backend
- Add proper error boundaries for better error handling
- Implement pagination for item lists
- Add caching for frequently accessed data
- Implement real-time updates for item status changes




