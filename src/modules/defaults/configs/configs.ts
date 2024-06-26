import { registerAs } from '@nestjs/config';

export const PROMETHEUS_CONFIG_KEY = 'prometheus-config';

export default registerAs(PROMETHEUS_CONFIG_KEY, () => ({
  enableDefaultMetrics: envToBoolean(
    'PROMETHEUS_DEFAULT_METRICS_ENABLED',
    false,
  ),
  enableHttpMetrics: envToBoolean('PROMETHEUS_HTTP_METRICS_ENABLED', true),
  httpDurationBuckets: [0.05, 0.1, 0.3, 0.7, 1, 2, 5, 10],
}));

export const envToBoolean = (field: string, defaultValue = false): boolean => {
  const value = process.env[field];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};
