import { useEffect, useMemo, useState } from "react";
import "./App.css";

import IntegrationInspector from "./views/IntegrationInspector";

import {
  checkCGPHealth,
  getApiBaseUrl,
  getCurrentCGPSession,
  loginCGPAccount,
  logoutCGPAccount,
  registerCGPAccount,
} from "./services/cgpApi";

const modules = [
  { id: "home", icon: "⌂", label: "Home", state: "active" },
  { id: "inspector", icon: "◎", label: "Inspector", state: "active" },
  { id: "competition", icon: "◈", label: "Competition", state: "ready" },
  { id: "teams", icon: "◆", label: "Teams", state: "ready" },
  { id: "statistics", icon: "▥", label: "Statistics", state: "ready" },
  { id: "media", icon: "▶", label: "Media Center", state: "ready" },
  { id: "tournament", icon: "⚡", label: "Tournament Mode", state: "prototype" },
];

const cards = [
  {
    id: "competition",
    title: "Competition",
    description: "Competition management and competitive operations.",
    status: "READY",
    metric: "Engine available",
  },
  {
    id: "statistics",
    title: "Statistics",
    description: "Player statistics, profiles and synchronized game data.",
    status: "READY",
    metric: "Service available",
  },
  {
    id: "media",
    title: "Media Center",
    description: "Publishing, announcements and platform media.",
    status: "READY",
    metric: "MediaOS available",
  },
  {
    id: "tournament",
    title: "Tournament Mode",
    description: "Competitive PC preparation and tournament readiness.",
    status: "PROTOTYPE",
    metric: "Development queue",
  },
];

