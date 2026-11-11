# 📚 Book Library Management System (MERN Stack)

A modern, responsive, full-stack **Book Library Management System** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). The application provides robust role-based access control for **Admins** and **Students**, allowing full catalog management, real-time book request approvals, borrowing history tracking, automated fine calculations, and interactive analytics dashboards.

---

## ✨ Features

### 👑 Admin Features
- **Dashboard Analytics:** Real-time statistics on total books, registered students, issued copies, pending requests, and overdue books.
- **Book Inventory Management (CRUD):** Add new books with detailed metadata (title, author, ISBN, category, cover image URL, shelf location, total copies) and update or delete records.
- **Borrow Request Approvals:** Review pending borrow requests from students, approve/issue books with auto-generated 14-day due dates, or reject requests.
- **Return Confirmation & Fine Tracking:** Confirm returned books to increment available stock automatically and track fine payments at ₹5/day for overdue returns.
- **User Management:** View all registered student accounts and profiles.

### 🎓 Student Features
- **User Authentication:** Secure registration and JWT-based login.
- **Interactive Book Catalog:** Search books dynamically by Title, Author, or ISBN, filter by Category, or toggle availability.
- **Book Borrowing:** Submit borrow requests for available books (enforces a max limit of 3 simultaneous borrows).
- **Personal Dashboard & History:** View active borrowed books, upcoming due dates, request status history, and fine details.
- **Profile Management:** Update personal information, phone number, student ID, and password.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS**
- **React Router DOM**
- **Axios** (with JWT Bearer interceptor)
- **React Icons** & **React Toastify**

### Backend
- **Node.js** & **Express.js**
- **RESTful API** Architecture
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcryptjs** for password hashing
- **express-validator** & **cors**

### Database
- **MongoDB** & **Mongoose ODM**
- Schema validation, references, and indexed text search

---

## 📁 Project Structure

```text
BOOKLIBRARY/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── borrowController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Book.js
│   │   ├── Borrow.js
│   │   ├── Category.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── borrowRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── seedData.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── layouts/
    │   ├── pages/
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
