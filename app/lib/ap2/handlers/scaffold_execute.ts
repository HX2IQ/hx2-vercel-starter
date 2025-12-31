export async function handleScaffoldExecute(body: any) {
  const blueprint_name = body?.blueprint_name ?? body?.task?.blueprint_name ?? null;
  return { ok: true, executed: true, blueprint_name };
}















