export type Hx2RetailChatConsumerPreference = {
  ok: true;
  mode: "read_only_consumer_preference";
  contract_version: "retail_chat_consumer_preference_v1";
  preferred_endpoint: "/api/hx2/retail-chat-master-contract-preview";
  preferred_contract: "retail_chat_contract_v1";
  fallback_endpoints: string[];
  deprecated_direct_endpoints: string[];
  consumer_rules: {
    prefer_retail_contract: true;
    require_answer_field: true;
    require_participation_object: true;
    require_safe_metadata: true;
    no_brain_logic: true;
    no_internal_prompts: true;
    no_internal_weights: true;
  };
  display_contract: {
    answer_path: "contract.answer";
    mode_path: "contract.mode";
    route_path: "contract.route";
    request_id_path: "contract.request_id";
    participation_path: "contract.participation";
    warnings_path: "contract.warnings";
    safe_metadata_path: "contract.safe_metadata";
  };
  warnings: string[];
};

export function buildHx2RetailChatConsumerPreference(): Hx2RetailChatConsumerPreference {
  return {
    ok: true,
    mode: "read_only_consumer_preference",
    contract_version: "retail_chat_consumer_preference_v1",
    preferred_endpoint: "/api/hx2/retail-chat-master-contract-preview",
    preferred_contract: "retail_chat_contract_v1",
    fallback_endpoints: [
      "/api/hx2/retail-chat-contract-preview"
    ],
    deprecated_direct_endpoints: [
      "/api/hx2/chat-master",
      "/api/hx2/chat"
    ],
    consumer_rules: {
      prefer_retail_contract: true,
      require_answer_field: true,
      require_participation_object: true,
      require_safe_metadata: true,
      no_brain_logic: true,
      no_internal_prompts: true,
      no_internal_weights: true
    },
    display_contract: {
      answer_path: "contract.answer",
      mode_path: "contract.mode",
      route_path: "contract.route",
      request_id_path: "contract.request_id",
      participation_path: "contract.participation",
      warnings_path: "contract.warnings",
      safe_metadata_path: "contract.safe_metadata"
    },
    warnings: [
      "consumer_preference_only_not_full_ui_rewire"
    ]
  };
}
