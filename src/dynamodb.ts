import { DynamoDB, AWSError } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";

export class RhobotDynamoDB {
  dynamodb: DynamoDB;
  tableName: string;

  /**
   * Thin wrapper around the DynamoDB client that knows about the Rhobot table format.
   *
   * The DynamoDB table structure has a super generic format:
   *  - primary key: a combination of channel and type-identifier
   *  - sort key: a uuid
   *
   * There are several motivations for this:
   * access pattern is not expected to cross Discord channels;
   * The access pattern is mainly expected to be on individual items.
   * Item type + uuid allows precise queries for those items.
   * Access pattern for multiple items is expected to be for items in the same type (e.g. listing all events).
   * Access patterns along user lines are not expected, so keying on user isn't required for every item.
   *
   *
   * @param {string} table - The DynamoDB table to interact with.
   * @param {string} region - The AWS region the table is in.
   */
  constructor(table: string, region: string) {
    this.dynamodb = new DynamoDB({ region });
    this.tableName = table;
  }

  /**
   * Get all records of a type.
   *
   * @param {string} channel - the Discord channel ID
   * @param {string} type - the database record type
   */
  readType(channel: string, type: string): AWSClientPromise<DynamoDB.QueryOutput> {
    const params = {
      TableName: this.tableName,
      ExpressionAttributeValues: { ":type": { S: `${channel}#${type}` } },
      ExpressionAttributeNames: { "#keyname": "type" },
      KeyConditionExpression: "#keyname = :type",
    };

    return this.dynamodb.query(params).promise();
  }

  /**
   * Get a single record.
   *
   * @param {string} channel - the Discord channel ID
   * @param {string} type - the database record type
   * @param {string} id - the record id
   */
  readItem(channel: string, type: string, id: string): AWSClientPromise<DynamoDB.GetItemOutput> {
    const params = {
      TableName: this.tableName,
      Key: {
        ...RhobotDynamoDB.getPartitionKeyAttribute(channel, type),
        uuid: { S: id },
      },
    };

    return this.dynamodb.getItem(params).promise();
  }

  /**
   * Create/update an existing record.
   *
   * @param {string} channel - the Discord channel
   * @param {string} type - the database record type
   * @param {AWS.DynamoDB.PutItemInputAttributeMap} attributes - non-key DynamoDB item attributes
   */
  put(
    channel: string,
    type: string,
    attributes: AWS.DynamoDB.PutItemInputAttributeMap
  ): AWSClientPromise<DynamoDB.PutItemOutput> {
    const ddbItem = {
      ...RhobotDynamoDB.getPartitionKeyAttribute(channel, type),
      ...attributes,
    };

    return this.dynamodb.putItem({ TableName: this.tableName, Item: ddbItem }).promise();
  }

  /**
   * Delete an existing record.
   *
   * @param {string} channel - the Discord channel ID
   * @param {string} type - the database record type
   * @param {string} id - the record id
   */
  delete(channel: string, type: string, id: string): AWSClientPromise<DynamoDB.DeleteItemOutput> {
    const params = {
      TableName: this.tableName,
      Key: {
        ...RhobotDynamoDB.getPartitionKeyAttribute(channel, type),
        uuid: { S: id },
      },
    };

    return this.dynamodb.deleteItem(params).promise();
  }

  // Disable linting here - the type and the return are basically the same thing.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static getPartitionKeyAttribute(channel, type) {
    return { type: { S: `${channel}#${type}` } };
  }
}

type AWSClientPromise<T> = Promise<PromiseResult<T, AWSError>>;
