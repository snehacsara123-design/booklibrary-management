import React from 'react';
import { useEffect, useState } from 'react';
import API from '../services/api';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import { asArray, errorMessage, formatDate, isOverdue } from '../utils/data';

const icons = {
  books: ({ size }) => <Icon name="book" size={size} />,
  users: ({ size }) => <Icon name="users" size={size} />,
  issued: ({ size }) => <Icon name="bookOpen" size={size} />,
  pending: ({ size }) => <Icon name="clock" size={size} />,
  overdue: ({ size }) => <Icon name="alert" size={size} />,
  available: ({ size }) => <Icon name="check" size={size} />,
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    API.get('/dashboard/admin')
      .then(({ data: result }) => { if (active) setData(result); })
      .catch((requestError) => { if (active) setError(errorMessage(requestError, 'Could not load the dashboard.')); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="page"><div className="notice notice-error" role="alert">{error}</div></div>;
  if (!data) return <div className="page"><p className="loading">Loading dashboard…</p></div>;

  const stats = data.stats || {};
  const recentBorrows = asArray(data.recentBorrows);
  const recentBooks = asArray(data.recentBooks);
  const overdueBorrows = asArray(data.overdueBorrows).length
    ? asArray(data.overdueBorrows)
    : recentBorrows.filter(isOverdue);
  const categories = asArray(data.categoryStats || data.categories);
  const categoryMax = Math.max(1, ...categories.map((item) => Number(item.count || item.total || 0)));

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">OVERVIEW</p><h1>Admin dashboard</h1><p className="muted">Your library at a glance.</p></div></div>
      <section className="stats-grid">
        <StatCard title="Total books" value={stats.totalBooks} icon={icons.books} color="teal" />
        <StatCard title="Registered users" value={stats.totalUsers} icon={icons.users} color="blue" />
        <StatCard title="Available copies" value={stats.availableBooks} icon={icons.available} color="green" />
        <StatCard title="Issued books" value={stats.issuedBooks} icon={icons.issued} color="amber" />
        <StatCard title="Pending requests" value={stats.pendingRequests} icon={icons.pending} color="violet" />
        <StatCard title="Overdue books" value={stats.overdueBooks ?? overdueBorrows.length} icon={icons.overdue} color="red" />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-heading"><div><p className="eyebrow">LATEST ACTIVITY</p><h2>Recent borrowing</h2></div></div>
          {recentBorrows.length ? (
            <div className="activity-list">
              {recentBorrows.slice(0, 7).map((borrow) => (
                <div className="activity-row" key={borrow._id}>
                  <div><strong>{borrow.user?.name || 'Library member'}</strong><p className="muted">{borrow.book?.title || 'Book'} · {formatDate(borrow.createdAt || borrow.requestDate)}</p></div>
                  <span className={`badge status-${borrow.status || 'pending'}`}>{borrow.status || 'pending'}</span>
                </div>
              ))}
            </div>
          ) : <p className="empty-state">No recent borrowing activity.</p>}
        </article>

        <article className="panel">
          <p className="eyebrow">COLLECTION</p><h2>Books by category</h2>
          {categories.length ? (
            <div className="chart-list">
              {categories.map((item) => {
                const count = Number(item.count || item.total || 0);
                return <div className="chart-row" key={item._id || item.category}>
                  <div className="chart-label"><span>{item.category || item._id || 'Other'}</span><strong>{count}</strong></div>
                  <div className="chart-track"><span style={{ width: `${Math.max(3, (count / categoryMax) * 100)}%` }} /></div>
                </div>;
              })}
            </div>
          ) : <p className="empty-state">Category summary is not available yet.</p>}
        </article>

        <article className="panel panel-span">
          <div className="panel-heading"><div><p className="eyebrow">NEEDS ATTENTION</p><h2>Overdue books</h2></div><span className="badge badge-red">{overdueBorrows.length} overdue</span></div>
          {overdueBorrows.length ? (
            <div className="table-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Due date</th><th>Fine</th></tr></thead>
              <tbody>{overdueBorrows.map((borrow) => <tr key={borrow._id}>
                <td>{borrow.user?.name || 'Member'}</td><td>{borrow.book?.title || 'Book'}</td>
                <td className="text-danger">{formatDate(borrow.dueDate)}</td><td>₹{borrow.fine || 0}</td>
              </tr>)}</tbody></table></div>
          ) : <p className="empty-state">No overdue books. Everything is on track.</p>}
        </article>

        <article className="panel panel-span">
          <div className="panel-heading"><div><p className="eyebrow">NEW IN THE LIBRARY</p><h2>Recently added books</h2></div></div>
          {recentBooks.length ? <div className="recent-book-grid">{recentBooks.slice(0, 6).map((book) =>
            <div className="recent-book" key={book._id}><img alt="" src={book.coverImage || 'https://placehold.co/100x140/e8f1ef/315c56?text=Book'} />
              <div><strong>{book.title}</strong><p className="muted">{book.author} · {book.category}</p><span className="badge badge-teal">{book.availableCopies ?? 0} available</span></div>
            </div>)}</div> : <p className="empty-state">No books have been added yet.</p>}
        </article>
      </section>
    </div>
  );
}
