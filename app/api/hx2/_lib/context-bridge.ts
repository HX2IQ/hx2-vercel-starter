type ContextBridge = {
  context_version: string;
  notes: string[];
  active_projects: string[];
  risks: string[];
  priorities: string[];
  history_count: number;
  has_relevant_context: boolean;
};

export function buildContextBridge(input: any): ContextBridge {
  const rawQuery =
    typeof input === "string"
      ? input
      : String(input?.query || "");

  const history = Array.isArray(input?.conversation_context)
    ? input.conversation_context
    : [];

  const historyText = history
    .map((m: any) => String(m?.content || ""))
    .join(" ");

  const q = `${rawQuery} ${historyText}`.toLowerCase();

  const notes: string[] = [];
  const active_projects: string[] = [];
  const risks: string[] = [];
  const priorities: string[] = [];

  if (/hx2|optinode|orchestrator|roadmap|phase/.test(q)) {
    notes.push("HX2 roadmap / phase alignment is relevant.");
    active_projects.push("HX2 / OptinodeIQ");
    risks.push("Avoid drifting from master-orchestrator-first architecture.");
    priorities.push("Preserve master orchestrator and improve intelligence quality.");
  }

  if (/koenig|polish|dealer|warehouse|wholesale/.test(q)) {
    notes.push("Koenig Polish business context is relevant.");
    active_projects.push("Koenig Polish growth");
    priorities.push("Use Koenig cash flow to support HX2 build.");
  }

  if (/healthoi|businessoi|tradeshowiq|launch|productize/.test(q)) {
    notes.push("Retail OI productization context is relevant.");
    priorities.push("Ship first monetizable OI vertical.");
  }

  return {
    context_version: "v3",
    notes,
    active_projects,
    risks,
    priorities,
    history_count: notes.length,
    has_relevant_context: notes.length > 0
  };
}


