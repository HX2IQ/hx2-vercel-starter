# Minimal Python test client
# Usage: python3 tests/test-python.py "https://YOUR-VERCEL-APP.vercel.app/api/chatgpt-proxy?target=hx2test"
import sys, json, urllib.request

if len(sys.argv) < 2:
    print('Usage: python3 tests/test-python.py "<proxy-url>?target=hx2test"')
    sys.exit(1)

url = sys.argv[1]
req = urllib.request.Request(url, method='GET')
with urllib.request.urlopen(req) as resp:
    body = resp.read().decode('utf-8')
    print("Status:", resp.status)
    print("Headers:", dict(resp.headers))
    print("Body:", body)
