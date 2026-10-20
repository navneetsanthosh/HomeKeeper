export default function EmptyState({ icon, title, text }) {
  return (
    <div className="empty-state">
      <span>{icon}</span>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}
