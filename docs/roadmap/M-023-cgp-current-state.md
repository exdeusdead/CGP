# M-023 — CGP Current State

## Platform Status

Version: 0.1.0-alpha

CGP has reached its first complete operational chain:

Stats Collection → CGP Core → Public API → Website

---

## Completed Milestones

### M-018 — Public Statistics API

Completed:
- Statistics Engine connected.
- Public API routes created.
- CGP-API deployed through PM2.
- Statistics endpoints online.

Endpoints:

/api/health
/api/stats/health

---

### M-019 — API Gateway

Completed:
- NGINX gateway configured.
- Public CGP namespace created.

Public root:

https://api.rainbowsixcuba.com/cgp/api

---

### M-020 — Website Integration

Completed:
- cgpClient.js created.
- statisticsService.js created.
- Website consumes CGP API.
- StatisticsPanel connected.
- Offline fallback preserved.

---

### M-021 — Player Schema Adapter

Completed:
- playerAdapter.js created.
- CGP raw profiles converted to UI models.
- Prepared for multiple games/products.

---

### M-022 — Product Identity Layer

Completed:
- CGP Core identity separated.
- Product Registry created.

Current products:

- Rainbow Six CUBA

Modules:
- Discord
- Stats
- Website
- Companion

---

## Runtime

Active services:

- CGP-API
- RainbowSixCubaBot
- RainbowSixCubaStats

---

## Architecture

CGP Platform

Products
 └── Rainbow Six CUBA

Core
 ├── Engines
 ├── Services
 ├── Providers
 ├── API
 └── Shared Models


## Next

M-024 — CGP Operations Dashboard
