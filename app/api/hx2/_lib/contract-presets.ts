export const hx2Contracts = {
  ah3: {
    name: "AH3",
    expected_mode: "ah3",
    expected_display_node: "ah3",
    minimum_answer_length: 150
  },

  research: {
    name: "Research",
    expected_mode: "research",
    expected_display_node: "research",
    require_sources: true,
    minimum_answer_length: 100
  },

  coding: {
    name: "Coding",
    expected_mode: "coding",
    expected_display_node: "dev2",
    minimum_answer_length: 50
  },

  business: {
    name: "Business",
    expected_mode: "business",
    expected_display_node: "business",
    minimum_answer_length: 50
  },

  image: {
    name: "Image",
    expected_mode: "image",
    expected_display_node: "design",
    minimum_answer_length: 50
  },

  conversation: {
    name: "Conversation",
    expected_mode: "conversation",
    expected_display_node: "o2",
    minimum_answer_length: 50
  },

  pa2: {
    name: "PA2",
    expected_mode: "pa2",
    expected_display_node: "pa2",
    minimum_answer_length: 250,
    required_sections: [
      "PA2 Quick Read",
      "Root Cause Possibilities",
      "Confidence Protection",
      "Daily Structure",
      "Five Moves Ahead",
      "Parent Mistakes To Avoid",
      "Next Best Action"
    ]
  }
};

