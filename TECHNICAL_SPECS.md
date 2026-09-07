# TOP SPEED - Technical Specifications

**Complete Technical Documentation**

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Firefox, Safari, Edge)                    │
│  Mobile Device (iOS Safari, Android Chrome)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND LAYER (Vercel CDN)                    │
├─────────────────────────────────────────────────────────────────┤
│  React 18 Application                                           │
│  ├── Pages (6)                                                  │
│  ├── Components (15+)                                           │
│  ├── Services (API Client)                                      │
│  └── State (Context API + Hooks)                                │
│  Technologies: Vite, TailwindCSS, Framer Motion, Lucide         │
│  Build: Static assets optimized for CDN                         │
│  PWA: Service Worker + Manifest for offline support             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER (Render)                    │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server                                              │
│  ├── CORS Middleware                                            │
│  ├── Authentication (JWT)                                       │
│  ├── Routes (25+ endpoints)                                     │
│  │   ├── /api/auth (login, register)                            │
│  │   ├── /api/cars (CRUD operations)                            │
│  │   ├── /api/modifications (management)                        │
│  │   ├── /api/recommendations (AI engine)                       │
│  │   └── /api/configurator (performance calc)                   │
│  └── Error Handler                                              │
│  Port: 5000                                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐   ┌────────────────┐  ┌──────────────┐
    │   MongoDB   │   │ API-Ninjas     │  │ Environment  │
    │   Database  │   │ Cars API       │  │ Variables    │
    │  (Atlas)    │   │ (Automotive)   │  │  (Secrets)   │
    └─────────────┘   └────────────────┘  └──────────────┘
```

---

## Component Hierarchy

### Frontend Component Tree

```
App
├── Router
│   ├── HomePage
│   │   ├── Navigation
│   │   ├── Hero Section
│   │   ├── Featured Cars (AnimatedCard x3)
│   │   └── Footer
│   ├── CarsPage
│   │   ├── Navigation
│   │   ├── Header
│   │   ├── Brand Filter Buttons
│   │   ├── Car Grid
│   │   │   └── AnimatedCard x n
│   │   └── Footer
│   ├── ConfiguratorPage
│   │   ├── Navigation
│   │   ├── Header
│   │   ├── Car Specifications
│   │   ├── Modification Options
│   │   ├── Calculate Button
│   │   ├── Impact Display
│   │   └── Footer
│   ├── RecommendationsPage
│   │   ├── Navigation
│   │   ├── Filters Form
│   │   ├── Recommendations Grid
│   │   │   └── AnimatedCard x n
│   │   └── Footer
│   ├── LoginPage
│   │   ├── Navigation
│   │   ├── Login Form
│   │   └── Footer
│   └── AdminPage
│       ├── Navigation
│       ├── Tabs
│       ├── Car Management Form
│       ├── Car List
│       ├── Modification List
│       └── Footer
└── AuthProvider (Context)
    └── Token & User State
