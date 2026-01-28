export interface MetricValue {
  metric_date: string;
  metric_key: string;
  value: number;
}

import { youtube } from './youtube';
import { x } from './x';

export interface Provider {
  fetchMetrics(account: any, fromDate: Date, toDate: Date): Promise<MetricValue[]>;
  refreshTokenIfNeeded?(account: any, supabase: any): Promise<string>;
  exchangeCodeAndSave?(code: string, state: string, userId: string, supabase: any): Promise<{ redirectTo?: string }>;
}

export const providers: Record<string, Provider> = {
  youtube,
  x,
};
