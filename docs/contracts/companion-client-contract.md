# CGP Companion Client Contract

Version: 0.1.0-alpha

## Purpose

The Companion is a CGP client.

It does not own:

- Identity
- Permissions
- Product Access
- Statistics Logic

CGP Core owns those systems.

---

# Authentication

All private requests use:

Authorization: Bearer <CGP_TOKEN>

---

# Session Bootstrap

## Endpoint

GET /api/companion/me

## Returns

Current CGP session.

Includes:

- User identity
- Active session
- Product memberships
- Linked accounts
- Companion configuration

---

# User Object

Example:

{
  "id": "user-id",

  "roles": [
    "member"
  ],

  "resolvedPermissions": [
    "stats:read"
  ]
}

---

# Membership Object

Represents product access.

Example:

{
  "productId": "rainbow-six-cuba",

  "status": "active",

  "roles": [
    "player"
  ],

  "permissions": [
    "rainbow-six-cuba:*"
  ]
}

---

# Linked Account Object

External identities.

Examples:

- Ubisoft
- Discord
- Steam
- Riot

Example:

{
  "providerId": "ubisoft",

  "username": "Player",

  "status": "linked"
}

---

# Companion Config

Controls enabled products.

Example:

{
  "products": [
    {
      "id": "rainbow-six-cuba",

      "features": [
        "identity-link",
        "stats-sync"
      ],

      "providers": [
        "ubisoft"
      ]
    }
  ]
}

---

# Client Rules

1. Never store game logic.

2. Never calculate permissions.

3. Never decide product access.

4. Always ask CGP.

5. Products are modules.

6. Providers connect identities.

