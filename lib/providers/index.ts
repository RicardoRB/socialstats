export interface MetricValue {
  metric_date: string;
  metric_key: string;
  value: number;
}

export interface Provider {
  fetchMetrics(account: any, fromDate: Date, toDate: Date): Promise<MetricValue[]>;
}
