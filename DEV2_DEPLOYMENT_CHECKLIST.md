# DEV2 DEPLOYMENT CHECKLIST

Before deploy:
1. git status --short
2. git branch --show-current
3. git rev-parse HEAD
4. type .vercel\project.json
5. type vercel.json
6. powershell -ExecutionPolicy Bypass -File .\tools\dev2-topology-guard.ps1
7. npx tsc --noEmit --pretty false
8. npm run build

Deploy:
1. git add -A
2. git commit -m "<message>"
3. git push origin main
4. npx vercel --prod --force

After deploy:
1. powershell -ExecutionPolicy Bypass -File .\tools\dev2-route-contract-guard.ps1 -BaseUrl "https://optinodeiq.com"
2. powershell -ExecutionPolicy Bypass -File .\tools\dev2-vercel-proof.ps1 -BaseUrl "https://optinodeiq.com"

Stop rule:
If a route returns 404, first inspect whether the generated URL is correct. Use `${Route}` before query strings.
