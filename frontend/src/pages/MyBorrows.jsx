import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import { asArray, errorMessage, formatDate, isOverdue } from '../utils/data';

export default function MyBorrows() {
  const [borrows, setBorrows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBorrows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/borrow/my-books');
      setBorrows(asArray(data?.borrows || data));
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not load your borrow history.'));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadBorrows(); }, [loadBorrows]);

  const visible = borrows.filter((item) => {
    if (filter === 'active') return ['approved', 'issued'].includes(item.status);
    if (filter === 'history') return ['returned', 'rejected'].includes(item.status);
    return true;
  });
  const filters = [['all', 'All'], ['active', 'Active'], ['history', 'History']];

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>My borrows</h1><p className="muted">Track your requests, current loans, due dates, and past returns.</p></div></div>
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <div className="filter-tabs" aria-label="Filter borrow history">{filters.map(([value, label]) => <button aria-pressed={filter === value} className={`filter-tab ${filter === value ? 'selected' : ''}`} key={value} onClick={() => setFilter(value)} type="button">{label}</button>)}</div>
      <section className="panel">
        {loading ? <p className="loading">Loading your borrow history…</p> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Book</th><th>Category</th><th>Status</th><th>Requested / issued</th><th>Due date</th><th>Fine</th></tr></thead>
          <tbody>{visible.map((borrow) => <tr key={borrow._id}><td><strong>{borrow.book?.title || 'Book'}</strong><span className="table-note">{borrow.book?.author || ''}</span></td><td>{borrow.book?.category || '—'}</td>
            <td><span className={`badge ${isOverdue(borrow) ? 'badge-red' : `status-${borrow.status || 'pending'}`}`}>{isOverdue(borrow) ? 'overdue' : borrow.status || 'pending'}</span></td>
            <td>{formatDate(borrow.issueDate || borrow.requestDate || borrow.createdAt)}</td><td className={isOverdue(borrow) ? 'text-danger' : ''}>{formatDate(borrow.dueDate)}</td><td>₹{borrow.fine || 0}</td>
          </tr>)}</tbody></table></div> : <p className="empty-state">{filter === 'all' ? 'You have not requested or borrowed any books yet.' : `No ${filter} borrows found.`}</p>}
      </section>
    </div>
  );
}
