export async function whoami() {
  return {
    ok: true,
    identity: {
      runtime: "vercel",
      user: "ap2",
      mode: "SAFE"
    }
  };
}
