const AWS = require('aws-sdk');

/**
 * Get functions with which to interact with a table.
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
    function readItem(channel, type, attributes) {
        const params = {
            TableName: table,
            Key: {
                ...getPartitionKeyAttribute(channel, type),
                uuid: attributes.uuid,
            },
        };

        return dynamodb.getItem(params).promise();
    }

    /**
     * Create/update an existing record.
     * 
     * @param {string} identifier - the database record ID
     * @param {AWS.DynamoDB.PutItemInputAttributeMap} attributes - non-key DynamoDB item attributes
     */
    function put(channel, type, attributes) {
        const ddbItem = {
            ...getPartitionKeyAttribute(channel, type),
            ...attributes
        };

        return dynamodb.putItem({ TableName: table, Item: ddbItem }).promise();
    }

    function getPartitionKeyAttribute(channel, type) {
        return {
            "type": {
                "S": `${channel}${type}`
            },
        }
    }

    return {
        put,
        readItem,
        readType
    };
}

module.exports = { configure };