```

---

## Database Schema Design

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'user']),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Car Collection
```javascript
{
  _id: ObjectId,
  brand: String (required),
  model: String (required),
  year: Number (required),
  engine: {
    displacement: Number,
    cylinders: Number,
    type: String
  },
  horsepower: Number (required),
  torque: Number (required),
  fuelType: String (enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric']),
  drivetrain: String (enum: ['RWD', 'FWD', 'AWD', '4WD']),
  acceleration: Number (0-100 km/h in seconds),
  topSpeed: Number (required),
  imageUrl: String,
  category: String (enum: [...]),
  price: Number,
  description: String,
  isVisible: Boolean (default: true),
  modificationPotential: {
    wheels: { minHp, maxHp },
    bodyKit: { minHp, maxHp },
    exhaust: { minHp, maxHp, torqueBoost },
    performance: { minHp, maxHp, torqueBoost }
  },
  apiSource: String,
  externalId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Modification Collection
```javascript
{
  _id: ObjectId,
  carId: ObjectId (ref: 'Car'),
  type: String (enum: ['wheels', 'bodyKit', 'exhaust', 'performance']),
  name: String (required),
  description: String,
  price: Number,
  horsepower: Number,
  torque: Number,
  topSpeedImpact: Number,
  imageUrl: String,
  isAvailable: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Configuration Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  carId: ObjectId (ref: 'Car'),
  modifications: {
    wheels: ObjectId,
    bodyKit: ObjectId,
    exhaust: ObjectId,
    performance: ObjectId
  },
  totalPrice: Number,
  performanceStats: {
    horsepower: Number,
    torque: Number,
    topSpeed: Number,
    acceleration: Number
  },
  visualizationUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Brand Collection
```javascript
{
  _id: ObjectId,
  name: String (unique, required),
  country: String,
  logoUrl: String,
  description: String,
  website: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoint Reference

### Authentication Endpoints

#### POST /api/auth/login
```
Request:
{
  email: string,
  password: string
}

Response (200):
{
  token: string (JWT),
  user: {
    id: string,
    email: string,
    role: string
  }
}

Errors:
- 400: Missing email/password
- 401: Invalid credentials
```

#### POST /api/auth/register
```
Request:
{
  email: string,
  password: string
}

Response (201):
{
  token: string,
  user: { id, email, role }
}

Errors:
- 400: User already exists
```

### Car Endpoints

#### GET /api/cars
```
Query Parameters:
- brand?: string
- isVisible?: boolean (default: true)

Response (200):
[
  {
    _id: string,
    brand: string,
    model: string,
    horsepower: number,
    ...
  }
]

Response Size: Up to 100 cars
```

#### GET /api/cars/:id
```
Response (200):
{
  car: { Car object },
  modifications: [ Modification objects ]
}

Errors:
- 404: Car not found
```

#### POST /api/cars (Protected - Admin)
```
Request:
{
  brand: string,
  model: string,
  year: number,
  horsepower: number,
  ...
}

Response (201):
{ Car object }

Errors:
- 401: No token
- 403: Not admin
- 400: Validation error
```

#### PUT /api/cars/:id (Protected - Admin)
```
Response (200):
{ Updated Car object }
```

#### DELETE /api/cars/:id (Protected - Admin)
```
Response (200):
{ message: "Car deleted successfully" }
```

#### POST /api/cars/admin/import (Protected - Admin)
```
Request:
{
  brand: string
}

Response (201):
{
  message: "Imported N new cars",
  cars: [ Car objects ]
}
```

### Modification Endpoints

#### GET /api/modifications
```
Query:
- carId?: string
- type?: string

Response: [ Modification objects ]
```

#### POST /api/modifications (Protected)
```
Request:
{
  carId: string,
  type: string,
  name: string,
  price: number,
  horsepower: number,
  ...
}

Response (201): { Modification object }
```

#### PUT /api/modifications/:id (Protected)
```
Response (200): { Updated Modification }
```

#### DELETE /api/modifications/:id (Protected)
```
Response (200): { message }
```

### Recommendation Endpoint

#### POST /api/recommendations
```
Request:
{
  performanceLevel: string,
  engineType?: string,
  drivingStyle: string,
  modificationInterest: string
}

Response (200):
[
  {
    carName: string,
    matchScore: number,
    topReasons: string[],
    specs: { ... }
  }
]
```

### Configurator Endpoint

#### POST /api/configurator/calculate
```
Request:
{
  carId: string,
  modifications: string[]
}

Response (200):
{
  baseHorsepower: number,
  modifiedHorsepower: number,
  horsepowergain: number,
  baseTorque: number,
  modifiedTorque: number,
  torqueGain: number,
  baseTopSpeed: number,
  modifiedTopSpeed: number,
  topSpeedIncrease: number,
  baseAcceleration: number,
  modifiedAcceleration: number,
  accelerationImprovement: number,
  totalPrice: number,
  modifications: string[]
}
```

---

## Authentication Flow

### Login Process
```
User inputs email/password
          ↓
POST /api/auth/login
          ↓
Backend validates credentials
          ↓
Password match? (bcryptjs compare)
    ├─ No → Return 401 Unauthorized
    └─ Yes → Generate JWT token
          ↓
Return token + user object
          ↓
Frontend stores token in localStorage
          ↓
Token automatically sent in Authorization header
```

### Protected Request Flow
```
Frontend makes request
          ↓
axios interceptor adds Authorization header
  Authorization: Bearer <token>
          ↓
Backend authMiddleware validates token
          ↓
Token valid? (jwt.verify)
    ├─ No → Return 401 Unauthorized
    └─ Yes → Decode and attach to request
          ↓
Check admin role (adminMiddleware)
    ├─ Not admin → Return 403 Forbidden
    └─ Is admin → Process request
          ↓
Return response
```

---

## Algorithm Specifications

### Recommendation Scoring Algorithm

```javascript
score = 0
reasons = []

// Performance Matching (0-30 points)
performanceRange = getPerformanceRange(userLevel)
if (car.hp >= range.min && car.hp <= range.max) {
  score += 30
  reasons.push("Perfect performance match")
} else if (close range) {
  score += 15
  reasons.push("Good performance match")
}

// Engine Type (0-20 points)
if (car.fuelType matches userPreference) {
  score += 20
  reasons.push("Matches fuel preference")
}

// Driving Style (0-25 points)
if (drivingStyle === 'performance') {
  if (car.hp > 300) score += 20
  if (car.acceleration < 7) score += 15
} else if (style === 'efficiency') {
  if (car.fuelType === 'Hybrid' || 'Electric') score += 25
}
// ... more conditions for other styles

// Modification Potential (0-20 points)
if (modInterest === 'high' && car.hp < 400) score += 20
else if (modInterest === 'medium') score += 10

// Category Bonus (0-15 points)
if (car.category matches drivingStyle preference) {
  score += 15
}

// Results
returnTopCarsBy(score, limit=6)
```

### Performance Impact Calculator

```javascript
baseHP = car.horsepower
baseTorque = car.torque
totalHP = baseHP
totalTorque = baseTorque
totalPrice = 0

modificationImpact = {
  wheels: { hp: 10, torque: 5, topSpeed: 5, price: 2000 },
  bodyKit: { hp: 15, torque: 10, topSpeed: 8, price: 3000 },
  exhaust: { hp: 20, torque: 25, topSpeed: 10, price: 1500 },
  performance: { hp: 40, torque: 50, topSpeed: 15, price: 5000 }
}

for each selectedModification:
  totalHP += modificationImpact[mod].hp
  totalTorque += modificationImpact[mod].torque
  totalPrice += modificationImpact[mod].price
  topSpeedIncrease += modificationImpact[mod].topSpeed

newAcceleration = max(2.0, baseAcceleration - (hpGain / 50))

return {
  hpGain: totalHP - baseHP,
  torqueGain: totalTorque - baseTorque,
  topSpeedIncrease,
  accelerationImprovement: baseAcceleration - newAcceleration,
  totalPrice
}
```

---

## Error Handling Strategy

### Error Response Format
```javascript
{
  error: string (descriptive message),
  status: number (HTTP status code)
}
```

### HTTP Status Codes
- 200: Successful GET/PUT/DELETE
- 201: Successful POST (resource created)
- 400: Bad Request (validation error)
- 401: Unauthorized (no/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

### Error Handling Middleware
```javascript
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
  let status = err.status || 500
  let message = err.message || 'Internal server error'
  
  // Log for monitoring
  // Send error response
  res.status(status).json({ error: message })
})
```

---

## Security Specifications

### Password Security
- Algorithm: bcryptjs
- Salt Rounds: 10
- Hashing: One-way (never stored plain)
- Verification: compare() method

### JWT Token
- Algorithm: HS256
- Expiration: 7 days
- Payload: { userId, role }
- Storage: localStorage (frontend)
- Transmission: Authorization header

### CORS Policy
```javascript
cors({
  origin: [
    'http://localhost:5173',      // Dev
    'http://localhost:3000',      // Alt dev
    'https://topspeed-frontend.vercel.app' // Prod
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Input Validation
- Email: RFC 5322 standard
- Password: Min 8 chars (recommended)
- Numeric fields: Type checking
- String fields: Length limits
- Enum fields: Whitelist validation

---

## Performance Specifications

### Frontend
- Bundle Size: ~200KB gzipped
- Initial Load: <2 seconds
- Time to Interactive: <3 seconds
- Lighthouse Score: 90+
- Mobile Score: 85+

### Backend
- Response Time: <100ms average
- Database Query: <50ms average
- Concurrency: 100+ simultaneous
- Connection Pooling: 10 connections
- Rate Limit: Ready to implement

### Database
- Indexes: On brand, model, isVisible
- Query Optimization: Lean queries
- Connection: MongoDB Atlas optimized
- Backup: Daily automatic

---

## Deployment Specifications

### Frontend (Vercel)
- Build Command: `npm run build`
- Output Directory: `dist/`
- Framework: Vite
- Environment: Automatic from .env
- CDN: Vercel Edge Network
- SSL: Automatic HTTPS
- Deployment: Git-based automatic

### Backend (Render)
- Language: Node.js
- Node Version: 18.x
- Start Command: `node src/server.js`
- Environment: Render dashboard
- Scaling: Automatic
- SSL: Automatic HTTPS
- Monitoring: Render logs

### Database
- Provider: MongoDB Atlas
- Tier: M0 free or paid
- Backup: Daily automatic
- Encryption: TLS in transit
- Access: IP whitelist

---

## Monitoring & Logging

### Frontend Monitoring
- Browser console for errors
- Network tab for API calls
- Lighthouse for performance
- Mobile device testing

### Backend Logging
```javascript
// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Error logging
catch (error) {
  console.error('Error:', error.message)
}
```

### Database Monitoring
- MongoDB Atlas dashboard
- Query performance metrics
- Connection pool status
- Storage usage

---

## Testing Specifications

### API Testing
- Use Postman or curl
- Test all endpoints
- Validate request/response
- Check error handling
- Verify authentication

### Frontend Testing
- Component rendering
- User interactions
- Form validation
- Authentication flow
- Responsive design

### Security Testing
- SQL injection (N/A - MongoDB)
- XSS prevention
- CSRF protection
- Token validation
- Authorization checks

---

## Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Load balancing ready
- Database connection pooling
- Caching strategy

### Vertical Scaling
- Optimized queries
- Efficient algorithms
- Memory management
- CPU optimization

### Future Enhancements
- Redis caching
- CDN optimization
- Database sharding
- Microservices architecture

---

## Compliance & Standards

### Web Standards
- REST API principles
- HTTP/2 protocol
- JSON data format
- OAuth 2.0 compatible

### Security Standards
- Password hashing (OWASP)
- JWT (RFC 7519)
- CORS (W3C)
- HTTPS/TLS 1.2+

### Code Standards
- ES6+ JavaScript
- React best practices
- Node.js conventions
- MongoDB schema design

---

## Implementation Details

### Frontend Stack
```json
{
  "react": "18.2.0",
  "vite": "5.0.0",
  "tailwindcss": "3.3.5",
  "framer-motion": "10.16.4",
  "lucide-react": "0.263.1",
  "axios": "1.5.0"
}
```

### Backend Stack
```json
{
  "express": "4.18.2",
  "mongoose": "7.5.0",
  "jsonwebtoken": "9.1.0",
  "bcryptjs": "2.4.3",
  "axios": "1.5.0"
}
```

---

## Support & Maintenance

### Documentation
- API_DOCS.md for endpoints
- README files in each folder
- DEPLOYMENT.md for setup
- Code comments for logic

### Troubleshooting
- Check error messages
- Review logs
- Verify environment variables
- Test API endpoints

---

**Complete Technical Specifications for TOP SPEED Platform**

All systems documented and production-ready.
