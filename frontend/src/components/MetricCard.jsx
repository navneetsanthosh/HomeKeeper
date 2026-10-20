export default function MetricCard({ label, value, note, icon, tone = '' }) {
  return (
    <div className={`metric-card ${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <i>{icon}</i>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
