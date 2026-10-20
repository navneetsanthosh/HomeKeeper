import PageHeading from './PageHeading';

function RestoreControl({ onRestore, busy }) {
  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) onRestore(file);
    event.target.value = '';
  }

  const buttonLabel = busy ? 'Restoring…' : '↑ Restore';
  const buttonClass = `button secondary file-button${busy ? ' file-button-busy' : ''}`;

  return (
    <label className={buttonClass}>
      {buttonLabel}
      <input
        type="file"
        accept=".zip,application/zip"
        disabled={busy}
        onChange={handleFileChange}
      />
    </label>
  );
}

export default function Profile({
  profile,
  onChange,
  onSave,
  onBackup,
  backupBusy,
  onRestore,
  restoreBusy,
  error,
}) {
  const nameInitials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map(name => name[0])
    .join('')
    .toUpperCase();
  const initials = nameInitials || profile.username?.[0]?.toUpperCase() || 'H';
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(' ') || profile.username;

  return (
    <>
      <PageHeading
        eyebrow="YOUR ACCOUNT"
        title="Profile"
        description="Manage your personal details and HomeKeeper data."
      />

      <div className="profile-layout">
        <section className="surface profile-card">
          <div className="profile-identity">
            <div className="profile-avatar">{initials}</div>
            <div>
              <h2>{fullName}</h2>
              <p>@{profile.username}</p>
            </div>
          </div>

          <h3>Personal details</h3>
          <p className="profile-intro">
            Add the name and contact email associated with your account.
          </p>

          <form className="profile-form" onSubmit={onSave}>
            <label>
              First name
              <input
                value={profile.first_name || ''}
                onChange={event => onChange({
                  ...profile,
                  first_name: event.target.value,
                })}
                autoComplete="given-name"
                maxLength={150}
              />
            </label>
            <label>
              Last name
              <input
                value={profile.last_name || ''}
                onChange={event => onChange({
                  ...profile,
                  last_name: event.target.value,
                })}
                autoComplete="family-name"
                maxLength={150}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={profile.email || ''}
                onChange={event => onChange({
                  ...profile,
                  email: event.target.value,
                })}
                autoComplete="email"
              />
            </label>
            <label>
              Username
              <input value={profile.username || ''} readOnly disabled />
            </label>
            {error && <div className="inline-message">{error}</div>}
            <button className="button primary">Save profile</button>
          </form>
        </section>

        <section className="surface profile-data-card">
          <div className="profile-data-icon">▣</div>
          <h2>Your data</h2>
          <p>
            Download a ZIP copy of your inventory, categories, bucket list,
            bills, and photos. You can restore it later if needed.
          </p>
          <button
            className="button secondary"
            disabled={backupBusy || restoreBusy}
            onClick={onBackup}
          >
            {backupBusy ? 'Preparing backup…' : '↓ Export HomeKeeper data'}
          </button>
          <div className="profile-restore">
            <RestoreControl
              onRestore={onRestore}
              busy={restoreBusy || backupBusy}
            />
          </div>
          <small>
            Import replaces your current products, categories, bucket list,
            bills, and photos. Export a backup first if you may want to keep them.
          </small>
        </section>
      </div>
    </>
  );
}
