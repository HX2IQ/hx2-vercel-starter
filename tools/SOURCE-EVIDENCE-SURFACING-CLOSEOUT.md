# HX2 Source Evidence Surfacing Closeout

Phase: 2.13
Status: GREEN / repo-locked
Date: 2026-06-30

## Purpose

Phase 2.13 upgraded HX2 retrieval output from answer-only sourcing to structured source evidence surfacing.

Before this phase, retrieved answers included source context inside the narrative text, but API consumers did not receive structured fields for source evidence, source titles, source domains, source URLs, or retrieval summary metadata.

After this phase, chat-master retrieval responses expose structured evidence while preserving the existing visible answer text.

## Added Response Contract

The chat-master response now exposes:

- source_evidence
- source_titles
- source_domains
- source_urls
- retrieval_summary

The existing answer mirrors remain preserved:

- answer
- reply
- message
- content
- text

## Publisher Domain Normalization

Google News relay URLs are no longer treated as the publisher domain when the source/title exposes a real publisher.

Confirmed live examples:

- Ripple official article -> ripple.com
- CoinDesk article -> coindesk.com
- Decrypt article -> decrypt.co
- Bitget article -> bitget.com
- DTCC article -> dtcc.com

## Guards Added

Phase 2.13 added and/or wired the following guards:

- hx2-source-evidence-contract-guard.ps1
- hx2-source-evidence-domain-normalization-guard.ps1
- hx2-source-evidence-publisher-attribution-guard.ps1

These are now included in the retrieval quality verify bundle.

## Retrieval Quality Bundle Expansion

The retrieval quality verify bundle now checks:

1. Retrieval quality smoke
2. Retrieval source trust radar
3. Retrieval source trust scoring guard
4. Source evidence contract guard
5. Source evidence domain normalization guard
6. Source evidence publisher attribution guard

Expected summary:

- Green: 6
- Red: 0

## Verification Record

Latest confirmed verification:

- Quick verify: 41 guards passed
- Retrieval quality verify bundle: 6/6 GREEN
- Benchmark: 9.88 average, 8/8 passing
- Working tree: clean

## Key Commits

- 40e37df Add structured source evidence response contract
- d082835 Normalize source evidence publisher domains
- 401f69f Improve source evidence publisher attribution
- e56ac23 Wire source evidence guards into retrieval quality verify

## Known Non-Blocking Notes

The retrieval source trust radar remains intentionally non-strict. Watchlist and unknown rows may appear as YELLOW/UNKNOWN while relevance remains GREEN. This is expected until a later strict-trust upgrade phase.

## Closeout Decision

Phase 2.13 is complete.

HX2 retrieval now has:

- structured source evidence
- publisher-aware domain attribution
- preserved answer wording
- automated evidence guard coverage inside quick verify
- live production confirmation

Recommended next phase:

Phase 2.14 — Retrieval Trust Tightening / Strict-Trust Preparation

