export async function pingHandler() {
  return {
    ok: true,
    service: "ap2",
    status: "online",
    ts: new Date().toISOString()
  };
}
