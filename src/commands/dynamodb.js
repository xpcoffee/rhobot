const DateTime = require("luxon").DateTime;
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

/**
 * Get functions with which to interact with a table.
 * 
 * @param {string} table - The DynamoDB table to interact with.
 * @param {string} region - The AWS region the table is in.
 */
function configure(table, region) {
    const dynamodb = new AWS.DynamoDB({ region });

    /**
     * Get all records of a type.
     * 
     * @param {string} channel - the Discord channel ID
     * @param {string} type - the database record type
     */
    function readType(channel, type) {
        const primaryKey = getPartitionKey(channel, type);
        const params = {
            TableName: table,
            ExpressionAttributeValues: {
                ":type": {
                    S: `${primaryKey}`
                }
            },
            KeyConditionExpression: `type = :type`,
        };

        return dynamodb.query(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        }).promise();
    }

    /**
     * Get a single record.
     * 
     * @param {string} identifier - the database record ID
     */
    function readItem(identifier) {
        const params = {
            TableName: table,
            Key: identifierToAttributes(identifier),
        };

        return dynamodb.getItem(params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        }).promise();
    }

    /**
     * Create a new record.
     * 
     * @param {string} channel - the discord channel ID
     * @param {string} type - the type of record
     * @param {AWS.DynamoDB.PutItemInputAttributeMap} attributes - non-key DynamoDB item attributes
     */
    function create(channel, type, attributes) {
        const identifier = createDynamoDbIdentifier(channel, type);
        const createTimeAttribute = {
            "Created": {
                S: DateTime.utc().toISO()
            }
        };

        return update(
            identifier,
            { ...attributes, ...createTimeAttribute }
        );
    }

    /**
     * Update an existing record.
     * 
     * @param {string} identifier - the database record ID
     * @param {AWS.DynamoDB.PutItemInputAttributeMap} attributes - non-key DynamoDB item attributes
     */
    function update(identifier, attributes) {
        const ddbItem = {
            ...identifierToAttributes(identifier),
            ...attributes
        };

        return dynamodb.putItem({ TableName: table, Item: ddbItem }).promise();
    }

    /**
     * Creates a new unique identifier for the item to place in DynamoDB.
     * 
     * The DynamoDB table structure has a super generic format:
     *  - primary key: a combination of channel and type-identifier
     *  - sort key: a uuid
     * 
     * There are several motivations for this:
     * access pattern is not expected to cross Discord channels;
     * The access pattern is mainly expected to be on individual items. Item type + uuid allows precise queries for those items.
     * Access pattern for multiple items is expected to be for items in the same type (e.g. listing all events).
     * Access patterns along user lines are not expected, so keying on user isn't required for every item.
     * 
     * @param {string} channel - The identifier of the Discord channel.
     * @param {string} type - The type of the item (e.g. "event").
     */
    function createDynamoDbIdentifier(channel, type) {
        const uuid = uuidv4();
        return `${getPartitionKey(channel, type)}#${uuid}`;
    }

    function getPartitionKey(channel, type) {
        return `${channel}${type}`;
    }

    function identifierToAttributes(identifier) {
        const [partitionKey, sortKey] = identifier.split("#");
        return {
            "type": {
                "S": partitionKey
            },
            "uuid": {
                "S": sortKey
            }
        };
    }

    return {
        create,
        update,
        readItem,
        readType
    };
}

module.exports = { configure };