export default async function handler() {
  return {
    ok: true,
    commands: [
      "ping",
      "help",
      "registry.status",
      "registry.list"
    ]
  };
}
