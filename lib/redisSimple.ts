import net from "node:net";
import { URL } from "node:url";

type RedisUrlParts = {
  host: string;
  port: number;
  password?: string;
  db: number;
};

function parseRedisUrl(redisUrl: string): RedisUrlParts {
  const u = new URL(redisUrl);
  const host = u.hostname;
  const port = u.port ? parseInt(u.port, 10) : 6379;
  const password = u.password ? decodeURIComponent(u.password) : undefined;
  const db = u.pathname && u.pathname !== "/" ? parseInt(u.pathname.replace("/", ""), 10) : 0;
  return { host, port, password, db: Number.isFinite(db) ? db : 0 };
}

function toResp(parts: (string)[]): Buffer {
  // RESP Array of Bulk Strings
  const chunks: string[] = [`*${parts.length}\r\n`];
  for (const p of parts) {
    const s = String(p);
    chunks.push(`$${Buffer.byteLength(s)}\r\n${s}\r\n`);
  }
  return Buffer.from(chunks.join(""), "utf8");
}

async function sendCommand(redisUrl: string, cmd: string[]): Promise<string | null> {
  const { host, port, password, db } = parseRedisUrl(redisUrl);

  return await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });

    let data = Buffer.alloc(0);

    const fail = (err: any) => {
      try { socket.destroy(); } catch {}
      reject(err);
    };

    socket.setTimeout(5000, () => fail(new Error("Redis timeout")));

    socket.on("connect", () => {
      // Build pipeline: AUTH (if needed), SELECT (if needed), then command
      const pipeline: Buffer[] = [];
      if (password) pipeline.push(toResp(["AUTH", password]));
      if (db && db > 0) pipeline.push(toResp(["SELECT", String(db)]));
      pipeline.push(toResp(cmd));
      socket.write(Buffer.concat(pipeline));
    });

    socket.on("data", (chunk) => { data = Buffer.concat([data, chunk]); });

    socket.on("error", fail);

    socket.on("end", () => {
      // We only need the LAST reply (our command reply)
      // Minimal parse:
      // +OK, -ERR, :int, $len\r\n... , *array...
      const text = data.toString("utf8");

      // Find the last non-empty RESP reply start by scanning backwards for \n that precedes a RESP type char
      // (This is "good enough" for our 3-command pipeline use-case.)
      const trimmed = text.trim();
      if (!trimmed) return resolve(null);

      // If last reply is bulk string:
      const idx = trimmed.lastIndexOf("\n$");
      if (idx !== -1) {
        const tail = trimmed.slice(idx + 1); // starts with $...
        const m = tail.match(/^\$(\-?\d+)\r?\n/);
        if (!m) return resolve(null);
        const len = parseInt(m[1], 10);
        if (len < 0) return resolve(null);
        const afterHeader = tail.slice(m[0].length);
        return resolve(afterHeader.slice(0, len));
      }

      // If last reply is simple string +OK or integer or error; return whole trimmed tail
      return resolve(trimmed.split("\n").slice(-1)[0] ?? null);
    });

    // End socket after short delay to allow full response to arrive
    setTimeout(() => {
      try { socket.end(); } catch {}
    }, 150);
  });
}

export async function redisGet(redisUrl: string, key: string): Promise<string | null> {
  return await sendCommand(redisUrl, ["GET", key]);
}

export async function redisSet(redisUrl: string, key: string, value: string): Promise<boolean> {
  const r = await sendCommand(redisUrl, ["SET", key, value]);
  return (r || "").includes("+OK") || (r || "").includes("OK");
}
