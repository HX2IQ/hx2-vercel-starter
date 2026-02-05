import ChatClient from "./ChatClient";

export const runtime = "nodejs";

export default function Page() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <p className="mb-4 text-sm text-gray-400">
        You’re interacting with{" "}
        <a
          href="/opti"
          className="text-blue-400 hover:underline font-medium"
        >
          Opti™ (Optimized Intelligence)
        </a>{" "}
        — the core intelligence interface of OptinodeIQ.
      </p>

      <ChatClient />
    </div>
  );
}
