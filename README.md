# StreetShelter 🐕

A full-stack web application for reporting and managing street dog sightings. Users can report stray dogs with location details and images, while shelter owners and rescue centers can register to help manage these reports.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT
- **Password Reset**: Complete forgot password flow with OTP verification via email
- **Dog Reports**: Submit reports with images, location, and description
- **Owner Registration**: Shelters, rescue centers, and veterinary clinics can register
- **Admin Dashboard**: Manage reports and verify owners
- **Image Upload**: Support for dog photos (JPEG, PNG, WebP)
- **Real-time Status**: Track report status (pending, in progress, resolved, closed)

## 🛠️ Technology Stack

### Frontend
- React 19
- Vite (Build tool)
- React Router DOM (Routing)
- React Hook Form + Zod (Form validation)
- CSS3

### Backend
- Node.js + Express.js
- PostgreSQL (Database)
- Sequelize ORM
- JWT Authentication
- Bcrypt (Password hashing)
- Multer (File uploads)

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd streetshelter
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Set Up PostgreSQL Database

#### Using pgAdmin:
1. Open pgAdmin
2. Right-click **Databases** → **Create** → **Database**
3. Name: `streetshelter`
4. Click **Save**

#### Using psql:
```bash
psql -U postgres
CREATE DATABASE streetshelter;
\q
```

### 4. Configure Environment Variables

#### Backend (.env in server folder):
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=streetshelter
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production

FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env in root folder):
```env
VITE_API_URL=http://localhost:3000/api
```

**Important**: Update `DB_PASSWORD` with your actual PostgreSQL password!

### 5. Seed the Database (Optional but Recommended)

Run the seed script to create default test accounts:

```bash
cd server
node scripts/seed.js
cd ..
```

This creates three default accounts:
- **Admin**: admin@streetshelter.com / admin123
- **Reporter**: reporter@test.com / password123
- **Owner**: owner@test.com / password123

### 6. Start the Application

```bash
# Start both frontend and backend together
npm start
```

Or run them separately:

```bash
# Backend only (from root)
npm run server

# Frontend only (from root)
npm run client
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5176
- **Backend API**: http://localhost:3000/api

## 🔑 Default Login Credentials

After seeding the database, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@streetshelter.com | admin123 |
| Reporter | reporter@test.com | password123 |
| Owner | owner@test.com | password123 |

**Note**: Change these credentials in production!

## 📁 Project Structure

```
streetshelter/
├── server/              # Backend (Node.js + Express + PostgreSQL)
│   ├── config/         # Database configuration
│   ├── middleware/     # Auth & Upload middleware
│   ├── models/         # Sequelize models (User, DogReport, Owner)
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded images
│   ├── .env           # Backend environment variables
│   ├── package.json   # Backend dependencies
│   └── server.js      # Entry point
├── src/                # Frontend (React)
│   ├── components/    # React components
│   ├── pages/         # Page components
│   ├── utils/         # API utilities & schemas
│   └── main.jsx       # Frontend entry point
├── public/            # Static assets
├── .env              # Frontend environment variables
├── package.json      # Root package.json
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Password Reset
- `POST /api/password-reset/request` - Request password reset (sends OTP)
- `POST /api/password-reset/verify-otp` - Verify OTP code
- `POST /api/password-reset/reset` - Reset password with token

### Dog Reports (Protected)
- `GET /api/dog-reports` - Get all reports
- `GET /api/dog-reports/:id` - Get single report
- `POST /api/dog-reports` - Create report with image
- `PUT /api/dog-reports/:id` - Update report
- `DELETE /api/dog-reports/:id` - Delete report

### Owners (Protected)
- `POST /api/owners/register` - Register as owner/shelter
- `GET /api/owners/profile` - Get owner profile
- `PUT /api/owners/profile` - Update owner profile

## 👥 User Roles

- **user**: Regular users who can report dogs
- **admin**: Administrators who can manage all reports

## 🗄️ Database Tables

Sequelize automatically creates these tables:

1. **Users**: User accounts (username, email, password, role)
2. **DogReports**: Dog sighting reports (location, description, image, status)
3. **Owners**: Shelter/rescue center profiles
4. **OTPs**: One-time passwords for password reset (code, email, expiry, attempts)

## 🐛 Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check credentials in `server/.env`
- Verify database exists: `psql -U postgres -l`
- Try running the seed script: `node server/scripts/seed.js`

### Port Already in Use
```bash
# Kill process on port 3000 (backend)
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Kill process on port 5176 (frontend)
netstat -ano | findstr :5176
taskkill /PID <process_id> /F
```

### Module Not Found
```bash
# Reinstall dependencies
npm install
cd server && npm install
```

### Login Failed
- Make sure you've run the seed script: `node server/scripts/seed.js`
- Use the default credentials from the table above
- Check that the backend server is running on port 3000

## 📝 Development Notes

- Backend runs on port 3000
- Frontend runs on port 5176
- Images stored in `server/uploads/`
- Database auto-syncs in development mode
- CORS configured for localhost communication
- OTP emails displayed via console in development mode
- Default test accounts available after seeding

## 📚 Additional Documentation

- [Project Summary](docs/PROJECT_SUMMARY.md) - Detailed technical documentation
- [Roles and User Flow](docs/ROLES_AND_FLOW.md) - User roles and application flow
- [Setup Guide](docs/SETUP_GUIDE.md) - Quick setup instructions
- [Password Reset Guide](docs/FORGOT_PASSWORD_GUIDE.md) - Forgot password system documentation

## 🚢 Production Deployment

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to a strong random string
3. Update database credentials
4. Build frontend: `npm run build`
5. Use PM2 or similar for backend process management
6. Configure proper CORS origins
7. Use HTTPS in production

## 📄 License

ISC

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ for helping street dogs find homes
