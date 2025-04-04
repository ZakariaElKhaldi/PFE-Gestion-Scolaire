# School Management Mobile App

This is the mobile application for the School Management System.

## Environment Setup

### Environment Variables

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3001/api
# For physical devices, replace with your computer's IP address:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api

# AI Models Configuration
EXPO_PUBLIC_AI_API_KEY=sk-yourapikey
EXPO_PUBLIC_AI_MODEL=gpt-4-turbo-preview

# Authentication Settings
EXPO_PUBLIC_JWT_SECRET=your-jwt-secret-key
EXPO_PUBLIC_JWT_EXPIRY=7d

# Socket Configuration
EXPO_PUBLIC_SOCKET_URL=http://localhost:3001

# Feature Flags
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=true
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_ENABLE_BACKEND=true

# App Configuration
EXPO_PUBLIC_APP_NAME=School Management
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### Notes:

1. For development on a physical device using Expo Go, you need to use your computer's actual IP address instead of `localhost`.

2. The `EXPO_PUBLIC_ENABLE_BACKEND` flag controls whether the app uses real API calls or mock data. Set to `true` to use the real backend.

3. Make sure your backend server is running on the specified API URL.

## Development

### Prerequisites

- Node.js (v14+)
- Expo CLI (`npm install -g expo-cli`)
- Yarn or npm

### Installation

1. Install dependencies:
```
yarn install
# or
npm install
```

2. Start the development server:
```
yarn start
# or
npm start
```

3. Follow the instructions in the terminal to run the app on your preferred platform (iOS, Android, or web).

## Building for Production

1. For Android:
```
expo build:android
```

2. For iOS:
```
expo build:ios
```

## Authentication

The application supports different user roles:
- Admin
- Teacher
- Student
- Parent

Each role has access to different functionalities within the app. 
 
 
 