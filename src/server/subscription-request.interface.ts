export interface SubscriptionRequest {
  id?: string;
  endpoint: string;
  expirationTime: unknown;
  keys: {
    p256dh: string;
    auth: string;
  };
}
