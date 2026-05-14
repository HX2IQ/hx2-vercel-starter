export type Hx2Contract = {
  name: string;
  expected_mode?: string;
  expected_display_node?: string;
  require_sources?: boolean;
  minimum_answer_length?: number;
};

export function verifyHx2Contract(
  response: any,
  contract: Hx2Contract
) {
  const failures: string[] = [];

  if (response?.ok !== true) {
    failures.push("ok != true");
  }

  if (
    contract.expected_mode &&
    response?.capability_decision?.mode !== contract.expected_mode
  ) {
    failures.push(
      `mode expected=${contract.expected_mode} actual=${response?.capability_decision?.mode}`
    );
  }

  if (
    contract.expected_display_node &&
    response?.display_node?.node_id !== contract.expected_display_node
  ) {
    failures.push(
      `display_node expected=${contract.expected_display_node} actual=${response?.display_node?.node_id}`
    );
  }

  const answer = String(response?.answer || "");

  if (
    contract.minimum_answer_length &&
    answer.length < contract.minimum_answer_length
  ) {
    failures.push(
      `answer too short actual=${answer.length} minimum=${contract.minimum_answer_length}`
    );
  }

  if (
    contract.require_sources &&
    !response?.sources
  ) {
    failures.push("sources missing");
  }

  return {
    ok: failures.length === 0,
    failures
  };
}
