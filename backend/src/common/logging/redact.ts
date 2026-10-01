// SAD §8: prices and price-list cell values never reach the logs.
// Placeholder list: extend it as file-intake / price-import / offers add log fields.
export const REDACT_PATHS: string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  '*.price',
  '*.prices',
  '*.cell',
  '*.cells',
  '*.row',
  '*.rows',
];

export const REDACT_CENSOR = '[REDACTED]';
