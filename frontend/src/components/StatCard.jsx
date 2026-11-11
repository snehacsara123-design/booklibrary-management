import React from 'react';
export default function StatCard({ title, value, icon: Icon, color = 'teal', helper }) {
  return (
    <article className="stat-card">
      <div>
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value ?? 0}</p>
        {helper && <p className="stat-helper">{helper}</p>}
      </div>
      <span className={`stat-icon ${color}`}>
        {Icon ? <Icon size={22} /> : <span aria-hidden="true">#</span>}
      </span>
    </article>
  );
}