function AccountPanel({
  mode,
  setMode,
  busy,
  error,
  onLogin,
  onRegister,
}) {
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    displayName: "",
    password: "",
  });

  if (mode === "register") {
    return (
      <section className="auth-panel">
        <div className="auth-panel-copy">
          <span className="section-tag">CGP ACCOUNT</span>

          <h2>Create your CGP identity.</h2>

          <p>
            Your CGP Account is independent from Discord and external gaming
            platforms. Creating it also creates your Gaming Profile and internal
            CGP address.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            onRegister(registerForm);
          }}
        >
          <div className="auth-form-heading">
            <span className="eyebrow">NEW ACCOUNT</span>
            <h3>Create Account</h3>
          </div>

          <label>
            <span>Username</span>

            <input
              value={registerForm.username}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              placeholder="Choose your CGP username"
              autoComplete="username"
            />
          </label>

          <label>
            <span>Display name</span>

            <input
              value={registerForm.displayName}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              placeholder="How players will see you"
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              value={registerForm.password}
              onChange={(event) =>
                setRegisterForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="primary auth-submit"
            disabled={busy}
          >
            {busy ? "Creating account..." : "Create CGP Account"}
          </button>

          <button
            type="button"
            className="auth-switch"
            onClick={() => setMode("login")}
            disabled={busy}
          >
            Already have an account? Sign in
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="auth-panel">
      <div className="auth-panel-copy">
        <span className="section-tag">CGP ACCOUNT</span>

        <h2>Welcome back.</h2>

        <p>
          Sign in with your native CGP Account. Discord, Ubisoft and other
          gaming identities can be linked separately to your Gaming Profile.
        </p>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onLogin(loginForm);
        }}
      >
        <div className="auth-form-heading">
          <span className="eyebrow">ACCOUNT ACCESS</span>
          <h3>Sign In</h3>
        </div>

        <label>
          <span>Username</span>

          <input
            value={loginForm.username}
            onChange={(event) =>
              setLoginForm((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            placeholder="CGP username"
            autoComplete="username"
          />
        </label>

        <label>
          <span>Password</span>

          <input
            type="password"
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            placeholder="Your password"
            autoComplete="current-password"
          />
        </label>

        {error && <div className="auth-error">{error}</div>}

        <button
          type="submit"
          className="primary auth-submit"
          disabled={busy}
        >
          {busy ? "Signing in..." : "Sign In"}
        </button>

        <button
          type="button"
          className="auth-switch"
          onClick={() => setMode("register")}
          disabled={busy}
        >
          Need a CGP Account? Create one
        </button>
      </form>
    </section>
  );
}

function ProfileView({ session, onLogout, busy }) {
  const account = session?.account;
  const profile = session?.profile;

  return (
    <div className="content">
      <section className="profile-hero">
        <div className="profile-main">
          <div className="profile-large-avatar">
            {(profile?.displayName || account?.username || "CGP")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <span className="section-tag">GAMING PROFILE</span>

            <h2>
              {profile?.displayName || account?.username}
            </h2>

            <p className="profile-handle">
              @{profile?.handle}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="secondary"
          onClick={onLogout}
          disabled={busy}
        >
          {busy ? "Signing out..." : "Sign Out"}
        </button>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <span>CGP ADDRESS</span>

          <strong>
            {profile?.cgpAddress || "—"}
          </strong>

          <p>Internal CGP identity address.</p>
        </article>

        <article className="profile-card">
          <span>ACCOUNT STATUS</span>

          <strong>
            {account?.status?.toUpperCase() || "—"}
          </strong>

          <p>Native CGP account state.</p>
        </article>

        <article className="profile-card">
          <span>COMPETITIVE STATUS</span>

          <strong>
            {profile?.competitive?.status?.toUpperCase() || "PLAYER"}
          </strong>

          <p>Competitive identity inside CGP.</p>
        </article>

        <article className="profile-card">
          <span>LINKED PLATFORMS</span>

          <strong>0</strong>

          <p>
            Discord, Ubisoft and future providers are optional.
          </p>
        </article>
      </section>

      <section className="profile-details">
        <div className="profile-detail-block">
          <span className="eyebrow">ACCOUNT</span>

          <h3>Native CGP identity</h3>

          <div className="profile-data-row">
            <span>Username</span>
            <strong>{account?.username}</strong>
          </div>

          <div className="profile-data-row">
            <span>Account ID</span>
            <code>{account?.accountId}</code>
          </div>

          <div className="profile-data-row">
            <span>Profile ID</span>
            <code>{profile?.profileId}</code>
          </div>
        </div>

        <div className="profile-detail-block">
          <span className="eyebrow">GAMING PROFILE</span>

          <h3>Player identity</h3>

          <div className="profile-data-row">
            <span>Display name</span>
            <strong>{profile?.displayName}</strong>
          </div>

          <div className="profile-data-row">
            <span>Primary game</span>
            <strong>
              {profile?.competitive?.primaryGame || "Not selected"}
            </strong>
          </div>

          <div className="profile-data-row">
            <span>Region</span>
            <strong>
              {profile?.region || "Not configured"}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [active, setActive] = useState("home");

  const [apiStatus, setApiStatus] = useState({
    state: "checking",
    service: null,
    version: null,
    latency: null,
    error: null,
  });

  const [accountMode, setAccountMode] = useState("login");
  const [accountSession, setAccountSession] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState(null);

  const activeModule =
    modules.find((item) => item.id === active) || modules[0];

  const connected =
    apiStatus.state === "online";

  const authenticated =
    Boolean(accountSession?.account);

  const apiBaseUrl =
    getApiBaseUrl();

  const connectionMode = (() => {
    try {
      const hostname =
        new URL(apiBaseUrl).hostname;

      return (
        hostname === "localhost" ||
        hostname === "127.0.0.1"
      )
        ? "LOCAL"
        : "REMOTE";
    } catch {
      return "UNKNOWN";
    }
  })();

  const profileInitials = useMemo(() => {
    const value =
      accountSession?.profile?.displayName ||
      accountSession?.account?.username ||
      "CG";

    return value
      .slice(0, 2)
      .toUpperCase();
  }, [accountSession]);

  const checkApi = async () => {
    setApiStatus((current) => ({
      ...current,
      state: "checking",
      error: null,
    }));

    const result =
      await checkCGPHealth();

    setApiStatus(result);
  };

  const restoreSession = async () => {
    setAccountLoading(true);

    const result =
      await getCurrentCGPSession();

    if (
      result.ok &&
      result.data?.type === "cgp"
    ) {
      setAccountSession(result.data);
    } else {
      setAccountSession(null);
    }

    setAccountLoading(false);
  };

  useEffect(() => {
    checkApi();
    restoreSession();
  }, []);

  const handleLogin = async (form) => {
    setAccountError(null);
    setAccountBusy(true);

    const result =
      await loginCGPAccount(form);

    if (!result.ok) {
      setAccountError(
        result.data?.message ||
          result.data?.error ||
          result.error ||
          "Unable to sign in."
      );

      setAccountBusy(false);
      return;
    }

    setAccountSession(result.data);
    setAccountBusy(false);
    setActive("profile");
  };

  const handleRegister = async (form) => {
    setAccountError(null);
    setAccountBusy(true);

    const result =
      await registerCGPAccount(form);

    if (!result.ok) {
      setAccountError(
        result.data?.message ||
          result.data?.error ||
          result.error ||
          "Unable to create account."
      );

      setAccountBusy(false);
      return;
    }

    setAccountSession(result.data);
    setAccountBusy(false);
    setActive("profile");
  };

  const handleLogout = async () => {
    setAccountBusy(true);

    await logoutCGPAccount();

    setAccountSession(null);
    setAccountBusy(false);
    setActive("home");
  };

  const currentTitle =
    active === "profile"
      ? "Gaming Profile"
      : activeModule.label;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            C
          </div>

          <div className="brand-copy">
            <strong>CGP</strong>
            <span>Desktop</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-label">
            PLATFORM
          </p>

          {modules.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`nav-item ${
                active === item.id
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setActive(item.id)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-text">
                {item.label}
              </span>

              {item.state === "prototype" && (
                <small className="nav-badge">
                  LAB
                </small>
              )}
            </button>
          ))}

          {authenticated && (
            <>
              <p className="nav-label account-nav-label">
                ACCOUNT
              </p>

              <button
                type="button"
                className={`nav-item ${
                  active === "profile"
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setActive("profile")
                }
              >
                <span className="nav-icon">
                  ◉
                </span>

                <span className="nav-text">
                  Gaming Profile
                </span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
          >
            <span className="nav-icon">
              ⚙
            </span>

            <span className="nav-text">
              Settings
            </span>
          </button>

          <div className="platform-state">
            <span
              className={`status-dot ${
                connected
                  ? ""
                  : "status-dot-offline"
              }`}
            />

            <div>
              <strong>Platform</strong>

              <span>
                {apiStatus.state === "checking"
                  ? "Connecting..."
                  : connected
                    ? "Connected"
                    : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              CGP PLATFORM
            </span>

            <h1>{currentTitle}</h1>
          </div>

          <div className="top-actions">
            <button
              type="button"
              className="icon-button"
            >
              ⌕
            </button>

            {accountLoading ? (
              <button
                type="button"
                className="profile-button"
                disabled
              >
                <span className="profile-avatar">
                  ··
                </span>

                <span className="profile-copy">
                  <strong>Loading</strong>
                  <small>Checking session</small>
                </span>
              </button>
            ) : authenticated ? (
              <button
                type="button"
                className="profile-button"
                onClick={() =>
                  setActive("profile")
                }
              >
                <span className="profile-avatar">
                  {profileInitials}
                </span>

                <span className="profile-copy">
                  <strong>
                    {accountSession.profile?.displayName ||
                      accountSession.account?.username}
                  </strong>

                  <small>
                    @{accountSession.profile?.handle}
                  </small>
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="profile-button"
                onClick={() => {
                  setAccountMode("login");
                  setActive("account");
                }}
              >
                <span className="profile-avatar">
                  CG
                </span>

                <span className="profile-copy">
                  <strong>Sign In</strong>
                  <small>CGP Account</small>
                </span>
              </button>
            )}
          </div>
        </header>

        {active === "home" && (
          <div className="content">
            <section className="hero">
              <div className="hero-copy">
                <span className="section-tag">
                  DESKTOP CLIENT · ALPHA
                </span>

                <h2>
                  Control your competitive ecosystem.
                </h2>

                <p>
                  One interface for CGP services, competition systems,
                  statistics and local integrations.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() =>
                      setActive("competition")
                    }
                  >
                    Explore platform
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      setActive("inspector")
                    }
                  >
                    Integration Inspector
                  </button>
                </div>
              </div>

              <div className="connection-panel">
                <div className="connection-header">
                  <span>
                    PLATFORM CONNECTION
                  </span>

                  <span className="connection-badge">
                    {connectionMode}
                  </span>
                </div>

                <div className="connection-status">
                  <span
                    className={`large-dot ${
                      connected
                        ? ""
                        : "status-dot-offline"
                    }`}
                  />

                  <div>
                    <strong>
                      {connected
                        ? "Platform connected"
                        : apiStatus.state === "checking"
                          ? "Connecting..."
                          : "Platform unavailable"}
                    </strong>

                    <span>
                      {connected
                        ? `${apiStatus.service} · ${apiStatus.latency} ms`
                        : apiStatus.error ||
                          "Checking CGP API"}
                    </span>
                  </div>
                </div>

                <div className="connection-grid">
                  <div>
                    <span>Client</span>
                    <strong>ONLINE</strong>
                  </div>

                  <div>
                    <span>API</span>
                    <strong>
                      {apiStatus.state.toUpperCase()}
                    </strong>
                  </div>

                  <div>
                    <span>Server</span>
                    <strong>
                      {apiStatus.version || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Account</span>
                    <strong>
                      {authenticated
                        ? "SIGNED IN"
                        : "GUEST"}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {!authenticated &&
              !accountLoading && (
                <section className="account-callout">
                  <div>
                    <span className="section-tag">
                      YOUR CGP IDENTITY
                    </span>

                    <h3>
                      Create your Gaming Profile.
                    </h3>

                    <p>
                      A CGP Account gives you a native Gaming Profile
                      and your internal CGP address. External platforms
                      can be linked later.
                    </p>
                  </div>

                  <div className="account-callout-actions">
                    <button
                      type="button"
                      className="primary"
                      onClick={() => {
                        setAccountMode("register");
                        setAccountError(null);
                        setActive("account");
                      }}
                    >
                      Create Account
                    </button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={() => {
                        setAccountMode("login");
                        setAccountError(null);
                        setActive("account");
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                </section>
              )}

            <section className="section-heading">
              <div>
                <span className="eyebrow">
                  CAPABILITIES
                </span>

                <h3>
                  Platform modules
                </h3>
              </div>

              <span className="muted">
                Select a module to begin testing
              </span>
            </section>

            <section className="module-grid">
              {cards.map((card) => (
                <article
                  className="module-card"
                  key={card.id}
                  onClick={() =>
                    setActive(card.id)
                  }
                >
                  <div className="card-top">
                    <span
                      className={`pill ${
                        card.status === "PROTOTYPE"
                          ? "prototype"
                          : ""
                      }`}
                    >
                      {card.status}
                    </span>

                    <button type="button">
                      →
                    </button>
                  </div>

                  <h4>{card.title}</h4>

                  <p>{card.description}</p>

                  <div className="card-footer">
                    {card.metric}
                  </div>
                </article>
              ))}
            </section>
          </div>
        )}

        {active === "account" && (
          <div className="content">
            {authenticated ? (
              <ProfileView
                session={accountSession}
                onLogout={handleLogout}
                busy={accountBusy}
              />
            ) : (
              <AccountPanel
                mode={accountMode}
                setMode={(mode) => {
                  setAccountError(null);
                  setAccountMode(mode);
                }}
                busy={accountBusy}
                error={accountError}
                onLogin={handleLogin}
                onRegister={handleRegister}
              />
            )}
          </div>
        )}

        {active === "profile" &&
          authenticated && (
            <ProfileView
              session={accountSession}
              onLogout={handleLogout}
              busy={accountBusy}
            />
          )}

        {active === "inspector" && (
          <div className="content inspector-content">
            <IntegrationInspector />
          </div>
        )}

        {![
          "home",
          "account",
          "profile",
          "inspector",
        ].includes(active) && (
          <div className="content">
            <section className="module-workspace">
              <span className="section-tag">
                MODULE WORKSPACE
              </span>

              <h2>
                {activeModule.label}
              </h2>

              <p>
                This workspace is ready for its first real CGP integration.
                Capabilities will be connected here according to development
                priority.
              </p>

              <div className="workspace-state">
                <span>
                  Current state
                </span>

                <strong>
                  {activeModule.state === "prototype"
                    ? "PROTOTYPE"
                    : "READY FOR INTEGRATION"}
                </strong>
              </div>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  setActive("home")
                }
              >
                ← Return home
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;