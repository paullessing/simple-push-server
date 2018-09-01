export interface SubscriptionRequest {
  endpoint: string;
  expirationTime: unknown;
  keys: {
    p256dh: string;
    auth: string;
  };
}
