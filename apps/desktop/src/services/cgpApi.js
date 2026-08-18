const CGP_API_BASE_URL =
  import.meta.env.VITE_CGP_API_URL ||
  "http://87.99.138.202:3030";

export const CGP_INTEGRATIONS = [
  {
    id: "core",
    name: "CGP API",
    group: "Core",
    description:
      "Public CGP platform API and primary connectivity.",
    endpoint: "/api/health",
    method: "GET",
    access: "public",
  },

  {
    id: "statistics",
    name: "Statistics",
    group: "Product",
    description:
      "Rainbow Six player statistics and synchronized profile data.",
    endpoint: "/api/stats/health",
    method: "GET",
    access: "public",
  },

  {
    id: "products",
    name: "Products",
    group: "Platform",
    description:
      "CGP product registry and product information.",
    endpoint: "/api/products",
    method: "GET",
    access: "public",
  },

  {
    id: "identity",
    name: "Identity",
    group: "Platform",
    description:
      "Identity resolution and CGP user directory.",
    endpoint: "/api/identity/users",
    method: "GET",
    access: "public",
  },

  {
    id: "membership",
    name: "Membership",
    group: "Platform",
    description:
      "Community membership, product access, roles and permissions.",
    endpoint: "/api/membership/access/rainbowsixcuba",
    method: "GET",
    access: "protected",
  },

  {
    id: "accounts",
    name: "Accounts",
    group: "Platform",
    description:
      "Linked CGP accounts for the authenticated user.",
    endpoint: "/api/accounts/me",
    method: "GET",
    access: "protected",
  },

  {
    id: "companion",
    name: "Companion",
    group: "Product",
    description:
      "CGP Companion configuration and synchronization interface.",
    endpoint: "/api/companion/config",
    method: "GET",
    access: "public",
  },

  {
    id: "authentication",
    name: "Authentication",
    group: "Platform",
    description:
      "CGP token verification and authenticated session services.",
    endpoint: "/api/auth/verify",
    method: "GET",
    access: "authentication",
  },
];

export function getApiBaseUrl() {
  return CGP_API_BASE_URL;
}

export function getApiUrl(path) {
  return `${CGP_API_BASE_URL}${path}`;
}

export function getStoredToken() {
  return localStorage.getItem("cgp_token");
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem("cgp_token");
    return;
  }

  localStorage.setItem("cgp_token", token);
}

export function clearStoredToken() {
  localStorage.removeItem("cgp_token");
}

export async function requestCGP(path, options = {}) {
  const startedAt = performance.now();

  const token =
    options.token !== undefined
      ? options.token
      : getStoredToken();

  const {
    token: ignoredToken,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  try {
    const response = await fetch(getApiUrl(path), {
      ...fetchOptions,

      headers: {
        Accept: "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(customHeaders || {}),
      },
    });

    const latency = Math.round(
      performance.now() - startedAt
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data = null;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || null;
    }

    return {
      ok: response.ok,
      status: response.status,
      latency,
      data,
      error: response.ok
        ? null
        : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      latency: Math.round(
        performance.now() - startedAt
      ),
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Connection failed",
    };
  }
}

export async function checkCGPHealth() {
  const result = await requestCGP(
    "/api/health",
    {
      token: null,
    }
  );

  if (!result.ok) {
    return {
      state: "offline",
      service: null,
      version: null,
      latency: result.latency,
      statusCode: result.status,
      error: result.error,
      raw: result.data,
    };
  }

  const data = result.data || {};

  return {
    state:
      data.status === "online"
        ? "online"
        : "degraded",

    service:
      data.service || "CGP API",

    version:
      data.version || null,

    latency:
      result.latency,

    statusCode:
      result.status,

    error: null,

    raw: data,
  };
}

function determineIntegrationState(
  integration,
  result
) {
  if (result.ok) {
    return "online";
  }

  /*
   * Protected CGP services are expected to reject
   * unauthenticated requests.
   *
   * A 401 or 403 therefore proves that the route
   * exists and that its authentication boundary
   * is responding correctly.
   */
  if (
    (integration.access === "protected" ||
      integration.access === "authentication") &&
    (result.status === 401 ||
      result.status === 403)
  ) {
    return "auth-required";
  }

  return "unavailable";
}

export async function inspectIntegration(
  integration
) {
  const result = await requestCGP(
    integration.endpoint,
    {
      method:
        integration.method || "GET",
    }
  );

  const state =
    determineIntegrationState(
      integration,
      result
    );

  return {
    id: integration.id,
    name: integration.name,
    group: integration.group,
    access: integration.access,

    endpoint:
      integration.endpoint,

    url:
      getApiUrl(
        integration.endpoint
      ),

    method:
      integration.method || "GET",

    state,

    statusCode:
      result.status,

    latency:
      result.latency,

    data:
      result.data,

    error:
      result.error,

    checkedAt:
      new Date().toISOString(),
  };
}