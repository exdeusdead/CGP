# Cuba Gaming Platform (CGP)
## System Architecture
Version: 0.1.0-alpha

---

# 1. Purpose

Cuba Gaming Platform (CGP) is the core platform responsible for managing esports organizations, players, competitions, media, statistics, identity, permissions and future intelligent services.

CGP is the product.

Discord bots, websites, desktop applications and APIs are clients of CGP.

---

# 2. Design Philosophy

CGP follows several core principles.

## Windows 98 First

A complete operational platform is more valuable than a perfect isolated module.

Every Engine reaches an operational state before additional complexity is added.

---

## Applications Do Not Own Business Logic

Applications only provide user interfaces.

Business rules belong to CGP Engines.

Examples of applications:

- RainbowSixCubaBot
- Website
- Desktop Studio
- API Gateway
- Mobile Applications

---

## One Engine, One Responsibility

Every Engine owns exactly one domain.

Example:

Identity Engine
    owns Identity

Competition Engine
    owns Competitions

MediaOS
    owns Drafts

Distribution Engine
    owns Deliveries

---

## One Object, One Owner

Every domain object has exactly one owner Engine.

No Engine modifies foreign objects directly.

---

## Immutable History

Historical records are never modified.

Examples:

- Roster Snapshots
- Published Deliveries
- Match Results
- Penalty Records

New records are created instead of editing history.

---

# 3. Platform Layers

CGP consists of several layers.

Platform Core

↓

Domain Engines

↓

Capability Layer

↓

API Layer

↓

Applications

---

# 4. Platform Core

Responsible for runtime infrastructure.

Current components:

- Storage Engine
- Runtime Engine
- Config Engine
- Logger Engine
- Backup Engine
- Scheduler Engine
- Dashboard Engine
- Render Engine

Platform Core never contains esports business logic.

---

# 5. Domain Engines

Current Engines

- Identity Engine
- Competition Engine
- MediaOS
- Distribution Engine
- Website Engine

Planned Engines

- Capability Engine
- Player Engine
- Organization Engine
- Statistics Engine
- Notification Engine
- Analytics Engine
- Audit Engine
- Talent Intelligence Engine

---

# 6. Capability Layer

Capability Engine will become the security kernel of CGP.

Applications will request capabilities.

Applications will not communicate directly with Engines.

Example

Desktop Studio

↓

Capability Engine

↓

Competition Engine

---

# 7. Applications

Applications consume CGP.

Current

- RainbowSixCubaBot

Future

- Website
- Desktop Studio
- API Gateway
- Mobile App

Applications remain lightweight.

They should contain:

- User Interface
- Input Validation
- Rendering
- Requests to CGP

Applications should not duplicate Engine logic.

---

# 8. Runtime

Current Runtime

Hetzner Server

Runs

- Discord Client
- Website
- Platform Core
- Storage
- Engines
- Logs
- Backups

Administrator Interface

Local Desktop

Future

CGP Desktop Studio

↓

HTTPS / WebSocket

↓

Hetzner Runtime

---

# 9. Object Ownership

Identity
    Owner:
        Identity Engine

Player
    Owner:
        Player Engine

Organization
    Owner:
        Organization Engine

Competition
    Owner:
        Competition Engine

Competition Team
    Owner:
        Competition Engine

Roster Snapshot
    Owner:
        Competition Engine

Draft
    Owner:
        MediaOS

Asset
    Owner:
        Asset Engine

Delivery
    Owner:
        Distribution Engine

---

# 10. Long-Term Vision

CGP is designed to become a complete esports platform.

Rainbow Six CUBA is the first implementation.

Future organizations, games and partners will consume the same Core.

No application should own the platform.

CGP owns the platform.

Applications consume CGP.

---

End of Document
