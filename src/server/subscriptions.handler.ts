import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import { UserSubscription } from './user-subscription';
import * as db from './subscriptions.table';
import { PushSubscription } from 'web-push';

export const saveSubscription: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  let subscription = getValidSubscription(event.body);
  if (!subscription) {
    return callback(null, {
      statusCode: 400,
      body: 'Invalid request body'
    });
  }

  if (event.pathParameters && event.pathParameters.id) {
    subscription = {
      ...subscription,
      id: event.pathParameters.id
    }
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

const getValidSubscription = (body: string | null): UserSubscription | null => {
  if (!body) {
    return null;
  }

  let push: PushSubscription;

  try {
    push = JSON.parse(body);
  } catch (e) {
    // For some reason all the data is base64 encoded sometimes, so try decoding
    push = JSON.parse(new Buffer(body, 'base64').toString('utf-8'));
  }

  if (!push || !push.endpoint || !push.keys || !push.keys.auth || !push.keys.p256dh) {
    return null;
  }
  return {
    push
  };
};
