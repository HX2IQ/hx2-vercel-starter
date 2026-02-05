export const metadata = {
  title: "Opti — The Conversational Interface for Optimized Intelligence",
  description:
    "Opti is the conversational interface of Optimized Intelligence, designed to translate complex intelligence systems into clear, actionable responses while maintaining safety, transparency, and control."
};

export default function OptiPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 20px" }}>
      <h1>Opti</h1>

      <p>
        <strong>Opti</strong> is the conversational interface for{" "}
        <a href="/optimized-intelligence">Optimized Intelligence</a>.
      </p>

      <p>
        It is designed to act as a controlled interaction layer between users
        and complex intelligence systems, translating structured reasoning,
        constraints, and system outputs into clear, actionable responses.
      </p>

      <h2>What Opti Is</h2>
      <ul>
        <li>A conversational interface, not a standalone intelligence</li>
        <li>A controlled access layer to Optimized Intelligence systems</li>
        <li>Designed for clarity, safety, and deterministic behavior</li>
      </ul>

      <h2>What Opti Is Not</h2>
      <ul>
        <li>Not a generic chatbot</li>
        <li>Not an autonomous AI agent</li>
        <li>Not an unrestricted or self-directing system</li>
      </ul>

      <h2>Relationship to Optimized Intelligence</h2>
      <p>
        Optimized Intelligence defines how intelligence is structured, governed,
        and evaluated. Opti provides the conversational surface that allows
        humans to interact with those systems without exposing internal logic,
        decision frameworks, or unsafe execution paths.
      </p>

      <p>
        In short: <strong>Optimized Intelligence is the system.</strong>{" "}
        <strong>Opti is how you talk to it.</strong>
      </p>
    </main>
  );
}
