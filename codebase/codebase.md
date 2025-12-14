# SwapCircle Codebase Documentation

This is the main documentation file for the SwapCircle project. It provides an overview and directs to detailed documentation for specific features and components.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Frontend Documentation](#frontend-documentation)
- [Backend Documentation](#backend-documentation)
- [Making Changes](#making-changes)
- [Documentation Files](#documentation-files)

## Project Overview

SwapCircle is a campus clothing exchange platform that enables students to buy, sell, and swap clothing items within their university community. The platform uses a credit-based system where users earn credits by listing items and spend credits to acquire items.

### Core Concepts

- **Credit System**: Users start with 0 credits, earn +1 credit per item listed, and spend 2 credits to acquire an item
- **Swap Requests**: Users can request items, which must be approved by the seller
- **Campus Verification**: Email verification ensures transactions happen within trusted university communities
- **Item Locking**: Items can be locked when a swap request is pending

## Project Structure

```
SwapCircle/
├── Frontend/                 # Next.js 15.5.6 application
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth, Notifications)
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles and theme
│   └── public/             # Static assets
│
├── Backend/                 # FastAPI (Python) application
│   ├── main.py             # FastAPI application entry point
│   ├── config.py           # Configuration and settings
│   ├── database/           # MongoDB connection
│   ├── models/             # Pydantic data models
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── tests/              # Unit tests
│
├── codebase/                # Code documentation (this folder)
│   ├── codebase.md         # This file - main documentation index
│   ├── components.md       # Frontend component documentation
│   ├── api-integration.md  # Frontend-Backend integration
│   ├── theme.md            # Theme and styling guide
│   ├── styling-guide.md    # Styling best practices
│   ├── backend-routes.md   # Backend API routes documentation
│   ├── backend-services.md # Backend services documentation
│   └── backend-models.md   # Backend data models documentation
│
└── Documentation/           # Project documentation
    ├── backend-architecture.md
    ├── frontend-specs.md
    └── project-overview.md
```

## Key Features

### Frontend Features
- **User Authentication**: Login, registration, and email verification
- **Item Management**: Browse, search, filter, create, edit, and delete items
- **Swap System**: Request items, approve/reject swap requests, view swap history
- **User Profiles**: View and edit profiles, manage favorites, view ratings
- **Messaging**: In-app messaging between users
- **Notifications**: Real-time notifications for swap requests and updates
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Backend Features
- **RESTful API**: FastAPI with async/await support
- **Authentication**: JWT-based authentication with email verification
- **Credit System**: Credit management with locking and transactions
- **Swap Management**: Request, approve, reject, and cancel swap operations
- **Image Storage**: File upload and storage (local development, Firebase in production)
- **Email Service**: Automated email notifications
- **Rating System**: User rating and review system
- **MongoDB Integration**: Async MongoDB operations

## Frontend Documentation

### Components
- **Location**: `Frontend/src/components/`
- **Documentation**: [components.md](./components.md)
- Key components: Header, ListingCard, ProductDetail, UploadForm, Profile, SwapHistory

### API Integration
- **Location**: `Frontend/src/services/api.js`
- **Documentation**: [api-integration.md](./api-integration.md)
- Handles all frontend-backend communication

### Styling
- **Theme**: [theme.md](./theme.md) - Fonts, colors, and design system
- **Styling Guide**: [styling-guide.md](./styling-guide.md) - **IMPORTANT**: Use utility classes, no inline styles!

### Contexts
- **AuthContext**: Manages authentication state and user data
- **NotificationContext**: Manages notification state

## Backend Documentation

### API Routes
- **Location**: `Backend/routes/`
- **Documentation**: [backend-routes.md](./backend-routes.md)
- Routes: Authentication, Users, Items, Swaps, Ratings, Messages, Notifications, Credits, Contact

### Services
- **Location**: `Backend/services/`
- **Documentation**: [backend-services.md](./backend-services.md)
- Services: Auth, User, Item, Swap, Credit, Email, Image, Storage, Rating, Notification

### Data Models
- **Location**: `Backend/models/`
- **Documentation**: [backend-models.md](./backend-models.md)
- Models: User, Item, SwapRequest, Transaction, Rating, Message, Notification

### Architecture
- **Documentation**: `Documentation/backend-architecture.md`
- Covers credit system, database design, and deployment

## Making Changes

Before making any changes to the codebase:

1. **Consult Documentation**: Review relevant documentation files in this `codebase/` folder
2. **Review Existing Code**: Understand how similar features are implemented
3. **Check Dependencies**: Ensure changes don't break existing functionality
4. **Update Documentation**: After making changes, update relevant documentation files
5. **Test Changes**: Run tests and verify functionality

### Code Style Guidelines

- **Frontend**: Use utility classes from `globals.css`, no inline styles
- **Backend**: Follow FastAPI best practices, use async/await for I/O operations
- **Naming**: Use descriptive names, follow existing conventions
- **Comments**: Add comments for complex logic, document public APIs

## Documentation Files

### Frontend Documentation
- [components.md](./components.md) - Component documentation and structure
- [api-integration.md](./api-integration.md) - Frontend-Backend API integration
- [theme.md](./theme.md) - Theme, fonts, and styling guide
- [styling-guide.md](./styling-guide.md) - **IMPORTANT**: How to style components using utility classes (no inline styles!)

### Backend Documentation
- [backend-routes.md](./backend-routes.md) - Complete API routes documentation
- [backend-services.md](./backend-services.md) - Backend services and business logic
- [backend-models.md](./backend-models.md) - Data models and schemas

### Additional Resources
- `Documentation/backend-architecture.md` - Backend architecture and design decisions
- `Documentation/frontend-specs.md` - Frontend specifications
- `Documentation/project-overview.md` - Project overview and requirements
- `Backend/RUN_LOCALLY.md` - Instructions for running backend locally
- `Backend/DOCKER.md` - Docker setup instructions
- `Backend/RENDER_DEPLOYMENT.md` - Deployment instructions

## Quick Links

- **Main README**: [../README.md](../README.md)
- **Backend Entry Point**: `Backend/main.py`
- **Frontend Entry Point**: `Frontend/src/app/layout.js`
- **API Base URL**: Configured via `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- **Interactive API Docs**: 
  - Swagger UI: `http://localhost:8000/docs` (when backend is running)
  - ReDoc: `http://localhost:8000/redoc` (when backend is running)

---

**Last Updated**: See git history for latest changes

