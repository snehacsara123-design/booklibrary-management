import React from 'react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/data';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', studentId: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (form.name.trim().length < 2) return setError('Name must contain at least 2 characters.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return setError('Enter a valid email address.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setBusy(true);
    try {
      const authenticatedUser = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        studentId: form.studentId.trim(),
        password: form.password,
        role: 'student',
      });
      navigate(authenticatedUser ? '/dashboard' : '/login', { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError, 'Unable to create your account.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-card-header">
          <Link className="brand auth-brand" to="/login"><span className="brand-mark">B</span> Bookwise</Link>
          <ThemeToggle />
        </div>
        <p className="eyebrow">JOIN THE LIBRARY</p>
        <h1>Create a student account</h1>
        <p className="muted">Register to browse the catalog and request books.</p>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={submit}>
          <label className="field"><span>Full name</span><input autoComplete="name" name="name" onChange={update} required value={form.name} /></label>
          <div className="form-grid">
            <label className="field"><span>Email address</span><input autoComplete="email" name="email" onChange={update} required type="email" value={form.email} /></label>
            <label className="field"><span>Phone</span><input autoComplete="tel" name="phone" onChange={update} type="tel" value={form.phone} /></label>
            <label className="field"><span>Student ID</span><input name="studentId" onChange={update} required value={form.studentId} /></label>
            <label className="field"><span>Password</span><input autoComplete="new-password" minLength="8" name="password" onChange={update} required type="password" value={form.password} /></label>
            <label className="field field-span"><span>Confirm password</span><input autoComplete="new-password" minLength="8" name="confirmPassword" onChange={update} required type="password" value={form.confirmPassword} /></label>
          </div>
          <button className="button button-primary button-full" disabled={busy} type="submit">{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-footer">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
