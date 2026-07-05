# ADR-003: One Object, One Owner

## Decision

Every domain object has exactly one owner Engine.

## Reason

This prevents duplicated logic and cross-engine data corruption.

## Consequence

Engines must request actions from the owner Engine instead of modifying foreign objects directly.
