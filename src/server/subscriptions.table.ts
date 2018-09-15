import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid/v4';
import DocumentClient = DynamoDB.DocumentClient;
import { UserSubscription } from './user-subscription';

const docClient = new DynamoDB.DocumentClient();
const TABLE_NAME = 'simple-push-server.subscriptions';

export function put(subscription: UserSubscription): Promise<string> {
  const id = subscription.id || uuid();
  const item = {
    id,
    ...subscription
  };

  return new Promise((resolve, reject) => {

    const itemToInsert: DocumentClient.PutItemInput = {
      TableName: TABLE_NAME,
      Item: item
    };

    console.log('Putting:', itemToInsert);

    docClient.put(itemToInsert, (error) => {
      console.log('Finished inserting' + (error ? ' with error' : ''), error);
      if (error) {
        reject(error);
      } else {
        resolve(item.id);
      }
    });
  })
}

export function getAll(): Promise<UserSubscription[]> {
  return new Promise((resolve, reject) => {
    const params: DocumentClient.ScanInput = {
      TableName: TABLE_NAME
    };

    docClient.scan(params, onScan);

    let allItems: UserSubscription[] = [];

    function onScan(err: any, data: DocumentClient.ScanOutput) {
      if (err) {
        console.error('Unable to scan the table. Error JSON:', JSON.stringify(err, null, 2));
        reject(err);
      } else {
        // print all the movies
        console.log('Scan succeeded.');
        allItems = allItems.concat(data.Items as UserSubscription[]);

        // continue scanning if we have more movies, because
        // scan can retrieve a maximum of 1MB of data
        if (typeof data.LastEvaluatedKey !== 'undefined') {
          console.log('Scanning for more...');
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          docClient.scan(params, onScan);
        } else {
          resolve(allItems);
        }
      }
    }
  });
}

export function remove(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const itemToDelete: DocumentClient.DeleteItemInput = {
      TableName: TABLE_NAME,
      Key: { id: key }
    };

    console.log('Deleting:', key);

    docClient.delete(itemToDelete, (error) => {
      console.log('Finished deleting' + (error ? ' with error' : ''), error);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
