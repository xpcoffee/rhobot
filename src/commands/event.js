const buildNestedCommand = require("./nestedCommand");
const { configure: configureDynamoDB } = require("./dynamodb");
const Discord = require('discord.js');

const DATABASE_ITEM_TYPE = "event";

/**
 * Builds the Event command.
 * 
 * This allows users to create events, which other users can sign up for.
 * 
 * @param {string} prefix - The command string prefix that a user needs to type before this one.
 * @param {string} steamApiKey - The API key needed to call the Steam API.
 */
const buildCommand = (prefix, ddbTable, ddbRegion) => {
    const ddb = configureDynamoDB(ddbTable, ddbRegion);

    const commands = {
        create: buildCreateCommand(),
    };
    return buildNestedCommand(prefix, "event", "Create and manage events.", commands);

    function buildCreateCommand() {
        return {
            run: (message, parameters) => {
                const result = parseCreateEventParams(parameters);
                if (result.errors.length > 0) {
                    message.reply(formatErrors(result.errors));
                    return;
                }

                const channelId = message.channel.id;

                ddb.create(channelId, DATABASE_ITEM_TYPE, { "Title": { S: result.title } })
                    .then(res => message.reply(res))
                    .catch(reason => message.reply('[ERROR] Unable to create new event:' + reason));
            },
            help: "Create a new event."
        };
    }

}


function formatErrors(errors) {
    return `[ERROR] Could not successfully execute command:\n\n` +
        errors.map(error => ` - ${error}`).join("\n");
}

function parseCreateEventParams(parameters) {
    const result = parseParameters(parameters);

    if (!result.title) {
        result.errors.push('Event title must be specified with `--title`');
    }

    return result;
}

function parseParameters(parameters) {
    const result = { errors: [] };

    while (parameters.length) {
        const option = parameters.shift();
        switch (option) {
            case "--title":
                result.title = parameters.shift();
                break;
            default:
                result.errors.push(`Unrecognized option: ${option}`)
                break;
        }
    }

    return result;
}

module.exports = buildCommand;