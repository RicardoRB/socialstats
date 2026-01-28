export interface MetricValue {
  metric_date: string;
  metric_key: string;
  value: number;
}

export interface Provider {
  fetchMetrics(account: any, fromDate: Date, toDate: Date): Promise<MetricValue[]>;
  getAuthUrl?: (userId: string, redirectTo?: string) => string;
  exchangeCodeAndSave?: (userId: string, code: string, state: string) => Promise<any>;
}

import { youtube } from './youtube';
import { x } from './x';

export const providers: Record<string, Provider> = {
  youtube,
  x,
};

export function getProvider(id: string): Provider | undefined {
  return providers[id];
}
