import Hx2RetailChatProofClient from "./Hx2RetailChatProofClient";

export const dynamic = "force-dynamic";

export default function Hx2RetailChatProofPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "32px", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: "900px", margin: "0 auto", border: "1px solid #ddd", borderRadius: "16px", padding: "24px" }}>
        <p data-hx2-ui-proof="retail-chat-proof">HX2 Retail Chat UI Proof</p>
        <h1>Retail-safe chat contract proof</h1>
        <p>
          This isolated proof page verifies that UI code can use the retail chat client helper,
          read the consumer preference, call the preferred retail chat-master bridge, and display
          the safe contract response without using raw chat-master output.
        </p>

        <div data-hx2-retail-chat-ui-contract="retail_chat_contract_v1">
          <p><strong>Consumer preference:</strong> /api/hx2/retail-chat-consumer-preference</p>
          <p><strong>Preferred chat endpoint:</strong> /api/hx2/retail-chat-master-contract-preview</p>
          <p><strong>Contract:</strong> retail_chat_contract_v1</p>
        </div>

        <Hx2RetailChatProofClient />
      </section>
    </main>
  );
}
