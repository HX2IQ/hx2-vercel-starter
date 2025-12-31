import type { AP2RequestBody } from '../../../../lib/ap2/types';

export async function registry(body: AP2RequestBody | any) {
  const b = body ?? {};
  return {
    ok: true,
    installed: true,
    node: b?.node ?? b?.task?.node ?? null,
  };
}





















