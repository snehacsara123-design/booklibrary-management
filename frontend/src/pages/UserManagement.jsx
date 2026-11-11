import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import { asArray, errorMessage, formatDate } from '../utils/data';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/users');
      setUsers(asArray(data?.users || data));
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not load user accounts.'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function toggleAccount(user) {
    const active = user.isActive !== false && user.status !== 'inactive';
    const nextActive = !active;
    if (!window.confirm(`${nextActive ? 'Activate' : 'Deactivate'} ${user.name}'s account?`)) return;
    setBusyId(user._id);
    setError('');
    try {
      await API.patch(`/users/${user._id}/status`, { isActive: nextActive });
      setNotice(`${user.name}'s account was ${nextActive ? 'activated' : 'deactivated'}.`);
      await loadUsers();
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not update this account.'));
    } finally {
      setBusyId('');
    }
  }

  const query = search.trim().toLowerCase();
  const visibleUsers = users.filter((user) => `${user.name || ''} ${user.email || ''} ${user.studentId || ''}`.toLowerCase().includes(query));

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">PEOPLE</p><h1>User management</h1><p className="muted">View registered library members and manage account access.</p></div></div>
      <section className="panel">
        <div className="panel-toolbar"><label className="search-field"><span className="sr-only">Search users</span><input onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or student ID…" type="search" value={search} /></label><span className="muted">{visibleUsers.length} users</span></div>
        {notice && <div className="notice notice-success" role="status">{notice}</div>}
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        {loading ? <p className="loading">Loading users…</p> : visibleUsers.length ? <div className="table-wrap"><table><thead><tr><th>Name</th><th>Student ID</th><th>Role</th><th>Joined</th><th>Account</th><th>Action</th></tr></thead>
          <tbody>{visibleUsers.map((user) => {
            const active = user.isActive !== false && user.status !== 'inactive';
            return <tr key={user._id}><td><strong>{user.name}</strong><span className="table-note">{user.email}</span></td><td>{user.studentId || '—'}</td><td><span className="badge badge-neutral">{user.role || 'student'}</span></td><td>{formatDate(user.createdAt)}</td>
              <td><span className={`badge ${active ? 'status-approved' : 'status-rejected'}`}>{active ? 'Active' : 'Inactive'}</span></td>
              <td><button className={`button button-small ${active ? 'button-danger' : 'button-primary'}`} disabled={busyId === user._id || user.role === 'admin'} onClick={() => toggleAccount(user)} type="button">{busyId === user._id ? 'Saving…' : active ? 'Deactivate' : 'Activate'}</button></td>
            </tr>;
          })}</tbody></table></div> : <p className="empty-state">{query ? 'No users match your search.' : 'No user accounts found.'}</p>}
      </section>
    </div>
  );
}
