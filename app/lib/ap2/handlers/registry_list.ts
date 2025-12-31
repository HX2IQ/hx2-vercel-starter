export async function handleRegistryList(body: any) {
  const mode = body?.mode ?? "SAFE";
  return {
    ok: true,
    service: "ap2_execute",
    mode,
    executed: "registry.list",
    message: "Registry list (stub)",
    data: {
      nodes: [],
      note: "Replace with real registry backing store when ready.",
    },
  };
}















