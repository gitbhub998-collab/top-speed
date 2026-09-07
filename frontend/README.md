# TOP SPEED Frontend

Premium React-based frontend for the TOP SPEED automotive platform.

## Features

- Responsive dark automotive theme
- Real-time car catalog with filters
- Interactive car configurator with performance calculations
- AI-powered recommendation engine
- Secure admin dashboard
- PWA support (installable on mobile)
- Smooth animations with Framer Motion
- Service worker for offline support
- Production-optimized build

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React (SVG-based)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Animations.jsx  # Motion components
│   ├── Layout.jsx      # Header, Footer
│   └── Navigation.jsx  # Main navigation
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── CarsPage.jsx
│   ├── RecommendationsPage.jsx
│   ├── ConfiguratorPage.jsx
│   ├── LoginPage.jsx
│   └── AdminPage.jsx
├── hooks/             # Custom hooks
│   └── useAuth.js
├── services/          # API integration
│   └── api.js
├── contexts/          # React contexts
│   └── AuthContext.jsx
├── styles/            # Global styles
│   └── globals.css
├── utils/             # Utilities
├── App.jsx
└── main.jsx
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output in `dist/` directory

### Preview Production Build

```bash
npm run preview
```

## Pages

### Home Page (`/`)
- Hero section with call-to-action
- Featured cars carousel
- Feature highlights
- Navigation to other sections

### Cars Page (`/cars`)
- Full car catalog
- Filter by brand
- Car specifications display
- Direct link to configurator

### Configurator Page (`/configurator`)
- Interactive modification selector
- Real-time performance impact calculation
- Visual feedback with animations
- Horsepower, torque, top speed updates
- Modification breakdown with pricing

### Recommendations Page (`/recommendations`)
- AI recommendation engine interface
- Performance level selector
- Engine type preference
- Driving style selection
- Modification interest level
- Match score with detailed reasons

### Admin Dashboard (`/admin`)
- Secure login required
- Car management
  - Add new cars
  - Edit car details
  - Delete cars
  - Toggle visibility
- Modification management
- Protected routes

### Login Page (`/login`)
- Email/password authentication
- Error messaging
- JWT token storage

## Components

### AnimatedButton
Interactive button with hover and tap effects
```jsx
<AnimatedButton onClick={handleClick} variant="primary">
  Click Me
</AnimatedButton>
```

### AnimatedCard
Card with fade-in animation on scroll
```jsx
<AnimatedCard delay={0.1}>
  Content here
</AnimatedCard>
```

### Navigation
Sticky header with responsive mobile menu
```jsx
<Navigation />
```

### Header
Page header with title and subtitle
```jsx
<Header title="Page Title" subtitle="Subtitle" />
```

### Footer
Footer with company info and links
```jsx
<Footer />
```

## Custom Hooks

### useAuth()
Provides authentication context
```javascript
const { user, token, login, logout } = useAuth();
```

### useAsync()
Handles async operations with loading/error states
```javascript
const { data, loading, error, execute } = useAsync(apiFunction);
```

## API Integration

Axios configured with:
- Base URL from environment variables
- Automatic token injection in headers
- 10-second timeout
- CORS support

### Services

```javascript
// Cars
carService.getAllCars()
carService.getCarById(id)
carService.createCar(data)
carService.updateCar(id, data)
carService.deleteCar(id)

// Modifications
modificationService.getModifications(carId, type)
modificationService.createModification(data)

// Recommendations
recommendationService.getRecommendations(preferences)

// Configurator
configuratorService.calculateConfiguration(carId, mods)

// Auth
authService.login(email, password)
authService.register(email, password)
```

## Styling

### TailwindCSS
Utility-first CSS framework configured with:
- Dark theme (default)
- Custom colors (red-600, blue-600, gray palette)
- Responsive breakpoints

### Global CSS
`src/styles/globals.css` includes:
- Dark scrollbar styling
- Gradient text utility
- Glass effect utility
- Custom animations (fadeIn, slideDown, pulse-glow)

## Animations

### Framer Motion
Smooth animations for:
- Page transitions
- Button interactions
- Card reveal on scroll
- Navigation menu transitions
- Modal animations

### CSS Animations
- Custom keyframe animations
- Transition utilities
- Transform on hover

## PWA Support

### Service Worker
- Caches app shell on install
- Offline support for navigation
- Stale-while-revalidate strategy
- API calls still require network

### Manifest
- App name: TOP SPEED
- Icons for different sizes
- Standalone display mode
- Theme color (black)
- Background color (black)

### Installation
- Install button in browser URL bar
- Add to home screen on mobile
- App-like experience

## Authentication

### JWT Token
- Stored in localStorage
- Automatically sent with requests
- Auto-decoded on app load
- Cleared on logout

### Protected Routes
Admin routes require:
- Valid token
- Admin role
- Redirects to login if unauthorized

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Performance Optimizations

1. **Code Splitting**: React Router lazy loading
2. **Image Optimization**: Lazy loading images
3. **Caching**: Service worker asset caching
4. **Minification**: Vite production build
5. **Tree Shaking**: Unused code removal
6. **Bundle Analysis**: Check build size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Focus indicators

## Development Tips

### Testing Components
Use React Developer Tools browser extension

### Debugging
- Console logging
- React DevTools
- Network tab in DevTools
- Vite HMR for fast refresh

### Performance Profiling
- React Profiler in DevTools
- Lighthouse audit
- Bundle analyzer

## Deployment

### Vercel
Recommended for best performance and integration:
```bash
vercel
```

Auto-deploys on git push to main branch.

### Other Platforms
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Custom server

## Building

```bash
npm run build
# Creates optimized production build in dist/

npm run preview
# Test production build locally
```

## Contributing

1. Follow React best practices
2. Use functional components with hooks
3. Keep components small and focused
4. Add prop types or TypeScript
5. Update components documentation

## Troubleshooting

### CORS Errors
- Check backend CORS configuration
- Verify VITE_API_URL environment variable
- Ensure backend is running

### Token Issues
- Clear localStorage
- Re-login to get fresh token
- Check JWT_SECRET on backend

### API Integration
- Check Network tab in DevTools
- Verify API endpoint exists
- Confirm request format matches

## License

Proprietary - All rights reserved

---

Built with production-grade architecture for enterprise automotive clients.
