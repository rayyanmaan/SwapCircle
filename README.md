# SwapCircle

## 📖 Overview
SwapCircle is a campus clothing exchange platform that enables students to buy, sell, and swap clothing items within their university community. The platform promotes sustainable fashion and helps students save money while refreshing their wardrobes.

## ✨ Features
- **User Authentication**: Secure login and registration for students
- **Item Listings**: Post clothing items for sale or swap
- **Search & Filter**: Find items by category, size, brand, and more
- **In-App Messaging**: Communicate directly with other users
- **Campus Verification**: Ensure transactions happen within trusted university communities
- **Favorites**: Save items you're interested in
- **User Profiles**: View seller ratings and transaction history

## 🛠️ Tech Stack
### Frontend
- **Framework**: Next.js 15.5.6 (with Turbopack)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS v4
- **Linting**: ESLint with Next.js config

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Configuration**: Pydantic Settings
- **Architecture**: RESTful API with async/await support

### Infrastructure
- **Hosting**: [TBD]
- **Storage**: [TBD]

## 🚀 Getting Started

### Prerequisites
- **Docker Desktop** (or Docker Engine + docker compose plugin) - **Recommended**
- **Node.js** v18+ (for manual Frontend setup)
- **Python** 3.9+ (for manual Backend setup)
- **MongoDB** (local installation or MongoDB Atlas account - for manual setup)

### Quick Start with Docker Compose (Recommended)

The easiest way to run SwapCircle is using Docker Compose, which sets up all services automatically.

1. **Clone the repository**
   ```bash
   git clone https://github.com/rayyanmaan/SwapCircle.git
   cd SwapCircle
   ```

2. **Set up environment variables**
   
   Create `Backend/.env.local` file in the `Backend` directory:
   ```bash
   cd Backend
   # Create .env.local file with the following variables:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/swapcircle
   # For remote MongoDB Atlas, keep TLS enabled (automatic with mongodb+srv://)
   # For local MongoDB fallback, the system will automatically use mongodb://mongo:27017/swapcircle
   MONGODB_TLS=false
   DATABASE_NAME=swapcircle
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=http://localhost:3000
   ```
   
   **Note**: The backend will automatically fallback to the local MongoDB service if the remote connection fails.

   Create `Frontend/.env.local` file in the `Frontend` directory:
   ```bash
   cd Frontend
   # Create .env.local file:
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start all services with Docker Compose**
   ```bash
   # From the repository root
   docker compose up --build
   ```
   
   This will start:
   - **MongoDB** (local service) on port `27017`
   - **Backend API** on `http://localhost:8000`
   - **Frontend** on `http://localhost:3000`

4. **Access the application**
   - **Frontend**: Open `http://localhost:3000` in your browser
   - **Backend API Docs**: 
     - **Swagger UI**: `http://localhost:8000/docs` - Interactive API explorer
     - **ReDoc**: `http://localhost:8000/redoc` - Clean API documentation

5. **Stop the services**
   ```bash
   # Press Ctrl+C or run:
   docker compose down
   ```

### Manual Setup (Alternative)

If you prefer to run services manually without Docker:

1. **Clone the repository**
   ```bash
   git clone https://github.com/rayyanmaan/SwapCircle.git
   cd SwapCircle
   ```

2. **Frontend Setup**
   ```bash
   cd Frontend
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Backend Setup**
   ```bash
   cd Backend
   # Create a virtual environment (recommended)
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env.local` file in the `Backend` directory:
   ```bash
   cd Backend
   # Create .env.local file with the following variables:
   MONGODB_URI=mongodb://localhost:27017/swapcircle
   # Keep TLS disabled for local Mongo, set true only for Atlas
   MONGODB_TLS=false
   DATABASE_NAME=swapcircle
   SECRET_KEY=your-secret-key-here
   CORS_ORIGINS=http://localhost:3000
   ```

5. **Run the development servers**

   **Backend** (in one terminal):
   ```bash
   cd Backend
   uvicorn main:app --reload
   ```
   Backend will run on `http://localhost:8000`
   
   **📚 API Documentation**: Once the backend is running, you can access interactive API documentation at:
   - **Swagger UI**: `http://localhost:8000/docs` - Interactive API explorer
   - **ReDoc**: `http://localhost:8000/redoc` - Clean API documentation

   **Frontend** (in another terminal):
   ```bash
   cd Frontend
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
   Frontend will run on `http://localhost:3000`

6. Open your browser and navigate to `http://localhost:3000`

## 📝 Usage

### For Developers

