export async function handleRegistryNodeInstall(body: any) {
  const mode = body?.mode ?? "SAFE";
  const node = body?.task?.node ?? body?.node ?? null;

  if (!node?.id) {
    return {
      ok: false,
      service: "ap2_execute",
      mode,
      executed: "registry.node.install",
      error: "Missing node.id",
    };
  }

  // Stubbed: in a real system you'd persist this to DB/registry store.
  return {
    ok: true,
    service: "ap2_execute",
    mode,
    executed: "registry.node.install",
    message: "Node install accepted (stub)",
    data: { installed: true, node },
  };
}
