import React from 'react';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = Layers,
  title = 'No records found',
  description = 'There are no items matching this criteria right now.',
  actionLabel,
  actionLink,
  onActionClick
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-border)',
        margin: 'var(--space-6) 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-blue-subtle)',
          color: 'var(--color-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4) auto'
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-2)' }}>{title}</h3>
      <p style={{ maxWidth: '420px', margin: '0 auto var(--space-6) auto' }}>{description}</p>

      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}

      {actionLabel && onActionClick && !actionLink && (
        <button type="button" onClick={onActionClick} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
