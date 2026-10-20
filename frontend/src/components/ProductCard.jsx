import StatusBadge from './StatusBadge';
import { daysUntil, statusLabels } from './productUtils';

export default function ProductCard({ product, onEdit, onDelete, onStatus }) {
  const warrantyDaysLeft = daysUntil(product.warranty_end);

  return (
    <article className="product-card">
      <div className="product-card-top">
        <div className="product-icon">
          {product.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="product-actions">
          <button title="Edit item" onClick={onEdit}>✎</button>
          <button className="delete-action" title="Delete item" onClick={onDelete}>
            ×
          </button>
        </div>
      </div>

      <h3>{product.name}</h3>
      <p className="product-subtitle">
        {[product.brand, product.model_number].filter(Boolean).join(' · ') ||
          'Brand or model not recorded'}
      </p>

      <div className="product-tags">
        <span>{product.category_name || 'Uncategorized'}</span>
        <StatusBadge status={product.status} />
      </div>

      <div className="product-facts">
        <div>
          <small>Purchase date</small>
          <b>{product.purchase_date || '—'}</b>
        </div>
        <div>
          <small>Warranty</small>
          <b>{product.warranty_end || '—'}</b>
        </div>
      </div>

      {product.warranty_end && warrantyDaysLeft >= 0 && warrantyDaysLeft <= 30 && (
        <div className="card-alert">
          ◷ Warranty ends in{' '}
          {warrantyDaysLeft === 0
            ? 'today'
            : `${warrantyDaysLeft} day${warrantyDaysLeft === 1 ? '' : 's'}`}
        </div>
      )}

      {(product.attachments || []).map(attachment => (
        <a
          className="attachment-link"
          href={attachment.file}
          target="_blank"
          rel="noreferrer"
          key={attachment.id}
        >
          ↗ Open {attachment.kind}
        </a>
      ))}

      <label className="status-control">
        Update status
        <select
          value={product.status}
          onChange={event => onStatus(event.target.value)}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
      </label>
    </article>
  );
}
