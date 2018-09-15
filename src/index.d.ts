export class WebPushError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly headers: Headers;
  public readonly body: string;
  public readonly endpoint: string;

  constructor(
    message: string,
    statusCode: number,
    headers: Headers,
    body: string,
    endpoint: string
  );
}

export type ContentEncoding = 'aesgcm' | 'aes128gcm';

export const supportedContentEncodings: {
  readonly AES_GCM: 'aesgcm';
  readonly AES_128_GCM: 'aes128gcm';
};

interface EncyptionResult {
  localPublicKey: string;
  salt: string;
  cipherText: Buffer;
}

export function encrypt(userPublicKey: string, userAuth: string, payload: string | Buffer, contentEncoding: ContentEncoding): EncyptionResult;

interface Headers {
  [header: string]: string;
}

interface VapidDetails {
  subject: string;
  publicKey: string;
  privateKey: string;
}

/**
 * This method takes the required VAPID parameters and returns the required
 * header to be added to a Web Push Protocol Request.
 * @param  {string} audience        This must be the origin of the push service.
 * @param  {string} subject         This should be a URL or a 'mailto:' email
 * address.
 * @param  {Buffer} publicKey       The VAPID public key.
 * @param  {Buffer} privateKey      The VAPID private key.
 * @param  {string} contentEncoding The contentEncoding type.
 * @param  {integer} [expiration]   The expiration of the VAPID JWT.
 * @return {Object}                 Returns an Object with the Authorization and
 * 'Crypto-Key' values to be used as headers.
 */
export function getVapidHeaders(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string,
  contentEncoding: ContentEncoding,
  expiration?: number
): Headers;

export function generateVAPIDKeys(): {
  publicKey: string;
  privateKey: string;
};

export function setGCMAPIKey(): void;

export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;

interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface RequestOptions {
  headers?: Headers;
  gcmAPIKey?: string;
  vapidDetails?: VapidDetails;
  TTL?: number;
  contentEncoding?: ContentEncoding;
  proxy?: string;
}

interface RequestDetails {
  method: 'POST';
  headers: Headers;
  body: string;
  endpoint: string;
  proxy?: string;
}

export function generateRequestDetails(subscription: PushSubscription, payload: string, options?: RequestOptions): RequestDetails;

interface SendResult {
  statusCode: number;
  body: string;
  headers: Headers;
}

export function sendNotification(subscription: PushSubscription, payload: string, options?: RequestOptions): Promise<SendResult>;
