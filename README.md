# TOP SPEED - Automotive Platform

A production-grade automotive platform featuring a premium car modification website, secure admin dashboard, interactive car configurator, and AI-powered recommendation engine.

## Features

### Public Website
- Dark automotive theme with cinematic UI
- Real car data from automotive APIs
- Smooth transitions and professional design
- Responsive mobile-first design
- PWA support for offline access

### Admin Dashboard
- Secure JWT-based authentication
- Manage cars, brands, and modifications
- Upload and manage car images
- Control car visibility
- Analytics and insights

### Car Modification Configurator
- Interactive customization tool
- Real-time performance impact calculations
- Multiple modification options:
  - Wheels and tires
  - Body kits
  - Exhaust systems
  - Performance upgrades
- Visual feedback with animations

### AI Recommendation Engine
- Rule-based + scoring system
- Recommend cars based on:
  - Performance preferences
  - Engine type
  - Driving style
  - Modification potential
- Clear recommendation explanations

## Tech Stack

**Frontend:**
- React 18+
- Vite
- Framer Motion
- TailwindCSS
- Lucide Icons (SVG-based)

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL)
- JWT Authentication
- CORS Support

**APIs:**
- API-Ninjas Cars API (real automotive data)
- Real-time data proxy

## Project Structure

```
TOP_SPEED/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   ├── utils/           # Utilities
│   │   ├── styles/          # Global styles
│   │   └── App.jsx
│   └── package.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── services/        # Business logic
│   │   ├── config/          # Configuration
│   │   └── server.js
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project and service-role key
- API-Ninjas API key

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Start development servers:
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Deployment

### Frontend (Vercel)
```bash
npm run build -w frontend
# Deploy via Vercel CLI or git integration
```

### Backend (Render)
```bash
npm run build -w backend
# Deploy via Render dashboard
```

## API Endpoints

### Public APIs
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get car details
- `GET /api/brands` - Get all brands
- `POST /api/recommendations` - Get AI recommendations
- `POST /api/configurator/calculate` - Calculate modification impact

### Admin APIs (Protected)
- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/cars` - Create car
- `PUT /api/admin/cars/:id` - Update car
- `DELETE /api/admin/cars/:id` - Delete car
- `POST /api/admin/modifications` - Manage modifications

## Security

- JWT-based authentication
- Secure password hashing (bcrypt)
- Environment variable protection
- CORS configuration
- Input validation
- Rate limiting

## Design

- Dark automotive theme (black, graphite backgrounds)
- Professional accent colors (red, neon blue, orange)
- Real SVG icons only (no emojis)
- Smooth CSS/Framer Motion animations
- Racing-inspired UI panels

## Footer

"Developed by Programmer Bilal Mohamed"

## License

Proprietary - All rights reserved

---

Built as a production-grade system for enterprise clients in the automotive industry.
"# Top-speed.v7.1"
