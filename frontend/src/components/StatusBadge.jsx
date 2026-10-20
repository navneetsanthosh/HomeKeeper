import { statusLabels } from './productUtils';

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status}`}>
      {statusLabels[status] || status}
    </span>
  );
}
