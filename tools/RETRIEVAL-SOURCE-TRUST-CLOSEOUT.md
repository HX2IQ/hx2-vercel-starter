# HX2 Retrieval Source Trust Closeout

## Phase

Phase 2.12 — Retrieval Source Trust Quality Upgrade

## Status

GREEN: Active and wired into quick verify.

## Purpose

This phase upgrades HX2 retrieval verification from simple relevance-only smoke testing to a stronger retrieval quality posture that separates:

- retrieval relevance
- source trust visibility
- runtime source scoring contract
- crypto aggregator/watchlist demotion logic

## Completed Work

### 2.12B — Retrieval Source Trust Radar

Added:

- `tools/retrieval-quality/hx2-retrieval-source-trust-radar.ps1`
- `npm run hx2:retrieval:source-trust`

Purpose:

- Classifies retrieval results as GREEN, YELLOW, UNKNOWN, or RED.
- Flags watchlist crypto aggregator sources without failing non-strict mode.
- Separates answer relevance from source quality.

### 2.12C — Retrieval Quality Verify Bundle

Added:

- `tools/retrieval-quality/hx2-retrieval-quality-verify-bundle.ps1`
- `npm run hx2:retrieval:quality:verify`

Purpose:

- Bundles retrieval relevance smoke and source trust radar into one verification surface.

### 2.12D — Quick Verify Wiring

Updated:

- `tools/hx2-quick-verify.ps1`

Purpose:

- Replaced standalone retrieval quality smoke with the retrieval quality verify bundle.
- Quick verify now checks both relevance and source trust signals.

### 2.12F — Runtime Retrieval Source Trust Scoring

Updated:

- `app/api/hx2/_lib/unified-retrieval.ts`

Added:

- `tools/retrieval-quality/hx2-retrieval-source-trust-scoring-guard.ps1`

Purpose:

- Adds runtime source-trust scoring support.
- Adds explicit authority boosts.
- Adds watchlist and aggregator demotion logic.
- Guards the scoring contract through static verification.

### 2.12G — Scoring Guard Bundle Wiring

Updated:

- `tools/retrieval-quality/hx2-retrieval-quality-verify-bundle.ps1`

Purpose:

- Adds source trust scoring guard as the third required check in the retrieval quality verification bundle.

## Active Verification Stack

Quick verify now runs:

1. `tools/retrieval-quality-smoke.ps1`
2. `tools/retrieval-quality/hx2-retrieval-source-trust-radar.ps1`
3. `tools/retrieval-quality/hx2-retrieval-source-trust-scoring-guard.ps1`

Through:

- `tools/retrieval-quality/hx2-retrieval-quality-verify-bundle.ps1`

And the bundle is wired into:

- `tools/hx2-quick-verify.ps1`

## Current Trust Mode

Non-strict source trust mode is the default.

Reason:

- Watchlist or UNKNOWN trust rows should identify where ranking/source surfacing must improve.
- They should not yet fail all quick verify runs while retrieval sources remain live and variable.

Strict mode should only become default after the runtime consistently produces trusted source markers for stable factual definitions and current-news retrieval.

## Current Guard Meaning

GREEN retrieval quality smoke means:

- The answer is relevant.

GREEN source trust radar means:

- No required signal failed.
- Watchlist or UNKNOWN source trust may still appear in non-strict mode for visibility.

GREEN source trust scoring guard means:

- Runtime source-trust scoring code includes explicit trust helpers, authority boosts, and watchlist demotions.

## Known Follow-Up

Future source-trust upgrades should focus on:

- surfacing source domains more consistently in API responses
- reducing UNKNOWN trust rows for stable definitions such as DTCC
- demoting weak crypto aggregator results below primary or higher-trust sources
- eventually enabling strict trust for selected retrieval smoke cases

## Operating Rule

Do not remove the retrieval quality verify bundle from quick verify.

Any future retrieval, news, crypto, source, or ranking patch must pass:

- `npm run hx2:retrieval:quality:verify`
- `npm run hx2:quick:compact`
- `npm run hx2:benchmark`

