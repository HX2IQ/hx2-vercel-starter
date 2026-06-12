export type UnifiedRetrievalSource = {
  title: string;
  url?: string;
  source: string;
  snippet?: string;
};

export type UnifiedRetrievalContext = {
  query: string;
  web_results: UnifiedRetrievalSource[];
  memory_results: UnifiedRetrievalSource[];
  sources: UnifiedRetrievalSource[];
  retrieval_active: boolean;
  retrieval_mode: "stub" | "live";
};

export async function retrieveContext(
  query: string
): Promise<UnifiedRetrievalContext> {
  return {
    query,
    web_results: [],
    memory_results: [],
    sources: [],
    retrieval_active: true,
    retrieval_mode: "stub"
  };
}
