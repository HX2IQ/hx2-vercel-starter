"use client";

import { useState } from "react";
import {
  getHx2RetailAnswerText,
  getHx2RetailParticipation,
  getHx2RetailWarnings,
  sendHx2RetailChatMessage,
  type Hx2RetailChatEnvelope
} from "../../lib/hx2-retail-chat-client";

export default function Hx2RetailChatProofClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Hx2RetailChatEnvelope | null>(null);
  const [error, setError] = useState("");

  async function runProof() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const envelope = await sendHx2RetailChatMessage({
        message: "HX2 retail UI proof. Return one short public safe-preview status sentence.",
        requestId: `hx2-retail-ui-proof-${Date.now()}`,
        mode: "safe_preview",
        readOnly: true,
        dryRun: true,
        noPersist: true
      });

      setResult(envelope);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }

  const answer = result ? getHx2RetailAnswerText(result) : "";
  const participation = result ? getHx2RetailParticipation(result) : null;
  const warnings = result ? getHx2RetailWarnings(result) : [];

  return (
    <section data-hx2-retail-chat-ui-proof="client-helper" style={{ marginTop: "20px" }}>
      <button
        type="button"
        data-hx2-retail-chat-ui-button="run-proof"
        onClick={runProof}
        disabled={loading}
      >
        {loading ? "Running retail-safe proof..." : "Run retail-safe chat proof"}
      </button>

      {error ? (
        <pre data-hx2-retail-chat-ui-error="true">{error}</pre>
      ) : null}

      {result ? (
        <>
          <h2>Answer</h2>
          <pre data-hx2-retail-chat-ui-answer="true">{answer}</pre>

          <h2>Participation</h2>
          <pre data-hx2-retail-chat-ui-participation="true">
            {JSON.stringify(participation, null, 2)}
          </pre>

          <h2>Warnings</h2>
          <pre data-hx2-retail-chat-ui-warnings="true">
            {JSON.stringify(warnings, null, 2)}
          </pre>

          <h2>Contract summary</h2>
          <pre data-hx2-retail-chat-ui-contract="retail_chat_contract_v1">
            {JSON.stringify(
              {
                ok: result.ok,
                route: result.route,
                upstream_route: result.upstream_route,
                contract_version: result.contract.safe_metadata.contract_version,
                no_brain_logic: result.contract.safe_metadata.no_brain_logic,
                no_internal_prompts: result.contract.safe_metadata.no_internal_prompts,
                no_internal_weights: result.contract.safe_metadata.no_internal_weights
              },
              null,
              2
            )}
          </pre>
        </>
      ) : null}
    </section>
  );
}
