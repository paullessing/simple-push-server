import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { SubscriptionRequest } from './subscription-request.interface';
import * as db from './subscriptions.table';

export const saveSubscription: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const subscription = getValidSubscription(event.body);
  if (!subscription) {
    return callback(null, {
      statusCode: 400,
      body: 'Invalid request body'
    });
  }

  const id = await db.put(subscription);

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      id
    })
  });
};

const getValidSubscription = (body: string | null): SubscriptionRequest | null => {
  if (!body) {
    return null;
  }

  const request: SubscriptionRequest = JSON.parse(body);
  if (!request.endpoint || !request.keys || !request.keys.auth || !request.keys.p256dh) {
    return null;
  }
  return request;
};
