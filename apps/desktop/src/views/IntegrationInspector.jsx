import { useEffect, useMemo, useState } from "react";
import {
  CGP_INTEGRATIONS,
  getApiBaseUrl,
  inspectIntegration,
} from "../services/cgpApi";

function formatTime(value) {
  if (!value) return "Not tested";

  return new Date(value).toLocaleTimeString();
}

function IntegrationInspector() {
  const [selectedId, setSelectedId] = useState("core");
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(null);

  const selected = useMemo(
    () =>
      CGP_INTEGRATIONS.find(
        (integration) => integration.id === selectedId
      ) || CGP_INTEGRATIONS[0],
    [selectedId]
  );

  const selectedResult = results[selected.id];

  const runTest = async (integration = selected) => {
    setTesting(integration.id);

    const result = await inspectIntegration(integration);

    setResults((current) => ({
      ...current,
      [integration.id]: result,
    }));

    setTesting(null);
  };

  const testAll = async () => {
    for (const integration of CGP_INTEGRATIONS) {
      setTesting(integration.id);

      const result = await inspectIntegration(integration);

      setResults((current) => ({
        ...current,
        [integration.id]: result,
      }));
    }

    setTesting(null);
  };

  useEffect(() => {
    runTest(CGP_INTEGRATIONS[0]);
  }, []);

  return (
    <div className="inspector">
      <section className="inspector-heading">
        <div>
          <span className="section-tag">M067 · LIVE DIAGNOSTICS</span>
          <h2>Integration Inspector</h2>
          <p>
            Test and inspect the CGP services currently exposed to the
            Desktop client.
          </p>
        </div>

        <button
          type="button"
          className="primary"
          onClick={testAll}
          disabled={testing !== null}
        >
          {testing ? "Testing..." : "Test all integrations"}
        </button>
      </section>

      <section className="inspector-summary">
        <div>
          <span>API TARGET</span>
          <strong>{getApiBaseUrl()}</strong>
        </div>

        <div>
          <span>INTEGRATIONS</span>
          <strong>{CGP_INTEGRATIONS.length}</strong>
        </div>

        <div>
          <span>TESTED</span>
          <strong>{Object.keys(results).length}</strong>
        </div>

        <div>
          <span>ONLINE</span>
          <strong>
            {
              Object.values(results).filter(
                (result) => result.state === "online"
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="inspector-layout">
        <div className="integration-list">
          <div className="panel-title">
            <span>INTEGRATIONS</span>
            <small>Live endpoints</small>
          </div>

          {CGP_INTEGRATIONS.map((integration) => {
            const result = results[integration.id];
            const isTesting = testing === integration.id;

            return (
              <button
                type="button"
                key={integration.id}
                className={`integration-row ${
                  selectedId === integration.id ? "active" : ""
                }`}
                onClick={() => setSelectedId(integration.id)}
              >
                <span
                  className={`integration-light ${
                    result?.state === "online"
                      ? "online"
                      : result?.state === "unavailable"
                        ? "offline"
                        : ""
                  }`}
                />

                <span className="integration-row-copy">
                  <strong>{integration.name}</strong>
                  <small>{integration.group}</small>
                </span>

                <span className="integration-row-state">
                  {isTesting
                    ? "TESTING"
                    : result
                      ? result.state.toUpperCase()
                      : "UNTESTED"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="integration-detail">
          <div className="detail-header">
            <div>
              <span className="eyebrow">{selected.group}</span>
              <h3>{selected.name}</h3>
              <p>{selected.description}</p>
            </div>

            <span
              className={`detail-status ${
                selectedResult?.state === "online"
                  ? "online"
                  : selectedResult?.state === "unavailable"
                    ? "offline"
                    : ""
              }`}
            >
              {testing === selected.id
                ? "TESTING"
                : selectedResult
                  ? selectedResult.state.toUpperCase()
                  : "UNTESTED"}
            </span>
          </div>

          <div className="endpoint-box">
            <span>{selected.method}</span>
            <code>{selected.endpoint}</code>

            <button
              type="button"
              className="secondary"
              onClick={() => runTest(selected)}
              disabled={testing !== null}
            >
              Run test
            </button>
          </div>

          <div className="detail-metrics">
            <div>
              <span>HTTP STATUS</span>
              <strong>
                {selectedResult?.statusCode ?? "—"}
              </strong>
            </div>

            <div>
              <span>LATENCY</span>
              <strong>
                {selectedResult?.latency != null
                  ? `${selectedResult.latency} ms`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>LAST CHECK</span>
              <strong>
                {formatTime(selectedResult?.checkedAt)}
              </strong>
            </div>

            <div>
              <span>METHOD</span>
              <strong>{selected.method}</strong>
            </div>
          </div>

          <div className="response-panel">
            <div className="panel-title">
              <span>SERVER RESPONSE</span>

              {selectedResult?.error && (
                <small className="response-error">
                  {selectedResult.error}
                </small>
              )}
            </div>

            <pre>
              {selectedResult
                ? JSON.stringify(
                    selectedResult.data ??
                      {
                        error:
                          selectedResult.error ||
                          "No response body",
                      },
                    null,
                    2
                  )
                : "Run the integration test to inspect the server response."}
            </pre>
          </div>

          <div className="request-url">
            <span>REQUEST URL</span>
            <code>
              {selectedResult?.url ||
                `${getApiBaseUrl()}${selected.endpoint}`}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}

export default IntegrationInspector;