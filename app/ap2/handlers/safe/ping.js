export default async function handler({ mode }) {
  return {
    ok: true,
    executed: "ping",
    mode,
    message: "pong"
  };
}
