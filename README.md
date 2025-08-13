# ProductivePro - Modern Productivity App

A modern, minimal, animated frontend UI/UX for a productivity app built with React, Vite, and Framer Motion.

## Features

✨ **Modern Design**: Clean, minimal dark theme inspired by refero.design
🎨 **Beautiful Typography**: Uses Titillium Web for logos and Open Sans for body text
🌟 **Smooth Animations**: Powered by Framer Motion for delightful user experiences
📱 **Responsive Layout**: Works seamlessly across different screen sizes
🎯 **Complete User Flow**: Login → Welcome → Avatar Selection → Dashboard

## Tech Stack

- **Frontend**: React 19, Vite 7
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: CSS-in-JS with custom theme system

## Pages & Features

### 🔐 Authentication
- **Login Page**: Clean email/password form that connects to backend API
- **Welcome Page**: Animated onboarding with sparkles and gradient effects
- **Avatar Selection**: Interactive grid of colorful avatar options

### 🏠 Dashboard
- **Thanos Character**: Animated hero character with glowing eyes and power gauntlet
- **HP Bar**: Dynamic "Productivity Power" bar with shimmer effects
- **Scroll Animations**: Character scales and fades as user scrolls
- **Progress Cards**: Apple Watch-style cards showing productivity metrics

### 🧭 Navigation
- **Sidebar**: Clean navigation with icons and hover effects
- **Pages**: Dashboard, Settings, Leaderboard, Spaces, Game Engine
- **Under Construction**: Placeholder pages with animated construction icons

## Environment Variables

The application requires the following environment variable:

- `VITE_BACKEND_URL`: The base URL of your backend API (e.g., `http://localhost:3000`)

Create a `.env` file in the root directory:

```bash
VITE_BACKEND_URL=http://localhost:3000
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## User Flow

1. **Login** (`/`) - Enter valid email/password credentials to authenticate via backend API
2. **Avatar Selection** (`/avatar`) - Choose from 9 unique avatar designs
3. **Dashboard** (`/dashboard`) - Main productivity interface with animated character
4. **Navigation** - Use sidebar to explore other sections

## Animations & Interactions

- **Page Transitions**: Smooth fade and slide effects between routes
- **Hover Effects**: Interactive buttons and cards with scale/color changes
- **Scroll Animations**: Dashboard character responds to scroll position
- **Loading States**: Animated spinners and loading indicators
- **Progress Indicators**: Step-by-step flow with animated progress bars

## Color Palette

The design uses a carefully crafted dark theme with vibrant accents:

- **Background**: Deep black (`#0a0a0a`)
- **Surfaces**: Dark grays (`#1a1a1a`, `#2a2a2a`)
- **Primary**: Indigo (`#6366f1`)
- **Secondary**: Amber (`#f59e0b`)
- **Success**: Emerald (`#10b981`)
- **Text**: White and gray variants

## Development

The app uses a modular component structure:

```
src/
├── components/     # Reusable components (Logo, Sidebar)
├── pages/         # Page components (Login, Dashboard, etc.)
├── utils/         # Theme configuration and utilities
└── assets/        # Images and static assets
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

© 2024 ProductivePro. All rights reserved.
