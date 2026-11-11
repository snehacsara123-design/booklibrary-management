import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { asArray, errorMessage, formatDate, isOverdue } from '../utils/data';

const statIcons = [
  ({ size }) => <Icon name="book" size={size} />,
  ({ size }) => <Icon name="bookOpen" size={size} />,
  ({ size }) => <Icon name="clock" size={size} />,
  ({ size }) => <Icon name="alert" size={size} />,
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    API.get('/dashboard/user')
      .then(({ data: result }) => { if (active) setData(result); })
      .catch((requestError) => { if (active) setError(errorMessage(requestError, 'Could not load your dashboard.')); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="page"><div className="notice notice-error" role="alert">{error}</div></div>;
  if (!data) return <div className="page"><p className="loading">Loading dashboard…</p></div>;

  const stats = data.stats || {};
  const activeBorrows = asArray(data.currentlyIssuedBooks);
  const pendingBorrows = asArray(data.pendingRequests || data.pendingBorrows);
  const overdueBorrows = asArray(data.overdueBorrows);
  const overdueItems = overdueBorrows.length ? overdueBorrows : activeBorrows.filter(isOverdue);
  const recentBooks = asArray(data.recentAvailableBooks);
  const statValues = [stats.totalBorrowed, stats.currentlyIssued, stats.pendingRequests ?? pendingBorrows.length, stats.overdueCount ?? overdueItems.length];

  return (
    <div className="page">
      <section className="welcome-banner">
        <div><p className="eyebrow">YOUR READING SPACE</p><h1>Welcome back, {user?.name || 'reader'}!</h1><p>Explore the collection and keep track of your borrowed books.</p></div>
        <div className="student-pill">Student ID · {user?.studentId || 'Not set'}</div>
      </section>
      <section className="stats-grid stats-grid-four">
        {['Total borrowed', 'Currently issued', 'Pending requests', 'Overdue books'].map((title, index) =>
          <StatCard key={title} title={title} value={statValues[index]} icon={statIcons[index]} color={['teal', 'green', 'amber', 'red'][index]} />)}
      </section>

      {overdueItems.length > 0 && <div className="notice notice-warning" role="status"><Icon name="alert" /> You have {overdueItems.length} overdue {overdueItems.length === 1 ? 'book' : 'books'}. Please return them to the library.</div>}
      {pendingBorrows.length > 0 && <div className="notice notice-info" role="status"><Icon name="clock" /> {pendingBorrows.length} borrow request{pendingBorrows.length === 1 ? '' : 's'} awaiting approval.</div>}

      <section className="panel">
        <div className="panel-heading"><div><p className="eyebrow">YOUR LOANS</p><h2>Currently issued books</h2></div><Link className="text-link" to="/my-borrows">View all borrows</Link></div>
        {activeBorrows.length ? <div className="table-wrap"><table><thead><tr><th>Book title</th><th>Author</th><th>Issue date</th><th>Due date</th><th>Shelf</th></tr></thead>
          <tbody>{activeBorrows.map((item) => <tr key={item._id}><td>{item.book?.title || 'Book'}</td><td>{item.book?.author || '—'}</td><td>{formatDate(item.issueDate)}</td>
            <td className={isOverdue(item) ? 'text-danger' : ''}>{formatDate(item.dueDate)}{isOverdue(item) && <span className="table-note">Overdue</span>}</td><td>{item.book?.shelfLocation || '—'}</td>
          </tr>)}</tbody></table></div> : <p className="empty-state">You don’t have any issued books right now. <Link to="/books">Browse the catalog</Link>.</p>}
      </section>

      <section className="panel">
        <div className="panel-heading"><div><p className="eyebrow">DISCOVER</p><h2>Available books</h2></div><Link className="text-link" to="/books">Browse catalog</Link></div>
        {recentBooks.length ? <div className="recent-book-grid">{recentBooks.slice(0, 4).map((book) => <div className="recent-book" key={book._id}>
          <img alt="" src={book.coverImage || 'https://placehold.co/100x140/e8f1ef/315c56?text=Book'} />
          <div><strong>{book.title}</strong><p className="muted">{book.author}</p><span className="badge badge-teal">{book.availableCopies} available</span></div>
        </div>)}</div> : <p className="empty-state">No featured books are available right now.</p>}
      </section>
    </div>
  );
}
