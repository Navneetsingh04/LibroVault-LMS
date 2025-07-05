# 📚 Library Management System

A comprehensive digital library management system built with React.js and Node.js that enables efficient management of books, users, and borrowing operations.

## 🌟 Features

### 👤 User Management
- **User Registration & Authentication** - Secure account creation with email verification
- **Role-based Access Control** - Separate dashboards for Admin and User roles
- **Profile Management** - User profile with borrowing history
- **Password Reset** - Forgot password functionality with OTP verification

### 📖 Book Management
- **Book Catalog** - Comprehensive book inventory with search functionality
- **Add/Edit Books** - Admin can add new books and manage existing ones
- **Book Availability** - Real-time availability tracking
- **Book Details** - Title, author, description, price, and quantity management

### 🔄 Borrowing System
- **Book Borrowing** - Users can borrow available books
- **Return Management** - Track borrowed books and manage returns
- **Due Date Tracking** - 7-day borrowing period with due date monitoring
- **Overdue Management** - Automatic fine calculation for overdue books
- **Email Notifications** - Automated reminder emails for overdue books

### 📊 Dashboard & Analytics
- **Admin Dashboard** - Overview of total books, users, borrowed/returned books
- **User Dashboard** - Personal borrowing statistics and quick access to features
- **Visual Charts** - Pie charts showing borrowing statistics
- **Real-time Updates** - Live data updates across the system

### 🔧 Additional Features
- **Search Functionality** - Search books by title
- **Responsive Design** - Mobile-friendly interface
- **Toast Notifications** - User-friendly success/error messages
- **Background Services** - Automated cleanup of unverified accounts
- **File Upload** - Book cover image upload support

## 🛠️ Technology Stack

### Frontend
- **React.js 19.0.0** - Modern React with latest features
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Chart.js** - Data visualization
- **React Icons** - Icon library
- **Axios** - HTTP client
- **React Toastify** - Notification system
- **Vite** - Build tool and development server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Cloudinary** - Image upload and storage
- **Node-cron** - Scheduled tasks
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Library Management System/
├── client/                     # Frontend React application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/            # Images and static files
│   │   ├── components/        # React components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── BookManagement.jsx
│   │   │   ├── Catalog.jsx
│   │   │   ├── Users.jsx
│   │   │   └── MyBorrowedBooks.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.jsx
│   │   │   └── SideBar.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── OTP.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── popups/            # Modal components
│   │   ├── store/             # Redux store and slices
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                     # Backend Node.js application
│   ├── config/                # Configuration files
│   │   └── config.env
│   ├── controllers/           # Route controllers
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── borrowController.js
│   │   └── userController.js
│   ├── database/              # Database connection
│   │   └── db.js
│   ├── middlewares/           # Custom middlewares
│   ├── models/                # Mongoose models
│   │   ├── userModel.js
│   │   ├── bookModel.js
│   │   └── borrowModel.js
│   ├── routes/                # API routes
│   ├── services/              # Background services
│   │   ├── notifyUsers.js
│   │   └── removeUnverifiedAccounts.js
│   ├── utils/                 # Utility functions
│   ├── uploads/               # File upload directory
│   ├── app.js
│   ├── server.js
│   └── package.json
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Gmail account for email services
- Cloudinary account for image uploads

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Library Management System"
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `config.env` file in the `server/config/` directory:
```env
PORT=4000
FRONTEND_URL=http://localhost:5173

MONGO_URI=your_mongodb_connection_string

SMTP_HOST=smtp.gmail.com
SMTP_SERVICE=gmail
SMTP_PORT=465
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Run the Application

#### Start Backend Server
```bash
cd server
npm run dev
```

#### Start Frontend Development Server
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `https://librovault.onrender.com`

## 🎮 Usage

### For Users
1. **Register/Login** - Create an account or login with existing credentials
2. **Browse Books** - View available books in the catalog
3. **Borrow Books** - Request to borrow available books
4. **Track Books** - Monitor borrowed books and due dates
5. **View History** - Check borrowing history and returned books

### For Admins
1. **Dashboard** - Monitor system statistics and analytics
2. **Manage Books** - Add, edit, or remove books from the catalog
3. **User Management** - View and manage user accounts
4. **Process Borrowing** - Approve book borrowing requests
5. **Handle Returns** - Process book returns and calculate fines
6. **Monitor Overdue** - Track overdue books and send notifications

## 🔧 Key Features Explained

### Authentication System
- JWT-based authentication with secure cookie storage
- Email verification for new accounts
- OTP-based password reset functionality
- Role-based access control (Admin/User)

### Borrowing System
- 7-day borrowing period
- Automatic fine calculation for overdue books
- Email notifications for overdue books
- Real-time availability updates

### Background Services
- **Notification Service** - Sends email reminders for overdue books
- **Cleanup Service** - Removes unverified accounts after expiration
- **Scheduled Tasks** - Runs automated maintenance tasks


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Navneet Singh**
- GitHub: [https://github.com/Navneetsingh04]

