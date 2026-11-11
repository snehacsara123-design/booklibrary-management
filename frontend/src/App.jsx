import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import BookCatalog from './pages/BookCatalog';
import BookManagement from './pages/BookManagement';
import BorrowManagement from './pages/BorrowManagement';
import UserManagement from './pages/UserManagement';
import MyBorrows from './pages/MyBorrows';
import Profile from './pages/Profile';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate replace to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<BookManagement />} />
          <Route path="/admin/borrows" element={<BorrowManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/profile" element={<Profile />} />
        </Route>

        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/books" element={<BookCatalog />} />
          <Route path="/my-borrows" element={<MyBorrows />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
