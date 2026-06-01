# DEV2 DEPLOYMENT TRUTH

A Vercel deployment marked READY is not enough proof.

Deployment truth requires all of the following:
- local repo identity
- branch identity
- HEAD SHA
- Vercel project link
- Vercel rootDirectory
- vercel.json topology
- local route files
- local build artifacts
- deployed URL
- canonical alias
- live HTTP route verification

Known failure classes:
1. Wrong Vercel project
2. Wrong rootDirectory
3. Stale vercel.json route override
4. Duplicate app/api vs src/app/api topology
5. Alias mismatch
6. Deployment SHA mismatch
7. Verification script URL construction bug
8. Stale deployment probe
9. Static/dynamic route mismatch

Permanent DEV2 rule:
Every new production route must have local file verification, local build artifact verification, and live route verification.
