# M-033.2 — Extension Rebrand Map

Version: 0.1.0-alpha

---

# Current Extension

Name:

Rainbow Six CUBA Stats Sync

Location:

RainbowSixCubaStats/extension

Purpose:

Capture Rainbow Six Siege data from R6 Tracker and synchronize it with Rainbow Six CUBA Stats.

---

# Target Extension

Name:

CGP Companion

Purpose:

Universal CGP browser companion.

The extension is no longer owned by a game.

Products provide modules.

---

# Architecture Change

Before:

Browser Extension
        |
        |
Rainbow Six CUBA Stats API
        |
        |
R6 Database


After:

Browser Extension
        |
        |
CGP API
        |
        |
CGP Core
        |
        |
Product Modules
        |
        |
Rainbow Six CUBA

---

# Ownership Migration

## Move to CGP

Identity:
- Discord identity
- Ubisoft account link
- User permissions
- Product access
- Memberships

Configuration:
- Active products
- Providers
- Features
- Version compatibility

---

# Extension Keeps

Browser responsibilities:

- Chrome APIs
- Tabs
- Storage
- Browser UI
- Page extraction

---

# Rainbow Six CUBA Module Keeps

Game responsibilities:

- R6 Tracker parser
- Ubisoft provider requirement
- Siege statistics sync

---

# Hardcoded Values Removed

Remove:

Rainbow Six CUBA branding from core

Remove:

Fixed API URLs

Old:

http://87.99.138.202:3007

New:

CGP manifest controlled endpoint

---

# Storage Migration

Old:

r6cubaAutoSync
discordId
apiUrl
apiKey

New:

cgpSession
cgpToken
enabledProducts
linkedProviders

---

# API Migration

Old:

POST /api/snapshot

POST /api/snapshot-bundle


New:

GET /api/companion/me

Product sync endpoints controlled by CGP.

---

# Chrome Store Changes Required

Yes.

Reasons:

- Name change
- Icon change
- Description change
- Privacy Policy expansion
- Permission explanation update

---

# Migration Rule

The extension must never know why a user has access.

It only asks CGP.
