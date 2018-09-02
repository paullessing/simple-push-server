// @ts-ignore
import * as webpush from 'web-push';
import { API_TOKEN, vapid } from '../config/config';
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as db from './subscriptions.table';
import { SubscriptionRequest } from './subscription-request.interface';

export const sendPush: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if ((event.headers['X-Auth-Token'] || event.headers['x-auth-token']) !== API_TOKEN) {
    return callback(null, {
      statusCode: 403,
      body: 'Missing auth token header'
    });
  }

  webpush.setVapidDetails(
    'mailto:push@paullessing.com',
    vapid.publicKey,
    vapid.privateKey
  );

  const subscriptions = await db.getAll();
  let promiseChain = Promise.resolve();

  for (const subscription of subscriptions) {
    promiseChain = promiseChain.then(() => {
      return triggerPushMsg(subscription, JSON.stringify({
        hello: 'world'
      }));
    });
  }

  await promiseChain;

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      success: true
    })
  });
};

async function triggerPushMsg(subscription: SubscriptionRequest, dataToSend: any) {
  try {
    await webpush.sendNotification(subscription, dataToSend);
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('Error code', err.statusCode, 'id', subscription.id);
      return await db.remove(subscription.id as string);
    } else {
      console.log('Subscription is no longer valid: ', err);
    }
  }
}
