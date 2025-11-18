import { inject } from 'vue';
import type { ElogicalApi } from '@/services/elogical';

export function useApi(): ElogicalApi | undefined {
  return inject<ElogicalApi>('$api');
}
