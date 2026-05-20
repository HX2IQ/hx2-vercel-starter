export function insertBeforeAnchor(
  source: string,
  anchor: string,
  insert: string
) {
  const idx = source.indexOf(anchor);

  if (idx < 0) {
    throw new Error(
      `Anchor not found: ${anchor}`
    );
  }

  return (
    source.slice(0, idx) +
    insert +
    source.slice(idx)
  );
}

export function insertAfterAnchor(
  source: string,
  anchor: string,
  insert: string
) {
  const idx = source.indexOf(anchor);

  if (idx < 0) {
    throw new Error(
      `Anchor not found: ${anchor}`
    );
  }

  return (
    source.slice(0, idx + anchor.length) +
    insert +
    source.slice(idx + anchor.length)
  );
}

export function ensureImport(
  source: string,
  importLine: string
) {
  if (source.includes(importLine)) {
    return source;
  }

  return importLine + "\n" + source;
}
