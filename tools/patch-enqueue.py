import re, pathlib, sys

FILE = r"app/api/ap2/task/enqueue/route.ts"
p = pathlib.Path(FILE)
s = p.read_text(encoding="utf-8")

# 1) Ensure ioredis import exists
if 'from "ioredis"' not in s and "from 'ioredis'" not in s:
    # Insert after existing imports (best-effort)
    m = re.search(r"^(import[^\n]*\n)+", s, flags=re.M)
    if m:
        insert_at = m.end()
        s = s[:insert_at] + 'import Redis from "ioredis";\n' + s[insert_at:]
    else:
        s = 'import Redis from "ioredis";\n' + s

# 2) Replace ONLY the queue push lines (leave task SET via upstash intact)
# We replace the pair:
#   await upstash(`lpush/...("ap2queue")...`);
#   await upstash(`rpush/...("ap2:queue")...(taskJson)...`);
pat = re.compile(
    r"""
    \s*await\s+upstash\(`lpush/\$\{encodeURIComponent\("ap2queue"\)\}/\$\{encodeURIComponent\(taskId\)\}`\);\s*\n
    \s*await\s+upstash\(`rpush/\$\{encodeURIComponent\("ap2:queue"\)\}/\$\{encodeURIComponent\(taskJson\)\}`\);\s*
    """,
    flags=re.X
)

if not pat.search(s):
    print("ERR: Could not find expected Upstash LPUSH/RPUSH lines to replace.")
    sys.exit(2)

replacement = r'''
    // DEV2.STB: Push to TCP Redis queue so the VPS worker (BRPOP) actually receives tasks.
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error("REDIS_URL missing for /api/ap2/task/enqueue");

    const queueKey = process.env.AP2_QUEUE_KEY || "ap2:queue";

    const redis = new Redis(redisUrl, {
      tls: String(redisUrl).startsWith("rediss://") ? {} : undefined,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    try {
      // Worker uses BRPOP (right pop). Use LPUSH for FIFO behavior.
      await redis.lpush(queueKey, taskJson);
    } finally {
      redis.disconnect();
    }
'''

s2 = pat.sub(replacement, s, count=1)
p.write_text(s2, encoding="utf-8")
print("OK: patched enqueue route to TCP Redis LPUSH(queueKey, taskJson)")
