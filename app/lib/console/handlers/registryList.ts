import { registryList } from '@/app/lib/registry/store';

export async function handleRegistryList() {
  return {
    ok: true,
    executed: 'registry.list',
    data: {
      nodes: registryList(),
    },
  };
}











