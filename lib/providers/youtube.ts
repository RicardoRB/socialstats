import { MetricValue, Provider } from './index';

export const youtube: Provider = {
  async fetchMetrics(account, fromDate, toDate): Promise<MetricValue[]> {
    // In a real implementation, this would call the YouTube Analytics API
    // using account.access_token.

    const metrics: MetricValue[] = [];
    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Simulate views
      metrics.push({
        metric_date: dateStr,
        metric_key: 'views',
        value: Math.floor(Math.random() * 1000) + 500,
      });

      // Simulate subscribers gained
      metrics.push({
        metric_date: dateStr,
        metric_key: 'subscribers',
        value: Math.floor(Math.random() * 50),
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  }
};
