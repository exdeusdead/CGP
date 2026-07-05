# CGP Provider Layer

## Purpose

Providers adapt external platforms into CGP internal models.

Providers do not own data.
Providers do not own players.
Providers do not calculate rankings.

They only fetch and normalize external data.

## Initial Providers

- r6tracker
- ubisoft
- faceit
- steam
- riot

## Provider Contract

Every provider should expose:

- fetchPlayer()
- fetchOverview()
- fetchRank()
- fetchMatches()
- fetchOperators()
- fetchMaps()
- fetchSeasons()

## Current Status

Provider Layer v0.1 created.

R6 Tracker provider exists as a stub provider.
