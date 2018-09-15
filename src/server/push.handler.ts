import * as webpush from 'web-push';
import { API_TOKEN, vapid } from '../config/config';
import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
import * as db from './subscriptions.table';
import { UserSubscription } from './user-subscription';

export const sendPush: Handler = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  if ((event.headers['X-Auth-Token'] || event.headers['x-auth-token']) !== API_TOKEN) {
    return callback(null, {
      statusCode: 403,
      body: 'Missing auth token header'
    });
  }

  let eventBody: any;
  try {
    if (event.body) {
      try {
        eventBody = JSON.parse(event.body);
      } catch (e) {
        // For some reason all the data is base64 encoded sometimes, so try decoding
        eventBody = JSON.parse(new Buffer(event.body, 'base64').toString('utf-8'));
      }
    }
  } catch (e) {
    console.log('Could not parse body', e);
    return callback(null, {
      statusCode: 400,
      body: 'Invalid body'
    });
  }
  if (!eventBody) {
    return callback(null, {
      statusCode: 400,
      body: 'Missing body'
    })
  }

  webpush.setVapidDetails(
    'mailto:push@paullessing.com',
    vapid.publicKey,
    vapid.privateKey
  );

  const subscriptions = await db.getAll();

  const data = {
    title: eventBody.title,
    body: eventBody.body,
    image: eventBody.image,
    vibrate: eventBody.vibrate,
  };
  await Promise.all(subscriptions.map((subscription) =>
    triggerPushMsg(subscription, JSON.stringify(data))));

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      success: true
    })
  });
};

async function triggerPushMsg(subscription: UserSubscription, dataToSend: any) {
  try {
    await webpush.sendNotification(subscription.push, dataToSend);
  } catch (err) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log('Error code', err.statusCode, 'id', subscription.id);
      return await db.remove(subscription.id as string);
    } else {
      console.log('Subscription is no longer valid: ', err);
    }
  }
}
