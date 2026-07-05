# M-033 — Companion Extension Transition

## Current State

Current Extension:

Rainbow Six CUBA Companion

Purpose:
- Ubisoft identity connection
- Rainbow Six Siege statistics synchronization
- Player profile support

Current Product:

Rainbow Six CUBA

---

# Target State

Extension becomes:

CGP Companion

CGP Companion is a platform client.

It does not belong to a single game.

---

# Architecture

CGP Companion

Core:
- Authentication
- Identity
- Session
- Product Access
- Provider Linking

Products:
- Rainbow Six CUBA

Providers:
- Ubisoft Connect

---

# Responsibilities

## CGP Owns

- Users
- Sessions
- Permissions
- Memberships
- Products
- Providers
- Statistics processing

## Companion Owns

- Browser integration
- Local session
- User interface
- Communication with CGP API

---

# Migration Strategy

Phase 1:

Keep:

Rainbow Six CUBA Companion

Change internally:

- Connect to CGP APIs
- Remove hardcoded product logic
- Use /companion/me
- Use product modules

---

Phase 2:

Rename:

Rainbow Six CUBA Companion

to:

CGP Companion

Update:

- Branding
- Icon
- Store listing
- Privacy Policy
- Documentation

---

Phase 3:

Enable future products.

Examples:

- New games
- New providers
- New communities

---

# Chrome Store Impact

Expected review required:

Yes

Reasons:

- Extension name change
- Branding update
- Privacy Policy update
- Purpose expansion

---

# Rule

No game-specific logic inside Companion Core.

Products extend CGP.
