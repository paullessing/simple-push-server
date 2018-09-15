import { PushSubscription } from 'web-push';

export interface UserSubscription {
  id?: string;
  push: PushSubscription;
}
