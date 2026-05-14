export type Hx2CapabilityMode =
  | "general"
  | "research"
  | "ah3"
  | "business"
  | "image"
  | "coding"
  | "conversation";

export function resolveDisplayNode(mode: Hx2CapabilityMode) {
  switch (mode) {
    case "conversation":
      return {
        node_id: "o2",
        node_label: "O2 Strategic Advisor",
        reason: "Strategic advisory synthesis"
      };

    case "ah3":
      return {
        node_id: "ah3",
        node_label: "Advanced Health Intelligence 3",
        reason: "Health / supplement / symptom synthesis"
      };

    case "research":
      return {
        node_id: "research",
        node_label: "Research Intelligence",
        reason: "Current information and source synthesis"
      };

    case "business":
      return {
        node_id: "business",
        node_label: "Business Intelligence",
        reason: "Business / local / operator synthesis"
      };

    case "image":
      return {
        node_id: "design",
        node_label: "Design Intelligence",
        reason: "Image / creative synthesis"
      };

    case "coding":
      return {
        node_id: "dev2",
        node_label: "DEV2 Build Intelligence",
        reason: "Coding / build synthesis"
      };

    default:
      return {
        node_id: "hx2",
        node_label: "HX2 General Intelligence",
        reason: "General synthesis"
      };
  }
}

export function resolvePrimaryNode(
  mode: Hx2CapabilityMode,
  routerNodeId: string
) {
  switch (mode) {
    case "ah3":
      return "ah3";

    case "research":
      return "research";

    case "business":
      return "business";

    case "image":
      return "design";

    case "coding":
      return "dev2";

    case "conversation":
      return "o2";

    case "general":
    default:
      return routerNodeId || "qa1";
  }
}

