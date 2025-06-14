# ReAuth Flow

A modern React Router v7 frontend application with comprehensive authentication features including user registration, OTP verification, login, and secure logout functionality.

## Features

### 🔐 Separate Authentication Backend Microservice
- **User Registration** - Email-based registration with OTP verification
- **Login Flow** - Secure login with OTP verification
- **Session Management** - localStorage-based session handling with CSRF protection
- **Secure Logout** - Proper session cleanup with API integration
- **Protected Routes** - Dashboard with authentication guards

### 🛠️ Technical Features
- **React Router v7** - Modern routing with SSR support
- **TypeScript** - Type-safe development
- **API Integration** - RESTful API client with CSRF token handling
- **Session Storage** - Secure localStorage-based session management
- **Error Handling** - Comprehensive error states and user feedback
- **Hot Module Replacement (HMR)** - Fast development experience

### 🎨 UI/UX
- **TailwindCSS** - Modern, responsive styling
- **Loading States** - Smooth user experience with loading indicators
- **Error Messages** - Clear user feedback for all error states
- **Debug Components** - Development tools for session and CSRF debugging

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- Backend API server running on `localhost:8090` (optional for development)

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Backend Integration

This frontend is designed to work with a backend API server. Configure the API base URL in:

```typescript
// app/lib/config.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8090",
  // ...
}
```

## Architecture

### Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── DebugCSRF.tsx    # CSRF token debugging
│   └── DebugSession.tsx # Session debugging
├── lib/                 # Core utilities and services
│   ├── api.ts          # API client with CSRF handling
│   ├── auth-examples.ts # High-level auth flow functions
│   ├── config.ts       # Configuration and API endpoints
│   ├── csrf.ts         # CSRF token management
│   └── session-storage.ts # Session management utilities
├── routes/             # Application routes
│   ├── _index.tsx     # Home page
│   ├── login.tsx      # Login page
│   ├── register.tsx   # Registration page
│   ├── verify-otp.tsx # OTP verification page
│   ├── dashboard.tsx  # Protected dashboard
│   └── logout.tsx     # Logout handler
└── welcome/           # Welcome components
```

### Authentication Flow

1. **Registration**: `/register`
   - User enters email
   - OTP sent to email
   - Redirects to OTP verification

2. **OTP Verification**: `/verify-otp`
   - User enters received OTP
   - Creates authenticated session
   - Redirects to dashboard

3. **Login**: `/login`
   - User enters email
   - OTP sent to email
   - Redirects to OTP verification

4. **Dashboard**: `/dashboard`
   - Protected route requiring valid session
   - Displays user information
   - Logout functionality

5. **Logout**: `/logout`
   - Clears session data
   - Calls logout API endpoint
   - Redirects to home page

### API Integration

The frontend integrates with backend APIs:

- **POST /register** - User registration
- **POST /login** - User login
- **POST /verify-otp** - OTP verification
- **POST /logout** - User logout (with session token and email)

All API calls include:
- CSRF token protection
- Session token authentication
- Comprehensive error handling

### Session Management

- **Storage**: localStorage-based session storage
- **Security**: CSRF tokens for all state-changing operations
- **Expiration**: Automatic session validation and cleanup
- **Debugging**: Built-in debug components for development

## Building for Production

Create a production build:

```bash
npm run build
```

## Environment Variables

```bash
# Optional: Override default API base URL
VITE_API_BASE_URL=http://your-api-server.com
```

## Development Tools

### Debug Components

The app includes debug components for development:

- **DebugSession** - Shows current session state, user data, and expiration
- **DebugCSRF** - Shows CSRF token status and validity

These components are only visible in development and help debug authentication issues.

### API Client Features

- Automatic CSRF token handling
- Session token injection
- Response data parsing and storage
- Comprehensive error handling
- Request/response logging

## Security Features

- **CSRF Protection** - All state-changing requests include CSRF tokens
- **Session Validation** - Automatic session expiration checking
- **Secure Storage** - Proper session data management
- **Error Boundaries** - Graceful error handling throughout the app

## Browser Support

- Modern browsers with ES2020+ support
- localStorage API required for session management

---
