import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const adminLinks = [
  ['/admin', 'Dashboard', 'bookOpen'],
  ['/admin/books', 'Book management', 'book'],
  ['/admin/borrows', 'Borrow requests', 'clock'],
  ['/admin/users', 'Users', 'users'],
  ['/admin/profile', 'My profile', 'user'],
];
const userLinks = [
  ['/dashboard', 'Dashboard', 'bookOpen'],
  ['/books', 'Book catalog', 'book'],
  ['/my-borrows', 'My borrows', 'clock'],
  ['/profile', 'My profile', 'user'],
];

export default function Sidebar({ admin = false, open = false, onNavigate }) {
  const links = admin ? adminLinks : userLinks;
  return (
    <>
      {open && <button aria-label="Close navigation" className="sidebar-scrim" onClick={onNavigate} type="button" />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <p className="sidebar-heading">{admin ? 'Administration' : 'Library'}</p>
        <nav aria-label="Main navigation">
          {links.map(([to, label, icon]) => (
            <NavLink
              end={to === '/admin'}
              key={to}
              onClick={onNavigate}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon name={icon} size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
