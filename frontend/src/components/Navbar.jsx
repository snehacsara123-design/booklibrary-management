import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  return (
    <header className="topbar">
      <button aria-label="Open navigation" className="icon-button menu-toggle" onClick={onMenuClick} type="button">
        <Icon name="menu" />
      </button>
      <Link className="brand topbar-brand" to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
        <span className="brand-mark">B</span> Bookwise
      </Link>
      <ThemeToggle />
      <div className="topbar-user">
        <Link className="user-chip" to={user?.role === 'admin' ? '/admin/profile' : '/profile'}>
          <span className="avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
          <span>{user?.name || 'Account'}</span>
        </Link>
        <button className="button button-quiet" onClick={logout} type="button">
          <Icon name="logout" size={16} /> <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
