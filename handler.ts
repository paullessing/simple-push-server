import { APIGatewayEvent, Callback, Context, Handler } from 'aws-lambda';
// @ts-ignore
import * as StaticFileHandler from 'serverless-aws-static-file-handler';
import { saveSubscription } from './src/server/subscriptions.handler';
import { sendPush } from './src/server/push.handler';

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
  try {
    const response = await new StaticFileHandler(clientFilesPath).get(event, context);
    callback(null, response);
  } catch (e) {
    callback(null, { statusCode: 500, body: JSON.stringify(e.stack) });
  }
};

export {
  staticFiles,
  saveSubscription,
  sendPush
};
