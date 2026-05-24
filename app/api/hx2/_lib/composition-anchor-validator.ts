export function assertCompositionInsertionAnchor(
  fileText: string,
  anchor: string,
  label: string
) {
  const matches =
    (fileText.match(
      new RegExp(
        anchor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g"
      )
    ) || []).length;

  if (matches !== 1) {
    throw new Error(
      `[HX2 Anchor Guard] ${label}: expected exactly 1 anchor match, found ${matches}`
    );
  }

  return true;
}
