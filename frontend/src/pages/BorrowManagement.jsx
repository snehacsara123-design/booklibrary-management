import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import { asArray, errorMessage, formatDate, isOverdue } from '../utils/data';

const transitions = {
  pending: [['Approve', 'approve', 'button-primary'], ['Reject', 'reject', 'button-danger']],
  approved: [['Issue book', 'issue', 'button-primary']],
  issued: [['Confirm return', 'return', 'button-secondary']],
};

export default function BorrowManagement() {
  const [borrows, setBorrows] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadBorrows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/borrow/all');
      setBorrows(asArray(data?.borrows || data));
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not load borrow records.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBorrows(); }, [loadBorrows]);

  async function act(borrow, action) {
    setBusyId(borrow._id);
    setError('');
    setNotice('');
    try {
      await API.post(`/borrow/${borrow._id}/${action}`);
      const resultLabel = { approve: 'approved', reject: 'rejected', issue: 'issued', return: 'marked returned' }[action];
      setNotice(`Borrow request ${resultLabel}.`);
      await loadBorrows();
    } catch (requestError) {
      setError(errorMessage(requestError, `Could not ${action} this request.`));
    } finally {
      setBusyId('');
    }
  }

  const visible = filter === 'all' ? borrows : borrows.filter((item) => item.status === filter);
  const filters = ['all', 'pending', 'approved', 'issued', 'returned', 'rejected'];

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">CIRCULATION</p><h1>Borrow management</h1><p className="muted">Review requests, issue books, and confirm returns.</p></div><button className="button button-secondary" disabled={loading} onClick={loadBorrows} type="button">Refresh</button></div>
      {notice && <div className="notice notice-success" role="status">{notice}</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <div className="filter-tabs" aria-label="Filter borrow records">
        {filters.map((status) => <button aria-pressed={filter === status} className={`filter-tab ${filter === status ? 'selected' : ''}`} key={status} onClick={() => setFilter(status)} type="button">{status === 'all' ? 'All requests' : `${status[0].toUpperCase()}${status.slice(1)}`}</button>)}
      </div>
      <section className="panel">
        {loading ? <p className="loading">Loading borrow records…</p> : visible.length ? <div className="table-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Requested</th><th>Due date</th><th>Status / fine</th><th>Actions</th></tr></thead>
          <tbody>{visible.map((borrow) => <tr key={borrow._id}><td><strong>{borrow.user?.name || 'Member'}</strong><span className="table-note">{borrow.user?.email || ''}</span></td><td>{borrow.book?.title || 'Book'}</td><td>{formatDate(borrow.requestDate || borrow.createdAt)}</td>
            <td className={isOverdue(borrow) ? 'text-danger' : ''}>{formatDate(borrow.dueDate)}</td>
            <td><span className={`badge status-${borrow.status || 'pending'}`}>{borrow.status || 'pending'}</span><span className="table-note">Fine: ₹{borrow.fine || 0}</span></td>
            <td><div className="table-actions">{(transitions[borrow.status] || []).map(([label, action, style]) =>
              <button className={`button button-small ${style}`} disabled={busyId === borrow._id} key={action} onClick={() => act(borrow, action)} type="button">{busyId === borrow._id ? '…' : label}</button>)}</div></td>
          </tr>)}</tbody></table></div> : <p className="empty-state">No {filter === 'all' ? '' : `${filter} `}borrow records found.</p>}
      </section>
    </div>
  );
}
