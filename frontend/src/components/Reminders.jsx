import PageHeading from './PageHeading';

const reminderSchedule = [
  ['30', 'A month before'],
  ['7', 'One week before'],
  ['1', 'The day before'],
];

export default function Reminders({ settings, onSave, onChange, error }) {
  return (
    <>
      <PageHeading
        eyebrow="STAY AHEAD"
        title="Warranty reminders"
        description="Choose where reminders go and turn email alerts on or off."
      />

      <div className="reminder-layout">
        <section className="surface reminder-settings">
          <div className="reminder-symbol">◷</div>
          <h2>Never miss a warranty date</h2>
          <p>
            We’ll check your active items daily and send an email 30 days,
            7 days, and 1 day before a warranty expires.
          </p>

          <form onSubmit={onSave}>
            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={settings.email}
                onChange={event => onChange({
                  ...settings,
                  email: event.target.value,
                })}
                required={settings.enabled}
              />
            </label>

            <label className="switch-row">
              <span>
                <b>Email alerts</b>
                <small>
                  {settings.enabled
                    ? 'Reminders are enabled'
                    : 'Reminders are turned off'}
                </small>
              </span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={event => onChange({
                  ...settings,
                  enabled: event.target.checked,
                })}
              />
            </label>

            {error && <div className="inline-message">{error}</div>}
            <button className="button primary">Save settings</button>
          </form>
        </section>

        <aside className="surface reminder-schedule">
          <h3>Your reminder schedule</h3>
          {reminderSchedule.map(([days, label]) => (
            <div className="schedule-row" key={days}>
              <span className="schedule-number">{days}</span>
              <div>
                <b>{label}</b>
                <small>Warranty expiry reminder</small>
              </div>
            </div>
          ))}
          <div className="schedule-note">
            Only items with an expiry date and an active status are included.
          </div>
        </aside>
      </div>
    </>
  );
}
