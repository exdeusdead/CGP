import { useEffect, useState } from "react";
import "./App.css";

const CGP_API_URL = "http://87.99.138.202:3030";

const modules = [
  { id: "home", icon: "⌂", label: "Home", state: "active" },
  { id: "competition", icon: "◈", label: "Competition", state: "ready" },
  { id: "teams", icon: "◆", label: "Teams", state: "ready" },
  { id: "statistics", icon: "▥", label: "Statistics", state: "ready" },
  { id: "media", icon: "▶", label: "Media Center", state: "ready" },
  {
    id: "tournament",
    icon: "⚡",
    label: "Tournament Mode",
    state: "prototype",
  },
];

const cards = [
  {
    id: "competition",
    title: "Competition",
    description:
      "Competition management and competitive operations.",
    status: "READY",
    metric: "Engine available",
  },
  {
    id: "statistics",
    title: "Statistics",
    description:
      "Player statistics, profiles and synchronized game data.",
    status: "READY",
    metric: "Service available",
  },
  {
    id: "media",
    title: "Media Center",
    description:
      "Publishing, announcements and platform media.",
    status: "READY",
    metric: "MediaOS available",
  },
  {
    id: "tournament",
    title: "Tournament Mode",
    description:
      "Competitive PC preparation and tournament readiness.",
    status: "PROTOTYPE",
    metric: "Development queue",
  },
];

function App() {
  const [active, setActive] = useState("home");

  const [apiStatus, setApiStatus] = useState({
    state: "checking",
    service: null,
    version: null,
    latency: null,
    error: null,
  });

  const activeModule =
    modules.find((item) => item.id === active) || modules[0];

  const openModule = (id) => {
    setActive(id);
  };

  const checkApi = async () => {
    setApiStatus((current) => ({
      ...current,
      state: "checking",
      error: null,
    }));

    const startedAt = performance.now();

    try {
      const response = await fetch(
        `${CGP_API_URL}/api/health`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setApiStatus({
        state:
          data.status === "online"
            ? "online"
            : "degraded",
        service: data.service || "CGP API",
        version: data.version || null,
        latency: Math.round(
          performance.now() - startedAt
        ),
        error: null,
      });
    } catch (error) {
      setApiStatus({
        state: "offline",
        service: null,
        version: null,
        latency: null,
        error:
          error instanceof Error
            ? error.message
            : "Connection failed",
      });
    }
  };

  useEffect(() => {
    checkApi();
  }, []);

  const apiLabel =
    apiStatus.state === "checking"
      ? "CHECKING"
      : apiStatus.state.toUpperCase();

  const platformConnected =
    apiStatus.state === "online";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>

          <div className="brand-copy">
            <strong>CGP</strong>
            <span>Desktop</span>
          </div>
        </div>

        <nav className="navigation">
          <p className="nav-label">PLATFORM</p>

          {modules.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`nav-item ${
                active === item.id ? "selected" : ""
              }`}
              onClick={() => openModule(item.id)}
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
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
          >
            <span className="nav-icon">⚙</span>
            <span className="nav-text">
              Settings
            </span>
          </button>

          <div className="platform-state">
            <span
              className={`status-dot ${
                platformConnected
                  ? ""
                  : "status-dot-offline"
              }`}
            />

            <div>
              <strong>Platform</strong>

              <span>
                {apiStatus.state === "checking"
                  ? "Connecting..."
                  : platformConnected
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

            <h1>{activeModule.label}</h1>
          </div>

          <div className="top-actions">
            <button
              type="button"
              className="icon-button"
            >
              ⌕
            </button>

            <button
              type="button"
              className="profile-button"
            >
              <span className="profile-avatar">
                EX
              </span>

              <span className="profile-copy">
                <strong>Developer</strong>
                <small>Local Client</small>
              </span>
            </button>
          </div>
        </header>

        {active === "home" ? (
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
                  One interface for CGP services,
                  competition systems, statistics and
                  local integrations.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() =>
                      openModule("competition")
                    }
                  >
                    Explore platform
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={checkApi}
                  >
                    Test connection
                  </button>
                </div>
              </div>

              <div className="connection-panel">
                <div className="connection-header">
                  <span>
                    PLATFORM CONNECTION
                  </span>

                  <span className="connection-badge">
                    REMOTE
                  </span>
                </div>

                <div className="connection-status">
                  <span
                    className={`large-dot ${
                      platformConnected
                        ? ""
                        : "status-dot-offline"
                    }`}
                  />

                  <div>
                    <strong>
                      {platformConnected
                        ? "Platform connected"
                        : apiStatus.state ===
                            "checking"
                          ? "Connecting to platform..."
                          : "Platform unavailable"}
                    </strong>

                    <span>
                      {platformConnected
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
                    <strong>{apiLabel}</strong>
                  </div>

                  <div>
                    <span>Server</span>
                    <strong>
                      {apiStatus.version || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Mode</span>
                    <strong>DEV</strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="section-heading">
              <div>
                <span className="eyebrow">
                  CAPABILITIES
                </span>

                <h3>Platform modules</h3>
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
                    openModule(card.id)
                  }
                >
                  <div className="card-top">
                    <span
                      className={`pill ${
                        card.status ===
                        "PROTOTYPE"
                          ? "prototype"
                          : ""
                      }`}
                    >
                      {card.status}
                    </span>

                    <button
                      type="button"
                      aria-label={`Open ${card.title}`}
                    >
                      →
                    </button>
                  </div>

                  <h4>{card.title}</h4>

                  <p>
                    {card.description}
                  </p>

                  <div className="card-footer">
                    {card.metric}
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <div className="content">
            <section className="module-workspace">
              <span className="section-tag">
                MODULE WORKSPACE
              </span>

              <h2>
                {activeModule.label}
              </h2>

              <p>
                This workspace is ready for its
                first real CGP integration.
                Capabilities will be connected here
                according to development priority.
              </p>

              <div className="workspace-state">
                <span>Current state</span>

                <strong>
                  {activeModule.state ===
                  "prototype"
                    ? "PROTOTYPE"
                    : "READY FOR INTEGRATION"}
                </strong>
              </div>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  openModule("home")
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