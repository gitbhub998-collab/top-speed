# TOP SPEED Backend API Documentation

## Base URL
```
http://localhost:5000/api
Production: https://topspeed-backend.onrender.com/api
```

## Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with admin credentials
```json
Request:
{
  "email": "admin@topspeed.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@topspeed.com",
    "role": "admin"
  }
}
```

#### POST /auth/register
Create new admin account
```json
Request:
{
  "email": "newadmin@topspeed.com",
  "password": "securepassword"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newadmin@topspeed.com",
    "role": "admin"
  }
}
```

---

### Cars

#### GET /cars
Fetch all public cars
```
Query Parameters:
- brand: string (optional)
- isVisible: boolean (default: true)

Response: Array of Car objects
```

#### GET /cars/:id
Get specific car with modifications
```
Response:
{
  "car": { Car object },
  "modifications": [ Modification objects ]
}
```

#### POST /cars (Admin)
Create new car
```json
Request:
{
  "brand": "BMW",
  "model": "M340i",
  "year": 2024,
  "engine": {
    "displacement": 2998,
    "cylinders": 6,
    "type": "Inline 6"
  },
  "horsepower": 382,
  "torque": 500,
  "fuelType": "Petrol",
  "drivetrain": "RWD",
  "acceleration": 4.1,
  "topSpeed": 250,
  "category": "Sedan",
  "price": 65000,
  "isVisible": true
}

Response: Created Car object
```

#### PUT /cars/:id (Admin)
Update car
```json
Request: Partial Car object with fields to update

Response: Updated Car object
```

#### DELETE /cars/:id (Admin)
Delete car and its modifications
```
Response:
{
  "message": "Car deleted successfully"
}
```

#### POST /cars/admin/import (Admin)
Import cars from API-Ninjas
```json
Request:
{
  "brand": "BMW"
}

Response:
{
  "message": "Imported 3 new cars",
  "cars": [ Car objects ]
}
```

---

### Modifications

#### GET /modifications
Fetch modifications
```
Query Parameters:
- carId: ObjectId (optional)
- type: string (optional - wheels, bodyKit, exhaust, performance)

Response: Array of Modification objects
```

#### POST /modifications (Admin)
Create modification
```json
Request:
{
  "carId": "507f1f77bcf86cd799439011",
  "type": "exhaust",
  "name": "High-Flow Exhaust",
  "description": "Performance exhaust system",
  "price": 1500,
  "horsepower": 20,
  "torque": 25,
  "topSpeedImpact": 10,
  "isAvailable": true
}

Response: Created Modification object
```

#### PUT /modifications/:id (Admin)
Update modification
```
Response: Updated Modification object
```

#### DELETE /modifications/:id (Admin)
Delete modification
```
Response:
{
  "message": "Modification deleted successfully"
}
```

---

### Packages

#### GET /packages
Fetch active modification packages.

#### GET /packages/admin/all (Admin)
Fetch all packages, including inactive packages.

#### GET /packages/:id
Fetch one package and its modification IDs.

#### POST /packages (Admin)
Create a package with `name`, optional `description`, `price`, `discountPercentage`, `imageUrl`, `isActive`, and a `modificationIds` array of UUIDs.

#### PUT /packages/:id (Admin)
Update package fields. Sending `modificationIds` replaces the package contents.

#### DELETE /packages/:id (Admin)
Delete a package. Its rows in `package_modifications` are removed by cascade; modifications themselves are preserved.

### Recommendations

#### POST /recommendations
Get AI recommendations
```json
Request:
{
  "performanceLevel": "high",
  "engineType": "Petrol",
  "drivingStyle": "performance",
  "modificationInterest": "high"
}

Response: Array of Recommendations
[
  {
    "carName": "BMW M340i",
    "matchScore": 95,
    "topReasons": [
      "Perfect performance match",
      "Excellent for performance driving"
    ],
    "specs": {
      "horsepower": 382,
      "topSpeed": 250,
      "acceleration": 4.1,
      "fuelType": "Petrol",
      "drivetrain": "RWD"
    }
  }
]
```

---

### Configurator

#### POST /configurator/calculate
Calculate modification impact
```json
Request:
{
  "carId": "507f1f77bcf86cd799439011",
  "modifications": ["wheels", "exhaust", "performance"]
}

Response:
{
  "baseHorsepower": 382,
  "modifiedHorsepower": 437,
  "horsepowergain": 55,
  "baseTorque": 500,
  "modifiedTorque": 600,
  "torqueGain": 100,
  "baseTopSpeed": 250,
  "modifiedTopSpeed": 275,
  "topSpeedIncrease": 25,
  "baseAcceleration": 4.1,
  "modifiedAcceleration": 3.5,
  "accelerationImprovement": 0.6,
  "totalPrice": 8500,
  "modifications": ["wheels", "exhaust", "performance"]
}
```

---

### Health Check

#### GET /health
Check backend status
```
Response:
{
  "status": "Backend is running"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message describing the issue"
}
```

### Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## Rate Limiting
Currently unlimited. For production, implement:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

---

## Data Models

### Car
```javascript
{
  _id: ObjectId,
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
  imageUrl: String,
  category: String,
  price: Number,
  isVisible: Boolean,
  apiSource: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  role: String (admin, user),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Modification
```javascript
{
  _id: ObjectId,
  carId: ObjectId,
  type: String,
  name: String,
  description: String,
  price: Number,
  horsepower: Number,
  torque: Number,
  topSpeedImpact: Number,
  imageUrl: String,
  isAvailable: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Setup & Running

### Local Development
```bash
cd backend
npm install
cp .env.example .env
# Configure .env with your settings
npm run dev
```

### Production
```bash
npm run build
npm start
```

---

Built with production-grade architecture.
