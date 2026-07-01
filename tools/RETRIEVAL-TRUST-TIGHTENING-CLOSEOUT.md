# HX2 Retrieval Trust Tightening Closeout

Phase: 2.14
Status: GREEN / repo-locked
Date: 2026-06-30

## Purpose

Phase 2.14 tightened HX2 retrieval source trust by making source trust evaluation evidence-aware, removing false watchlist contamination from raw lower-ranked retrieval data, and ensuring definition queries can surface official/local authoritative sources before general reference sources.

## Key Upgrade: Evidence-Aware Trust Radar

Before this phase, the source trust radar scanned the answer plus the full JSON response. That caused false YELLOW rows when lower-ranked raw retrieval sources included watchlist domains that were not actually surfaced as final evidence.

The radar now grades curated evidence first:

- source_evidence
- source_domains
- source_titles
- source_urls

It falls back to answer text only when structured evidence is unavailable.

## Key Upgrade: DTCC Official Definition Source

The DTCC definition query previously surfaced Wikipedia as the only source evidence.

Now definition-only retrieval includes local authoritative definitions before Wikipedia so official source domains can rank first.

Confirmed live:

- what is DTCC
- source_domains includes dtcc.com
- first source_evidence item is hx2_local_definition -> https://www.dtcc.com/
- Wikipedia remains available as secondary reference evidence

## Retrieval Quality Bundle Expansion

The retrieval quality verify bundle now checks:

1. Retrieval quality smoke
2. Retrieval source trust radar
3. Retrieval source trust scoring guard
4. Source evidence contract guard
5. Source evidence domain normalization guard
6. Source evidence publisher attribution guard
7. Authoritative definition source preference guard

Expected summary:

- Green: 7
- Red: 0

## Latest Confirmed Verification

- Quick verify: 41 guards passed
- Retrieval quality verify bundle: 7/7 GREEN
- Radar WatchlistRows: 0
- Radar UnknownRows: 0
- StructuredEvidenceRows: 3
- Benchmark: 9.88 average, 8/8 passing
- Working tree: clean

## Key Commits

- 7e58525 Make source trust radar evidence-aware
- 19dc8a8 Prefer authoritative local definitions for source trust
- 2223d2d Wire definition source guard into retrieval quality verify

## Current Retrieval Trust Stack

HX2 retrieval now has:

- relevance smoke coverage
- evidence-aware source trust radar
- runtime source-trust scoring guard
- structured source evidence contract guard
- publisher domain normalization guard
- publisher attribution precision guard
- authoritative definition source preference guard

## Closeout Decision

Phase 2.14 is complete.

Recommended next phase:

Phase 2.15 — Strict Trust Mode Preparation / Optional Strict Gate

