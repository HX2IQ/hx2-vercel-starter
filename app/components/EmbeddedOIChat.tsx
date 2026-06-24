"use client";

import { useState } from "react";
import { sendHx2MainChatUiMessage } from "../../lib/hx2-main-chat-ui-adapter";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type EmbeddedOIChatProps = {
  title?: string;
  placeholder?: string;
  modeHint?: string;
  nodeHint?: string;
};

function formatAiText(text: string) {
  return text
    .replace(/^##\s+/gm, "")
    .replace(/^###\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function EmbeddedOIChat({
  title = "Ask HealthOI Now",
  placeholder = "Ask about supplements, symptoms, fasting, sleep, recovery, stress, or health products...",
  modeHint = "healthoi",
  nodeHint = "ah3"
}: EmbeddedOIChatProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi — I’m HealthOI. Ask me about supplements, fasting, sleep, stress, recovery, product labels, or wellness protocols."
    }
  ]);
  const [loading, setLoading] = useState(false);

  async function ask() {
    const text = query.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text }
    ];

    setMessages(nextMessages);
    setQuery("");
    setLoading(true);

    try {
      const adapterResult = await sendHx2MainChatUiMessage({
        message: [
          "Embedded HealthOI chat context.",
          `Mode hint: ${modeHint}.`,
          `Preferred node: ${nodeHint}.`,
          `User question: ${text}`
        ].join("\n"),
        requestId: `hx2-embedded-healthoi-${Date.now()}`
      });

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: adapterResult.answer || "No answer returned."
        }
      ]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  }

  return (
    <section style={{
      maxWidth: "1120px",
      margin: "0 auto",
      padding: "24px 28px"
    }}>
      <div style={{
        background: "linear-gradient(135deg,#ffffff,#f4fbf7)",
        border: "1px solid #cfead9",
        borderRadius: "30px",
        boxShadow: "0 24px 60px rgba(20,60,30,.12)",
        overflow: "hidden"
      }}>
        <div style={{
          padding: "22px 24px",
          borderBottom: "1px solid #e1eee7",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px"
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: "28px",
              color: "#103024",
              letterSpacing: "-0.8px"
            }}>
              {title}
            </h2>
            <p style={{
              margin: "6px 0 0",
              color: "#64766d",
              fontSize: "15px"
            }}>
              Private beta health intelligence powered by HX2 chat-master.
            </p>
          </div>

          <div style={{
            background: "#e9f8ef",
            color: "#1f7a4d",
            border: "1px solid #c9efd8",
            borderRadius: "999px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 800,
            whiteSpace: "nowrap"
          }}>
            AH3 Health Mode
          </div>
        </div>

        <div style={{
          padding: "24px",
          minHeight: "360px",
          maxHeight: "620px",
          overflowY: "auto",
          background:
            "radial-gradient(circle at 10% 0%, rgba(223,247,234,.55), transparent 30%), #fbfefc"
        }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "16px"
              }}
            >
              <div style={{
                maxWidth: "82%",
                background: m.role === "user" ? "#103024" : "#ffffff",
                color: m.role === "user" ? "#ffffff" : "#102019",
                border: m.role === "user" ? "1px solid #103024" : "1px solid #e2eee7",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "14px 16px",
                whiteSpace: "pre-wrap",
                lineHeight: 1.55,
                boxShadow: m.role === "user" ? "0 10px 22px rgba(16,48,36,.16)" : "0 10px 24px rgba(20,60,30,.06)"
              }}>
                {m.role === "assistant" ? formatAiText(m.content) : m.content}
              </div>
            </div>
          ))}

          {loading ? (
            <div style={{
              display: "inline-block",
              background: "#ffffff",
              border: "1px solid #e2eee7",
              borderRadius: "18px",
              padding: "14px 16px",
              color: "#53665d",
              boxShadow: "0 10px 24px rgba(20,60,30,.06)"
            }}>
              HealthOI is analyzing...
            </div>
          ) : null}
        </div>

        <div style={{
          padding: "18px",
          borderTop: "1px solid #e1eee7",
          background: "#ffffff"
        }}>
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-end"
          }}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              rows={1}
              style={{
                flex: 1,
                width: "100%",
                boxSizing: "border-box",
                background: "#ffffff",
                color: "#102019",
                border: "1px solid #cfe0d6",
                borderRadius: "18px",
                padding: "15px 16px",
                fontSize: "16px",
                lineHeight: 1.45,
                resize: "vertical",
                outline: "none",
                minHeight: "54px",
                maxHeight: "160px",
                boxShadow: "inset 0 2px 8px rgba(16,48,36,.04)"
              }}
            />

            <button
              onClick={ask}
              disabled={loading}
              style={{
                background: loading ? "#5f7469" : "linear-gradient(135deg,#103024,#1f7a4d)",
                color: "#fff",
                border: "none",
                padding: "15px 20px",
                borderRadius: "16px",
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                minHeight: "54px",
                boxShadow: "0 12px 26px rgba(16,48,36,.18)",
                whiteSpace: "nowrap"
              }}
            >
              {loading ? "..." : "Ask"}
            </button>
          </div>

          <div style={{
            marginTop: "10px",
            color: "#7a8b82",
            fontSize: "12px"
          }}>
            Press Enter to send. Shift + Enter for a new line. Educational wellness guidance only.
          </div>
        </div>
      </div>
    </section>
  );
}






