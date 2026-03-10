# Academix Frontend

A modern React frontend for the Academix School Management System with Airbnb-inspired design.

## 🚀 Features

- **Modern Tech Stack**: React 18 + Vite + Tailwind CSS
- **Beautiful UI**: Airbnb-inspired design with smooth animations
- **Typography**: Outfit font family for clean, modern look
- **Charts**: Chart.js integration for data visualization
- **Authentication**: JWT-based authentication with refresh tokens
- **Responsive**: Mobile-first responsive design
- **Forms**: React Hook Form with validation
- **Notifications**: Toast notifications and SweetAlert2 modals
- **State Management**: React Query for server state
- **Icons**: Heroicons and Lucide React icon sets

## 🛠️ Tech Stack

### Core
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### UI Components & Styling
- **Framer Motion** - Smooth animations
- **Headless UI** - Unstyled UI components
- **Heroicons** - Beautiful SVG icons
- **Lucide React** - Additional icon set
- **clsx** - Conditional className utility

### Data & Forms
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Chart.js + React-Chartjs-2** - Data visualization

### User Experience
- **React Hot Toast** - Toast notifications
- **SweetAlert2** - Beautiful modals
- **React Select** - Enhanced select components
- **React Datepicker** - Date selection

## 📦 Installation

1. **Navigate to frontend directory**:
   ```bash
   cd /home/wambogo/Public/Academix/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🏃‍♂️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors
- **Primary**: Blue theme (`primary-50` to `primary-900`)
- **Gray Scale**: Modern gray palette
- **Semantic**: Success (green), Warning (yellow), Danger (red)

### Typography
- **Font Family**: Outfit (Google Fonts)
- **Weights**: 100-900 available
- **Responsive**: Fluid typography scales

### Components
- **Cards**: Clean white cards with subtle shadows
- **Buttons**: Multiple variants (primary, secondary, outline, etc.)
- **Tables**: Sortable, searchable data tables
- **Charts**: Beautiful Chart.js visualizations

## 🔐 Authentication

### Demo Credentials
- **Admin**: `admin@academix.com` / `Admin123!`
- **Teacher**: `teacher@academix.com` / `Teacher123!`

### Features
- JWT token-based authentication
- Automatic token refresh
- Role-based access control
- Protected routes
- Session persistence

## 📱 Pages & Features

### Dashboard
- Statistics overview
- Interactive charts (Bar, Doughnut, Line)
- Recent activity feed
- Upcoming events calendar

### Students Management
- Student listings with search & sort
- Detailed student profiles
- Enrollment tracking
- Academic records

### Teachers Management
- Staff directory
- Subject assignments
- Department organization
- Employment status tracking

### Courses & Results
- A-Level course combinations
- Academic results tracking
- Grade analytics
- Performance metrics

## 🔧 Configuration

### API Integration
The frontend is configured to proxy API requests to the backend:
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    },
  },
},
```

### Environment Variables
Create a `.env` file for environment-specific settings:
```bash
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Academix
```

## 🚀 Deployment

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Preview build locally**:
   ```bash
   npm run preview
   ```

3. **Deploy**: Upload the `dist` folder to your web server

## 🎯 Roadmap

- [ ] Student registration forms
- [ ] Advanced filtering and search
- [ ] Report generation (PDF exports)
- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Dark mode theme
- [ ] Multi-language support

## 🤝 Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper TypeScript types (future migration)
4. Write tests for critical components
5. Update documentation for new features

## 📄 License

This project is part of the Academix School Management System.

---

**Built with ❤️ for modern school management**