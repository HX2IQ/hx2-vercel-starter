Sprint next: Add X2 live crypto/news fallback with entity query expansion.

CURRENT CHECKPOINT
- Repo is clean and synced on main.
- Definitions are working better:
  - What is XRP?
  - What is DTCC?
- Bitcoin market update can retrieve RSS/news signals.
- Failure still present:
  - What is the latest XRP news? returns no relevant current news result.

GOAL
Fix the X2 current-news retrieval gap without breaking definition answers.

IMPLEMENTATION REQUIREMENTS
1. Add a fallback path for X2 market/news queries when existing retrieval has no relevant result.
2. For crypto entities, expand user queries into stronger news-search variants:
   - XRP -> XRP, Ripple, Ripple XRP, XRP ETF, XRP Ledger
   - XLM -> Stellar, Stellar Lumens, XLM
   - HBAR -> Hedera, HBAR
   - BTC -> Bitcoin, BTC
3. Prefer fresh RSS/news sources for latest/current/market/news queries.
4. Keep definition queries protected:
   - What is XRP? should still answer as a definition.
   - What is DTCC? should still answer as a definition.
5. Do not hallucinate news.
6. If no strong current result exists after fallback, say so clearly.
7. Add or extend a retrieval quality probe covering:
   - What is XRP?
   - What is DTCC?
   - What is the latest XRP news?
   - Latest XRP ETF news
   - Latest Ripple SEC news
   - Latest XLM DTCC news
   - Give me a current Bitcoin market update

VALIDATION REQUIRED
- npx tsc --noEmit --pretty false
- npm run build
- Run the retrieval quality probe.
- Confirm no definition regression.
- Confirm no stale or wrong XRP news result.

COMMIT MESSAGE
Add X2 live news fallback and crypto query expansion
