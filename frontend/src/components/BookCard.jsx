import React from 'react';
export default function BookCard({ book, onBorrow, onDetails, busy = false }) {
  const available = Number(book.availableCopies || 0);
  return (
    <article className="book-card">
      <button className="book-cover-button" onClick={() => onDetails?.(book)} type="button">
        <img
          alt={`Cover of ${book.title}`}
          className="book-cover"
          loading="lazy"
          src={book.coverImage || 'https://placehold.co/480x640/e8f1ef/315c56?text=Book'}
        />
      </button>
      <div className="book-card-body">
        <div className="book-card-topline">
          <span className="badge badge-teal">{book.category || 'Uncategorized'}</span>
          <span className={`availability ${available ? 'available' : 'unavailable'}`}>
            {available ? `${available} available` : 'Unavailable'}
          </span>
        </div>
        <h3>{book.title}</h3>
        <p className="muted">By {book.author}</p>
        <p className="book-description">{book.description || 'No description provided.'}</p>
        <div className="book-card-actions">
          <button className="button button-secondary" onClick={() => onDetails?.(book)} type="button">
            Details
          </button>
          {onBorrow && (
            <button
              className="button button-primary"
              disabled={!available || busy}
              onClick={() => onBorrow(book)}
              type="button"
            >
              {busy ? 'Requesting…' : 'Request book'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
