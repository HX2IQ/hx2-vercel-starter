import {
  getHx2RetailAnswerText,
  getHx2RetailParticipation,
  getHx2RetailWarnings,
  sendHx2RetailChatMessage,
  type Hx2RetailChatEnvelope,
  type Hx2RetailChatParticipation
} from "./hx2-retail-chat-client";

export const HX2_MAIN_CHAT_UI_ADAPTER_VERSION = "main_chat_ui_retail_adapter_v1" as const;
export const HX2_MAIN_CHAT_UI_PREFERRED_CLIENT = "retail_chat_client_v1" as const;
export const HX2_MAIN_CHAT_UI_PREFERRED_CONTRACT = "retail_chat_contract_v1" as const;
export const HX2_MAIN_CHAT_UI_PREFERRED_ENDPOINT = "/api/hx2/retail-chat-master-contract-preview" as const;

export type Hx2MainChatUiAdapterConfig = {
  ok: true;
  adapter_version: typeof HX2_MAIN_CHAT_UI_ADAPTER_VERSION;
  preferred_client: typeof HX2_MAIN_CHAT_UI_PREFERRED_CLIENT;
  preferred_contract: typeof HX2_MAIN_CHAT_UI_PREFERRED_CONTRACT;
  preferred_endpoint: typeof HX2_MAIN_CHAT_UI_PREFERRED_ENDPOINT;
  mode: "retail_safe_main_chat_adapter";
  rules: {
    prefer_retail_contract: true;
    read_consumer_preference: true;
    no_raw_chat_master_display: true;
    no_brain_logic: true;
    no_internal_prompts: true;
    no_internal_weights: true;
  };
};

export type Hx2MainChatUiMessageInput = {
  message: string;
  requestId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type Hx2MainChatUiMessageResult = {
  ok: boolean;
  adapter_version: typeof HX2_MAIN_CHAT_UI_ADAPTER_VERSION;
  preferred_client: typeof HX2_MAIN_CHAT_UI_PREFERRED_CLIENT;
  preferred_contract: typeof HX2_MAIN_CHAT_UI_PREFERRED_CONTRACT;
  answer: string;
  participation: Hx2RetailChatParticipation;
  warnings: string[];
  envelope: Hx2RetailChatEnvelope;
};

export function getHx2MainChatUiAdapterConfig(): Hx2MainChatUiAdapterConfig {
  return {
    ok: true,
    adapter_version: HX2_MAIN_CHAT_UI_ADAPTER_VERSION,
    preferred_client: HX2_MAIN_CHAT_UI_PREFERRED_CLIENT,
    preferred_contract: HX2_MAIN_CHAT_UI_PREFERRED_CONTRACT,
    preferred_endpoint: HX2_MAIN_CHAT_UI_PREFERRED_ENDPOINT,
    mode: "retail_safe_main_chat_adapter",
    rules: {
      prefer_retail_contract: true,
      read_consumer_preference: true,
      no_raw_chat_master_display: true,
      no_brain_logic: true,
      no_internal_prompts: true,
      no_internal_weights: true
    }
  };
}

export async function sendHx2MainChatUiMessage(
  input: Hx2MainChatUiMessageInput
): Promise<Hx2MainChatUiMessageResult> {
  if (!input.message || !input.message.trim()) {
    throw new Error("HX2 main chat UI adapter requires a message.");
  }

  const envelope = await sendHx2RetailChatMessage(
    {
      message: input.message,
      requestId: input.requestId,
      mode: "safe_preview",
      readOnly: true,
      dryRun: true,
      noPersist: true
    },
    {
      baseUrl: input.baseUrl,
      fetchImpl: input.fetchImpl
    }
  );

  return {
    ok: Boolean(envelope.ok),
    adapter_version: HX2_MAIN_CHAT_UI_ADAPTER_VERSION,
    preferred_client: HX2_MAIN_CHAT_UI_PREFERRED_CLIENT,
    preferred_contract: HX2_MAIN_CHAT_UI_PREFERRED_CONTRACT,
    answer: getHx2RetailAnswerText(envelope),
    participation: getHx2RetailParticipation(envelope),
    warnings: getHx2RetailWarnings(envelope),
    envelope
  };
}

export function getHx2MainChatUiAnswer(result: Hx2MainChatUiMessageResult): string {
  return result.answer;
}
