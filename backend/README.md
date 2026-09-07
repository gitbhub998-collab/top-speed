# TOP SPEED Backend

Premium automotive platform backend API built with Node.js and Express.

## Features

- Secure JWT authentication for admin panel
- Real automotive API integration (API-Ninjas)
- Car management system
- Modification configurator with performance calculations
- AI-powered recommendation engine
- Supabase database with SQL tables and policies
- CORS enabled for frontend communication
- Production-ready error handling

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **API Client**: Axios
- **Validation**: express-validator

## Project Structure

```
src/
├── config/          # Database configuration
├── services/        # Supabase data access layer
├── controllers/     # Route handlers
├── routes/          # API routes
├── middleware/      # Express middleware
├── services/        # Business logic
│   ├── carApiService.js        # API-Ninjas integration
│   └── recommendationEngine.js # AI recommendation logic
└── utils/           # Utility functions
    ├── auth.js              # JWT utilities
    └── performanceCalculator.js # Modification impact calculator
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project with the schema in `supabase/schema.sql`
- API-Ninjas API key

### Installation

```bash
npm install
```

### Configuration

Create `.env` file:
```env
BACKEND_PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
API_NINJAS_KEY=your_api_ninjas_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

See `API_DOCS.md` for complete API documentation.

### Public Endpoints
- `GET /api/cars` - Get all visible cars
- `GET /api/cars/:id` - Get car details
- `POST /api/recommendations` - Get AI recommendations
- `POST /api/configurator/calculate` - Calculate modifications impact

### Admin Endpoints (JWT Required)
- `POST /api/auth/login` - Admin login
- `POST /api/cars` - Create car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car
- `POST /api/modifications` - Create modification
- `DELETE /api/modifications/:id` - Delete modification

## Key Features

### 1. Car Management
- Add/edit/delete cars
- Real-time API data import from API-Ninjas
- Visibility control for public website
- Modification tracking

### 2. Recommendation Engine
Intelligent car recommendations based on:
- Performance level
- Engine type preference
- Driving style
- Modification interest

Scoring algorithm considers:
- Horsepower range matching
- Fuel efficiency factors
- Acceleration metrics
- Category preferences

### 3. Performance Calculator
Calculates modification impacts:
- Wheels: +10 HP
- Body Kit: +15 HP
- Exhaust: +20 HP, +25 Nm
- Performance Tuning: +40 HP, +50 Nm

Real-time horsepower, torque, top speed, and acceleration updates.

### 4. Security
- JWT-based authentication
- Password hashing with bcryptjs
- Admin-only routes protected
- CORS configured
- Input validation

## Supabase Data Model

The API uses Supabase PostgreSQL tables defined in `supabase/schema.sql` and the migrations folder. It does not require MongoDB or Mongoose.

### User
```javascript
{
  email: String,
  password: String (hashed),
  role: 'admin' | 'user',
  isActive: Boolean,
  timestamps: true
}
```

### Car
```javascript
{
  brand: String,
  model: String,
  year: Number,
  engine: { displacement, cylinders, type },
  horsepower: Number,
  torque: Number,
  fuelType: String,
  drivetrain: String,
  acceleration: Number,
  topSpeed: Number,
  category: String,
  isVisible: Boolean,
  timestamps: true
}
```

### Modification
```javascript
{
  carId: ObjectId,
  type: 'wheels' | 'bodyKit' | 'exhaust' | 'performance',
  name: String,
  price: Number,
  horsepower: Number,
  torque: Number,
  timestamps: true
}
```

## API Integration

### API-Ninjas Cars API
```javascript
// Fetch cars by brand
getCarsByBrand('BMW')
// Returns: Array of 10 cars with full specs

// Fetch specific car
getCarByModel('BMW', 'M340i')
// Returns: Single car object with specs
```

Real automotive data includes:
- Engine displacement
- Cylinder count
- Horsepower
- Torque
- Fuel type
- Drivetrain
- Acceleration
- Top speed

## Middleware

### authMiddleware
Validates JWT token and attaches user to request

### adminMiddleware
Extends authMiddleware and checks for admin role

### errorHandler
Global error handling middleware

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| BACKEND_PORT | Server port | 5000 |
| SUPABASE_URL | Supabase project URL | required |
| SUPABASE_ANON_KEY | Supabase anonymous key | required |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service-role key | required |
| JWT_SECRET | JWT signing secret | required |
| API_NINJAS_KEY | API-Ninjas key | required |
| NODE_ENV | Environment | development |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Error Handling

All errors return consistent JSON:
```json
{
  "error": "Descriptive error message"
}
```

Status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Considerations

1. **Authentication**: JWT with expiration
2. **Authorization**: Role-based access control
3. **Password Security**: bcryptjs with salt rounds
4. **Data Validation**: Input validation on all endpoints
5. **CORS**: Configured for trusted origins only
6. **Environment Variables**: Sensitive data in .env

## Deployment

### Vercel (Serverless)

**Requirements:**
- Vercel account connected to GitHub
- Supabase project with the required schema and keys
- All environment variables configured

**Steps:**

1. **Deploy Backend to Vercel**
   ```bash
   vercel --prod
   ```

2. **Add Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`:
     - `JWT_SECRET`: Your JWT secret key
    - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
    - `SMTP_USER` & `SMTP_PASS`: Gmail SMTP credentials for email notifications
     - `FRONTEND_URL`: Your Vercel frontend URL
     - `NODE_ENV`: Set to `production`

3. **Redeploy after adding env vars**
   ```bash
   vercel --prod
   ```

4. **Get your Vercel Backend URL**
   - Example: `https://top-speed-backend.vercel.app`
   - Use this URL in Frontend `VITE_API_URL`

### Render.com

1. Connect GitHub repository
2. Select backend folder as root
3. Set environment variables in Render dashboard
4. Auto-deploys on git push

### Docker (Optional)

```bash
docker build -t topspeed-backend .
docker run -p 5000:5000 --env-file .env topspeed-backend
```

## Performance Tips

1. Add connection pooling for high traffic
2. Implement API response caching
3. Add rate limiting to prevent abuse
4. Add indexes to frequently queried Supabase columns
5. Use pagination for large result sets

## Monitoring

Integrate with:
- Sentry for error tracking
- Datadog for performance monitoring
- LogRocket for session replay

## Contributing

1. Follow existing code style
2. Add tests for new features
3. Update API documentation
4. Ensure backward compatibility

## License

Proprietary - All rights reserved

---

Built as a production-grade system for enterprise automotive clients.
