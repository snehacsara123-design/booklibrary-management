import React from 'react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils/data';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const email = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    if (form.password.length < 1) return setError('Password is required.');

    setBusy(true);
    try {
      const authenticatedUser = await login({ email, password: form.password });
      const target = location.state?.from?.pathname;
      navigate(target && target !== '/login' ? target : authenticatedUser.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError, 'Unable to sign in.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-header">
          <Link className="brand auth-brand" to="/login"><span className="brand-mark">B</span> Bookwise</Link>
          <ThemeToggle />
        </div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in to your library</h1>
        <p className="muted">Use your library account to continue.</p>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            <span>Email address</span>
            <input autoComplete="email" name="email" onChange={update} required type="email" value={form.email} />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="current-password" minLength="1" name="password" onChange={update} required type="password" value={form.password} />
          </label>
          <button className="button button-primary button-full" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">New to the library? <Link to="/register">Create a student account</Link></p>
      </section>
    </main>
  );
}
