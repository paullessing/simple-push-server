import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
// @ts-ignore
import * as StaticFileHandler from 'serverless-aws-static-file-handler';
import { saveSubscription } from './src/server/subscriptions.handler';
import { sendPush } from './src/server/push.handler';
import * as path from 'path';

// export const hello: Handler = (event: APIGatewayEvent, context: Context, cb: Callback) => {
//   const response = {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
//       input: event,
//     }),
//   };
//
//   cb(null, response);
// };

const staticFiles = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const clientFilesPath = './frontend/';
  if (event.path === '/' || !event.path) {
    event = { ...event, path: '/index.html' };
  }
  if (typeof event.path === 'object') { // wtf - I assume this is because of the aipgwy plugin
    console.log('Event is an object', event.path);
    event = { ...event, path: path.join('bin', (event.path as any).file) };
  }
  console.log('STATIC', event.path);
  try {
    const response = await new StaticFileHandler(clientFilesPath).get(event, context);
    console.log('r1', response);
    if (event.path.indexOf('/bin/') >= 0) {
      callback(null, {
        statusCode: 200,
        headers: { 'Content-Type': StaticFileHandler.getMimeType(event.path) },
        body: response.toString(),
        isBase64Encoded: true,
      });
    } else {
      callback(null, response);
    }
  } catch (e) {
    callback(null, { statusCode: 500, body: JSON.stringify(e.stack) });
  }
};

export {
  staticFiles,
  saveSubscription,
  sendPush
};
