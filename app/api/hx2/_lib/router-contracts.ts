export type RouterExpectation = {
  mode: string;
  router_node: string;
  display_node: string;
};

export const ROUTER_EXPECTATIONS: Record<string, RouterExpectation> = {
  ah3: {
    mode: "ah3",
    router_node: "ah3",
    display_node: "ah3"
  },

  conversation: {
    mode: "conversation",
    router_node: "o2",
    display_node: "o2"
  },

  coding: {
    mode: "coding",
    router_node: "dev2",
    display_node: "dev2"
  },

  research: {
    mode: "research",
    router_node: "research",
    display_node: "research"
  },

  business: {
    mode: "business",
    router_node: "business",
    display_node: "business"
  },

  image: {
    mode: "image",
    router_node: "design",
    display_node: "design"
  }
};
