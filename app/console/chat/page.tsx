'use client';

import { useState } from 'react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);


  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  const message = input.trim();
  if (!message) return;

  // show what YOU typed
  setMessages(prev => [...prev, `You: ${message}`]);
  setInput("");

  try {
    const res = await fetch("/api/console/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    // show what SERVER replied
    setMessages(prev => [...prev, `HX2: ${data.reply ?? "(no reply)"}`]);
  } catch (err) {
    setMessages(prev => [...prev, "HX2: (error calling API)"]);
  }
}


  return (
    <div style={{ padding: 24 }}>
      <h1>HX2 Console Chat</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type command..."
        />
        <button type="submit">Send</button>
      </form>

      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
