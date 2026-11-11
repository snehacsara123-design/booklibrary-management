import React from 'react';
import { useCallback, useEffect, useState } from 'react';
import API from '../services/api';
import Modal from '../components/Modal';
import Icon from '../components/Icon';
import { asArray, errorMessage } from '../utils/data';

const emptyBook = { title: '', author: '', category: '', isbn: '', description: '', coverImage: '', shelfLocation: '', totalCopies: 1, availableCopies: 1 };

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBook);
  const [busy, setBusy] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/books');
      setBooks(asArray(data?.books || data));
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not load books.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  function openForm(book = null) {
    setEditing(book);
    setForm(book ? { ...emptyBook, ...book } : emptyBook);
    setError('');
    setModalOpen(true);
  }

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === 'totalCopies') {
        const totalCopies = Number(value);
        const borrowed = Math.max(0, Number(current.totalCopies || 0) - Number(current.availableCopies || 0));
        return { ...current, totalCopies, availableCopies: Math.max(0, totalCopies - borrowed) };
      }
      return { ...current, [name]: value };
    });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const payload = {
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim(),
      isbn: form.isbn.trim(),
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
    };
    try {
      if (editing) await API.put(`/books/${editing._id}`, payload);
      else await API.post('/books', payload);
      setModalOpen(false);
      setNotice(editing ? 'Book details updated.' : 'Book added to the catalog.');
      await loadBooks();
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not save this book.'));
    } finally {
      setBusy(false);
    }
  }

  async function removeBook(book) {
    if (!window.confirm(`Delete “${book.title}”? This cannot be undone.`)) return;
    setError('');
    try {
      await API.delete(`/books/${book._id}`);
      setNotice(`“${book.title}” was deleted.`);
      await loadBooks();
    } catch (requestError) {
      setError(errorMessage(requestError, 'Could not delete this book.'));
    }
  }

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">COLLECTION</p><h1>Book management</h1><p className="muted">Add, update, and remove catalog entries.</p></div><button className="button button-primary" onClick={() => openForm()} type="button">Add book</button></div>
      {notice && <div className="notice notice-success" role="status">{notice}</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      <section className="panel">
        {loading ? <p className="loading">Loading books…</p> : books.length ? <div className="table-wrap"><table><thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Copies available</th><th>Actions</th></tr></thead>
          <tbody>{books.map((book) => <tr key={book._id}><td><strong>{book.title}</strong><span className="table-note">{book.isbn || 'No ISBN'}</span></td><td>{book.author}</td><td>{book.category}</td><td>{book.availableCopies ?? 0} / {book.totalCopies ?? 0}</td>
            <td><div className="table-actions"><button aria-label={`Edit ${book.title}`} className="icon-button" onClick={() => openForm(book)} title="Edit" type="button"><Icon name="edit" /></button><button aria-label={`Delete ${book.title}`} className="icon-button danger-icon" onClick={() => removeBook(book)} title="Delete" type="button"><Icon name="trash" /></button></div></td>
          </tr>)}</tbody></table></div> : <p className="empty-state">No books found. Add the first catalog entry.</p>}
      </section>
      <Modal onClose={() => setModalOpen(false)} open={modalOpen} size="large" title={editing ? 'Edit book' : 'Add a book'}>
        <form className="form-stack" onSubmit={save}>
          <div className="form-grid">
            <label className="field"><span>Title</span><input name="title" onChange={update} required value={form.title} /></label>
            <label className="field"><span>Author</span><input name="author" onChange={update} required value={form.author} /></label>
            <label className="field"><span>Category</span><input name="category" onChange={update} required value={form.category} /></label>
            <label className="field"><span>ISBN</span><input name="isbn" onChange={update} value={form.isbn} /></label>
            <label className="field"><span>Total copies</span><input min="0" name="totalCopies" onChange={update} required type="number" value={form.totalCopies} /></label>
            <label className="field"><span>Shelf location</span><input name="shelfLocation" onChange={update} value={form.shelfLocation} /></label>
            <label className="field field-span"><span>Cover image URL</span><input name="coverImage" onChange={update} type="url" value={form.coverImage} /></label>
            <label className="field field-span"><span>Description</span><textarea name="description" onChange={update} rows="4" value={form.description} /></label>
          </div>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <div className="form-actions"><button className="button button-secondary" onClick={() => setModalOpen(false)} type="button">Cancel</button><button className="button button-primary" disabled={busy} type="submit">{busy ? 'Saving…' : editing ? 'Save changes' : 'Add book'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
