import Redis from "ioredis";

const url = process.env.REDIS_URL;
if (!url) throw new Error("Missing REDIS_URL");

export const redis = new Redis(url, {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
});