1. **Read the Code Documentation**: Start with [`codebase/codebase.md`](./codebase/codebase.md) for an overview
2. **Understand the Architecture**: Review `Documentation/backend-architecture.md` and `Documentation/frontend-specs.md`
3. **Check API Documentation**: 
   - See [`codebase/backend-routes.md`](./codebase/backend-routes.md) for all available endpoints
   - **Interactive Docs**: When backend is running, visit `http://localhost:8000/docs` for Swagger UI or `http://localhost:8000/redoc` for ReDoc
4. **Follow Styling Guidelines**: Read [`codebase/styling-guide.md`](./codebase/styling-guide.md) before making UI changes

### For Users

[Add instructions on how to use the platform, including screenshots or GIFs]

## 🗂️ Project Structure
```
SwapCircle/
├── Frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── page.js      # Home page
│   │   │   └── product/     # Product detail pages
│   │   ├── components/      # React components
│   │   │   ├── AuthModal.js
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── HeroSection.js
│   │   │   ├── ListingCard.js
│   │   │   ├── ListingsGrid.js
│   │   │   ├── ProductDetail.js
│   │   │   └── ValueProposition.js
│   │   ├── contexts/        # React contexts (Auth, Notifications)
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   └── styles/          # Global styles and theme
│   ├── public/              # Static assets
│   ├── package.json
│   ├── next.config.mjs      # Next.js configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── eslint.config.mjs    # ESLint configuration
│
├── Backend/                 # FastAPI backend application
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── database/
│   │   └── connection.py    # MongoDB connection helpers
│   ├── models/              # Pydantic data models
│   │   ├── user_model.py
│   │   ├── item_model.py
│   │   ├── swap_request_model.py
│   │   ├── transaction_model.py
│   │   └── rating_model.py
│   ├── routes/              # API route handlers
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── item_routes.py
│   │   ├── swap_routes.py
│   │   ├── message_routes.py
│   │   ├── credit_routes.py
│   │   ├── rating_routes.py
│   │   └── notification_routes.py
│   ├── services/            # Business logic services
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── swap_service.py
│   │   ├── email_service.py
│   │   ├── image_service.py
│   │   ├── credit_service.py
│   │   └── storage_service.py
│   └── utils/               # Utility functions
│       └── constants.py
│
├── codebase/                # Code documentation
│   ├── codebase.md          # Main documentation index
│   ├── components.md        # Frontend component docs
│   ├── api-integration.md   # Frontend-Backend integration
│   ├── theme.md             # Theme and styling guide
│   ├── styling-guide.md     # Styling best practices
│   ├── backend-routes.md   # Backend API routes
│   ├── backend-services.md # Backend services
│   └── backend-models.md   # Backend data models
│
├── Documentation/           # Project documentation
│   ├── backend-architecture.md
│   ├── frontend-specs.md
│   └── project-overview.md
│
└── README.md               # This file
```

## 📚 Code Documentation

For detailed code documentation, see the [`codebase/`](./codebase/) folder:

- **[codebase.md](./codebase/codebase.md)** - Main documentation index with overview and links
- **[components.md](./codebase/components.md)** - Frontend component documentation
- **[api-integration.md](./codebase/api-integration.md)** - Frontend-Backend API integration guide
- **[theme.md](./codebase/theme.md)** - Theme, fonts, and styling information
- **[styling-guide.md](./codebase/styling-guide.md)** - Styling best practices (use utility classes, no inline styles!)
- **[backend-routes.md](./codebase/backend-routes.md)** - Complete backend API routes documentation
- **[backend-services.md](./codebase/backend-services.md)** - Backend services and business logic
- **[backend-models.md](./codebase/backend-models.md)** - Backend data models and schemas

**Before making changes to the codebase, consult the relevant documentation files in the `codebase/` folder to understand the existing implementation.**

## 🧪 Testing
```bash
# Add commands to run tests
```

## 🤝 Contributing
We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

### Code Style
- Follow the existing code style in the project
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License
[Add license information]

## 👥 Team
- **Project Lead**: [Name]
- **Developers**: [Names]
- **Designers**: [Names]

## 📞 Contact
- **Email**: [contact email]
- **Website**: [website if applicable]
- **Issue Tracker**: [GitHub Issues](https://github.com/rayyanmaan/SwapCircle/issues)

## 🙏 Acknowledgments
- [Add any acknowledgments, inspirations, or credits]

## 📊 Project Status
🚧 **Status**: In Development

## 🗺️ Roadmap
- [ ] User authentication system
- [ ] Item listing and management
- [ ] Search and filtering functionality
- [ ] Messaging system
- [ ] Payment integration
- [ ] Mobile app development
- [ ] Admin dashboard

---

**Note**: This project is currently under active development. Features and documentation will be updated regularly!
