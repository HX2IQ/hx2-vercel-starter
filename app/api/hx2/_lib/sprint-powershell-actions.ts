export type SprintPowerShellActions = {
  commands: string[];
};

export function buildSprintPowerShellActions(
  riskGateActions: any
): SprintPowerShellActions {
  const sequence: string[] =
    riskGateActions?.recommended_sequence || [];

  const commands = [
    'powershell -ExecutionPolicy Bypass -File .\\tools\\dev2-feature-compiler.ps1 -FeatureName "<feature-name>"'
  ];

  if (sequence.some((s) => /guard/i.test(s))) {
    commands.push('npm run hx2:quick');
  }

  commands.push('npm run hx2:quick');
  commands.push('npm run hx2:chat-master:guard');
  commands.push('git status --short');

  return {
    commands: Array.from(new Set(commands))
  };
}
