export async function handleRegistryStatus(body: any) {
  const mode = body?.mode ?? "SAFE";
  return {
    ok: true,
    service: "ap2_execute",
    mode,
    executed: "registry.status",
    message: "Registry status (stub)",
    data: {
      status: "ok",
      nodes: 0,
      note: "Replace with real registry backing store when ready.",
    },
  };
}
