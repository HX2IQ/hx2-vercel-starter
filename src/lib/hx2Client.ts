// src/lib/hx2Client.ts
import { setTimeout as delay } from "timers/promises";

export class Hx2Client {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl =
      process.env.HX2_BASE_URL || "https://optinodeiq.com/api";
    this.token = process.env.HX2_API_KEY || "";

    if (!this.token) {
      console.warn("⚠️ HX2_API_KEY missing — requests will fail with 401");
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    try {
      const res = await fetch(url, { ...options, headers });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `HTTP ${res.status} on ${path}: ${text.slice(0, 120)}`
        );
      }

      return (await res.json()) as T;
    } catch (err: any) {
      if (retries > 0) {
        console.warn(`Retrying ${path} (${retries} left)...`);
        await delay(500);
        return this.request<T>(path, options, retries - 1);
      }
      console.error("HX2 request failed:", err.message);
      throw err;
    }
  }

  // ---- Core Endpoints ----
  async status() {
    return this.request("/status");
  }

  async registryNodes() {
    return this.request("/registry/nodes");
  }

  async scaffold(body: any) {
    return this.request("/ap2/scaffold", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async deploy(body: any) {
    return this.request("/ap2/deploy", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async register(body: any) {
    return this.request("/ap2/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
