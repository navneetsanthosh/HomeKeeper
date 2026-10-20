export default function AuthScreen({
  isSigningUp,
  username,
  password,
  authError,
  onSubmit,
  onUsernameChange,
  onPasswordChange,
  onToggleMode,
}) {
  return (
    <main className="auth-screen">
      <div className="auth-art">
        <span className="auth-mark">H</span>
        <p className="auth-kicker">A LITTLE MORE ORGANIZED</p>
        <h1>Your home,<br />all in one place.</h1>
        <p>
          Keep track of the things you own, the receipts you need, and the
          warranties you don’t want to forget.
        </p>
        <div className="auth-art-foot">
          Private by design · Your personal inventory
        </div>
      </div>

      <section className="auth-panel">
        <div className="mobile-brand">HomeKeeper</div>
        <div className="eyebrow">WELCOME TO HOMEKEEPER</div>
        <h2>{isSigningUp ? 'Create your account' : 'Welcome back'}</h2>
        <p>
          {isSigningUp
            ? 'Start keeping track of the things you own.'
            : 'Sign in to see your inventory.'}
        </p>

        <form onSubmit={onSubmit}>
          <label>
            Username
            <input
              autoComplete="username"
              value={username}
              onChange={event => onUsernameChange(event.target.value)}
              required
              placeholder="Choose a username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={isSigningUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={event => onPasswordChange(event.target.value)}
              required
              placeholder={isSigningUp ? 'At least 8 characters' : 'Your password'}
            />
          </label>
          {authError && <div className="inline-message">{authError}</div>}
          <button className="button primary auth-submit">
            {isSigningUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          {isSigningUp ? 'Already have an account?' : 'New to HomeKeeper?'}{' '}
          <button onClick={onToggleMode}>
            {isSigningUp ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </section>
    </main>
  );
}
