import React from 'react';
import { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/data';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', studentId: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '', studentId: user?.studentId || '' });
  }, [user]);

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
  async function saveProfile(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (form.name.trim().length < 2) return setError('Name must contain at least 2 characters.');
    setProfileBusy(true);
    try {
      const { data } = await API.put('/users/profile', { name: form.name.trim(), phone: form.phone.trim(), studentId: form.studentId.trim() });
      updateUser({ ...user, ...(data?.user || data) });
      setNotice('Profile details saved.');
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not update your profile.'));
    } finally {
      setProfileBusy(false);
    }
  }
  async function changePassword(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (password.newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (password.newPassword !== password.confirmPassword) return setError('New passwords do not match.');
    setPasswordBusy(true);
    try {
      await API.put('/users/profile/password', { currentPassword: password.currentPassword, newPassword: password.newPassword });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice('Password changed successfully.');
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not change your password.'));
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="page page-narrow">
      <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile settings</h1><p className="muted">Keep your account information up to date.</p></div></div>
      {notice && <div className="notice notice-success" role="status">{notice}</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel profile-panel">
        <div className="panel-heading"><div><p className="eyebrow">PERSONAL DETAILS</p><h2>Profile information</h2></div></div>
        <form className="form-stack" onSubmit={saveProfile}>
          <label className="field"><span>Full name</span><input autoComplete="name" name="name" onChange={updateForm} required value={form.name} /></label>
          <label className="field"><span>Email address</span><input disabled value={user?.email || ''} /></label>
          <label className="field"><span>Phone</span><input autoComplete="tel" name="phone" onChange={updateForm} type="tel" value={form.phone} /></label>
          {user?.role !== 'admin' && <label className="field"><span>Student ID</span><input name="studentId" onChange={updateForm} value={form.studentId} /></label>}
          <button className="button button-primary" disabled={profileBusy} type="submit">{profileBusy ? 'Saving…' : 'Save profile'}</button>
        </form>
      </section>
      <section className="panel profile-panel">
        <div className="panel-heading"><div><p className="eyebrow">SECURITY</p><h2>Change password</h2></div></div>
        <form className="form-stack" onSubmit={changePassword}>
          <label className="field"><span>Current password</span><input autoComplete="current-password" name="currentPassword" onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} required type="password" value={password.currentPassword} /></label>
          <label className="field"><span>New password</span><input autoComplete="new-password" minLength="8" name="newPassword" onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} required type="password" value={password.newPassword} /></label>
          <label className="field"><span>Confirm new password</span><input autoComplete="new-password" minLength="8" name="confirmPassword" onChange={(event) => setPassword((current) => ({ ...current, confirmPassword: event.target.value }))} required type="password" value={password.confirmPassword} /></label>
          <button className="button button-secondary" disabled={passwordBusy} type="submit">{passwordBusy ? 'Updating…' : 'Update password'}</button>
        </form>
      </section>
    </div>
  );
}
