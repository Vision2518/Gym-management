# Vendor Panel

A complete vendor management dashboard built with React, Redux, and Tailwind CSS.

## Features

- **Authentication**: Secure vendor login system
- **Dashboard**: Overview of assigned companies and member statistics
- **Profile Management**: View and edit vendor profile information
- **Modern UI**: Beautiful gradient design with purple/pink theme
- **Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React 19 + Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: React Icons
- **Notifications**: React Toastify

## Project Structure

```
vendor/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── shared/        # Reusable components
│   │   ├── VendorSidebar.jsx
│   │   ├── VendorDashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── Login.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ErrorPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── layout/            # Layout components
│   │   └── VendorLayout.jsx
│   ├── router/            # Routing configuration
│   │   ├── IndexRouter.jsx
│   │   ├── VendorRoutes.jsx
│   │   └── Guard.jsx
│   ├── redux/             # Redux store and slices
│   │   ├── store.js
│   │   └── features/
│   │       ├── authSlice.js
│   │       ├── authState.js
│   │       └── indexSlice.js
│   ├── assets/            # Images and other assets
│   ├── App.jsx           # Main app component
│   ├── App.css           # Global styles
│   └── main.jsx          # Entry point
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md            # This file
```

## Installation

1. Navigate to the vendor directory:
   ```bash
   cd vendor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

The vendor panel connects to the backend API at `http://localhost:5000/api` by default. You can modify this in the `.env` file:

```
VITE_DEV_BACKEND_URL="http://localhost:5000/api"
```

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Endpoints

The vendor panel uses the following API endpoints:

- `POST /vendor/login` - Vendor authentication
- `POST /auth/signout` - Logout
- `GET /vendor/stats` - Dashboard statistics
- `GET /vendor/profile` - Get vendor profile
- `PATCH /vendor/profile` - Update vendor profile

## Browser Access

Once running, access the vendor panel at:
- **Login**: http://localhost:3001
- **Dashboard**: http://localhost:3001/vendor/dashboard
- **Profile**: http://localhost:3001/vendor/profile

## Design Features

- **Color Scheme**: Purple to pink gradient theme
- **Typography**: Clean, modern fonts
- **Animations**: Smooth transitions and hover effects
- **Layout**: Sidebar navigation with responsive design
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Security

- JWT token-based authentication
- Protected routes with authentication guards
- Secure token storage in localStorage
- Automatic token expiration handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)