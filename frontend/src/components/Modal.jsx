import React from 'react';
import { useEffect } from 'react';
import Icon from './Icon';

export default function Modal({ open, onClose, title, children, size = 'medium' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('modal-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('modal-open');
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <section
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`modal-panel modal-${size}`}
        role="dialog"
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button aria-label="Close dialog" className="icon-button" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  );
}
