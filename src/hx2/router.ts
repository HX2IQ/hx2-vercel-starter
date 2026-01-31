type Route = {
  path: string;
  method: "GET" | "POST";
  auth?: boolean;
};

export function route(cmd: any): Route {
  const c = String(cmd?.command || "").trim();

  switch (c) {
    // Core
    case "hx2.status":
      return { path: "/api/hx2_base", method: "GET", auth: true };

    case "registry.list":
      return { path: "/api/hx2_registry", method: "GET", auth: false };

    case "registry.node.install":
      return { path: "/api/registry/node/install", method: "POST", auth: true };

    // AP2
    case "ap2.status":
      return { path: "/api/ap2/status", method: "POST", auth: true };

    case "ap2.enqueue":
      return { path: "/api/ap2/task/enqueue", method: "POST", auth: true };

    case "ap2.task.status":
      return { path: "/api/ap2/task/status", method: "POST", auth: true };

    // Brain
    case "brain.run":
      return { path: "/api/brain/run", method: "POST", auth: true };

    default:
      // Unknown command
      return { path: "/api/hx2_unknown", method: "POST", auth: true };
  }
}

// Back-compat aliases
export const resolve = route;
export const hx2Route = route;


