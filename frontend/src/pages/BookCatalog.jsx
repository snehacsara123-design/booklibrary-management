import React from 'react';
import { useEffect, useState } from 'react';
import API from '../services/api';
import BookCard from '../components/BookCard';
import Modal from '../components/Modal';
import { asArray, errorMessage } from '../utils/data';
import Icon from '../components/Icon';

export default function BookCatalog() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [busyBook, setBusyBook] = useState('');

  useEffect(() => {
    API.get('/books/categories')
      .then(({ data }) => setCategories(asArray(data?.categories || data)))
      .catch((requestError) => setError(errorMessage(requestError, 'Could not load book categories.')));
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ search, category, available: String(availableOnly) });
      try {
        const { data } = await API.get(`/books?${params.toString()}`);
        if (active) setBooks(asArray(data?.books || data));
      } catch (requestError) {
        if (active) setError(errorMessage(requestError, 'Could not load the book catalog.'));
      } finally {
        if (active) setLoading(false);
      }
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [search, category, availableOnly]);

  async function requestBook(book) {
    setBusyBook(book._id);
    setNotice('');
    try {
      await API.post('/borrow/request', { bookId: book._id });
      setNotice(`Your request for “${book.title}” was submitted.`);
    } catch (requestError) {
      setNotice(errorMessage(requestError, 'Could not submit the borrow request.'));
    } finally {
      setBusyBook('');
    }
  }

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">THE COLLECTION</p><h1>Book catalog</h1><p className="muted">Find your next great read.</p></div><span className="catalog-count">{loading ? 'Updating…' : `${books.length} ${books.length === 1 ? 'book' : 'books'}`}</span></div>
      <div className="notice notice-info loan-policy"><span>Borrowing policy</span> Books are due 14 days after issue. Late returns carry a ₹150 fine per book.</div>
      <section className="catalog-tools">
        <label className="search-field"><span className="sr-only">Search books</span><input onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author or ISBN…" type="search" value={search} /></label>
        <label className="select-field"><span className="sr-only">Filter by category</span><select onChange={(event) => setCategory(event.target.value)} value={category}>
          <option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select></label>
        <label className="checkbox-field"><input checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} type="checkbox" /> Available only</label>
      </section>
      {notice && <div className="notice notice-info" role="status">{notice}</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {loading ? <p className="loading">Loading books…</p> : books.length ? (
        <section aria-label="Books" className="book-grid">
          {books.map((book) => <BookCard key={book._id} book={book} busy={busyBook === book._id} onBorrow={requestBook} onDetails={setSelectedBook} />)}
        </section>
      ) : <div className="empty-panel"><span className="empty-icon"><Icon name="search" size={23} /></span><h2>No books found</h2><p>Try changing your search or filters.</p><button className="button button-secondary" onClick={() => { setSearch(''); setCategory(''); setAvailableOnly(false); }} type="button">Clear filters</button></div>}
      <Modal onClose={() => setSelectedBook(null)} open={Boolean(selectedBook)} size="small" title={selectedBook?.title || 'Book details'}>
        {selectedBook && <div className="book-detail"><img alt={`Cover of ${selectedBook.title}`} src={selectedBook.coverImage || 'https://placehold.co/480x640/e8f1ef/315c56?text=Book'} />
          <p><strong>Author:</strong> {selectedBook.author}</p><p><strong>Category:</strong> {selectedBook.category}</p>
          <p><strong>ISBN:</strong> {selectedBook.isbn || '—'}</p><p><strong>Available:</strong> {selectedBook.availableCopies ?? 0} of {selectedBook.totalCopies ?? 0}</p>
          <p>{selectedBook.description || 'No description provided.'}</p>
          <button className="button button-primary" disabled={!selectedBook.availableCopies || busyBook === selectedBook._id} onClick={() => requestBook(selectedBook)} type="button">Request book</button>
        </div>}
      </Modal>
    </div>
  );
}
