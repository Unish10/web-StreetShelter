# StreetShelter - Project Summary

## Overview
Full-stack web application for reporting and managing street dog sightings with image uploads, user authentication, and shelter management.

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Routing**: React Router DOM 7
- **Forms**: React Hook Form + Zod validation
- **Styling**: Plain CSS3
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 4
- **Database**: PostgreSQL 18
- **ORM**: Sequelize 6
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: Bcrypt
- **File Upload**: Multer
- **Environment**: dotenv

## Key Features

1. **Authentication System**
   - User registration with email validation
   - Secure login with JWT tokens
   - Password hashing with bcrypt
   - Role-based access (user, admin)

2. **Dog Reporting**
   - Create reports with images
   - Location and description
   - Status tracking (pending, in progress, resolved, closed)
   - Edit/delete own reports
   - Admin can manage all reports

3. **Owner/Shelter Management**
   - Register as shelter, rescue center, veterinary clinic, individual, or NGO
   - Profile management
   - Capacity tracking
   - Verification system

4. **File Management**
   - Image upload (JPEG, PNG, WebP)
   - 5MB file size limit
   - Stored in server/uploads directory

## Database Schema

### Users Table
```sql
- id (UUID, PK)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)  
- password (VARCHAR, HASHED)
- role (ENUM: 'user', 'admin')
- createdAt, updatedAt (TIMESTAMP)
```

### DogReports Table
```sql
- id (UUID, PK)
- location (VARCHAR(200))
- description (TEXT)
- imageUrl (VARCHAR)
- additionalNotes (VARCHAR(500))
- status (ENUM: 'pending', 'in_progress', 'resolved', 'closed')
- reportedBy (UUID, FK -> Users.id)
- createdAt, updatedAt (TIMESTAMP)
```

### Owners Table
```sql
- id (UUID, PK)
- userId (UUID, FK -> Users.id, UNIQUE)
- business_name (VARCHAR(150))
- id_number (VARCHAR(50), UNIQUE)
- ownership_type (ENUM: 'shelter', 'rescue_center', 'veterinary_clinic', 'individual', 'ngo')
- description (VARCHAR(500))
- capacity (INTEGER)
- isVerified (BOOLEAN, default: false)
- createdAt, updatedAt (TIMESTAMP)
```

## API Routes

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |

### Dog Reports (`/api/dog-reports`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all reports | Yes |
| GET | `/:id` | Get single report | Yes |
| POST | `/` | Create report | Yes |
| PUT | `/:id` | Update report | Yes (Owner/Admin) |
| DELETE | `/:id` | Delete report | Yes (Owner/Admin) |

### Owners (`/api/owners`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register as owner | Yes |
| GET | `/profile` | Get owner profile | Yes |
| PUT | `/profile` | Update profile | Yes |

## Security Features

1. **Password Security**
   - Bcrypt hashing with salt rounds (10)
   - Passwords never stored in plain text
   - Password validation on registration

2. **JWT Authentication**
   - Token-based authentication
   - 30-day expiration
   - Bearer token in Authorization header
   - Protected routes middleware

3. **File Upload Security**
   - File type validation
   - File size limits (5MB)
   - Unique filenames with timestamps

4. **Database Security**
   - Prepared statements (Sequelize)
   - Input validation
   - Foreign key constraints

## Project Structure

```
streetshelter/
├── server/                     # Backend
│   ├── config/
│   │   └── db.js              # Sequelize configuration
│   ├── middleware/
│   │   ├── auth.middleware.js # JWT verification
│   │   └── upload.middleware.js # Multer configuration
│   ├── models/
│   │   ├── User.model.js
│   │   ├── DogReport.model.js
│   │   ├── Owner.model.js
│   │   └── index.js           # Model associations
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dogReport.routes.js
│   │   └── owner.routes.js
│   ├── uploads/               # Uploaded images
│   ├── .env                   # Environment variables
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── src/                       # Frontend
│   ├── components/
│   │   ├── private/           # Protected components
│   │   │   ├── Feedback.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Product.jsx
│   │   └── public/            # Public components
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   ├── css/
│   │   ├── auth.css
│   │   └── dashboard.css
│   ├── pages/
│   │   ├── private/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── DogReports.jsx
│   │   │   ├── OwnerRegistration.jsx
│   │   │   ├── ReportDog.jsx
│   │   │   └── schema/        # Zod validation schemas
│   │   │       ├── dogReport.schema.js
│   │   │       ├── owner.schema.js
│   │   │       └── product.schema.js
│   │   └── public/
│   │       ├── Landing.jsx
│   │       └── Landing.css
│   ├── utils/
│   │   ├── api.js             # API client
│   │   ├── clearStorage.js
│   │   ├── login.schema.js
│   │   └── register.schema.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── public/                    # Static assets
├── .env                      # Frontend environment
├── .env.example
├── .gitignore
├── AppRoutes.jsx             # Route configuration
├── eslint.config.js
├── index.html
├── package.json              # Root dependencies
├── vite.config.js
├── README.md
└── SETUP_GUIDE.md

```

## Environment Variables

### Backend (server/.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=streetshelter
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Development Workflow

1. **Database Auto-Sync**: Sequelize automatically creates/updates tables in development
2. **Hot Reload**: Both frontend (Vite HMR) and backend (Nodemon) support hot reload
3. **Concurrent Execution**: `npm start` runs both servers simultaneously
4. **CORS**: Configured for localhost development

## Deployment Considerations

1. **Environment**:
   - Set `NODE_ENV=production`
   - Use strong `JWT_SECRET`
   - Update database credentials

2. **Database**:
   - Disable auto-sync in production
   - Use migrations for schema changes
   - Set up database backups

3. **Frontend**:
   - Build: `npm run build`
   - Serve static files from build directory
   - Configure production API URL

4. **Backend**:
   - Use process manager (PM2, systemd)
   - Set up logging
   - Configure proper CORS origins
   - Use HTTPS

5. **File Uploads**:
   - Consider cloud storage (S3, Cloudinary)
   - Set up CDN for images
   - Implement cleanup policies

## Testing Strategy

- Unit tests for models and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Manual testing for file uploads and authentication

## Future Enhancements

- Email verification
- Password reset functionality  
- Real-time notifications
- Map integration for location
- Advanced search and filters
- Image compression
- Multi-language support
- Mobile app (React Native)

## License

ISC

## Contributors

Built with ❤️ for helping street dogs find homes.
