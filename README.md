# RNDM Admin Dashboard

🚀 A comprehensive admin dashboard for data management and system monitoring.

## Features

### 🔐 Authentication
- Secure login system with JWT tokens
- Development mode with empty credential login
- Session management with automatic expiry
- Remember me functionality

### 📊 Dashboard Overview
- Real-time statistics and metrics
- System health monitoring
- Recent activity feed
- Quick action buttons
- Responsive design for desktop and mobile

### 👥 User Management
- User CRUD operations
- Role-based access control
- User status management
- Advanced filtering and search
- Pagination support

### 🔧 System Administration
- System logs and monitoring
- Database management interface
- API status monitoring
- Backup and restore functionality
- Settings management

### 🎨 Modern UI/UX
- Clean, professional design
- Animated transitions
- Interactive components
- Mobile-responsive layout
- Dark/light theme ready

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **Font Awesome** - Icons
- **Inter Font** - Typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests
- **Helmet** - Security headers
- **Morgan** - Request logging

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd rndmadmin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the dashboard:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api
   - Health Check: http://localhost:3000/api/health

### Development Login

For development purposes, you can login with empty credentials:
- Username: (leave empty)
- Password: (leave empty)
- Click "Sign In" to access the dashboard

## Project Structure

```
rndmadmin/
├── frontend/
│   ├── css/
│   │   ├── login.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── login.js
│   │   └── dashboard.js
│   ├── index.html
│   ├── login.html
│   └── dashboard.html
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   └── system.js
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .env.example
├── package.json
└── README.md
```

## Development Login

For development purposes, you can login with empty credentials:
- Username: (leave empty)
- Password: (leave empty)  
- Click "Sign In" to access the dashboard

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run backend:dev` - Start backend only in development
- `npm run frontend:dev` - Start frontend only in development

## Next Steps

To continue developing your admin dashboard:

1. **Add Real Database Integration:**
   - Install MongoDB, PostgreSQL, or MySQL
   - Replace mock data with real database queries
   - Add data models and schemas

2. **Enhance User Management:**
   - Add user profiles with avatars
   - Implement password reset functionality
   - Add user activity tracking

3. **Expand Dashboard Features:**
   - Add real-time charts and graphs
   - Implement file upload functionality
   - Add email notification system

4. **Security Improvements:**
   - Add rate limiting
   - Implement 2FA authentication
   - Add audit logging

5. **UI Enhancements:**
   - Add dark/light theme toggle
   - Implement advanced data tables
   - Add export functionality

---

**Built with ❤️ by RNDM LLC**
