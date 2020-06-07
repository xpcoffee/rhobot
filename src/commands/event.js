const buildNestedCommand = require("./nestedCommand");
const { configure: configureDynamoDB } = require("./dynamodb");
const Discord = require('discord.js');
const DateTime = require('luxon').DateTime;

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
        create: buildCreateCommand(ddb),
    };
    return buildNestedCommand(prefix, "event", "Create and manage events.", commands);
}

function buildCreateCommand(ddb) {
    return {
        run: (message, parameters) => {
            const { errors, title, startTime, maxParticipants } = parseCreateEventParams(parameters);
            if (errors.length > 0) {
                message.reply(formatErrors(errors));
                return;
            }


            // Use the message's ID as the uuid - this helps makes messages idempodent if there's more than one bot listening (e.g. testing bot);
            const uuid = message.id;
            const channelId = message.channel.id;
            const event = getEvent({
                id: uuid,
                title,
                startTime,
                createdBy: message.author.username,
                maxParticipants,
                created: DateTime.utc().toISO()
            });

            const attributes = eventToAttributes(event);

            ddb.put(channelId, DATABASE_ITEM_TYPE, attributes)
                .then(() => message.channel.send(formatLoadingEvent(event)))
                .then(eventMessage => {
                    ddb.readItem(channelId, DATABASE_ITEM_TYPE, attributes)
                        .then(res => {
                            const embed = formatEvent(attributesToEvent(res.Item));
                            eventMessage.edit(embed);
                        })
                })
                .catch(reason => message.reply('[ERROR] Unable to create new event:' + reason));
        },
        help: "Create a new event."
    };
}

function getEvent({ id, title, startTime, createdBy, created, maxParticipants }) {
    const event = {
        id,
        title,
        startTime,
        createdBy,
        created
    }

    if (maxParticipants) {
        event.maxParticipants = maxParticipants;
    };

    return event;
}

function eventToAttributes({ id, title, startTime, createdBy, created, maxParticipants }) {
    const attributes = {
        "uuid": { S: id },
        "Title": { S: title },
        "StartTime": { S: startTime },
        "CreatedBy": { S: createdBy },
        "Created": { S: created }
    };

    if (maxParticipants) {
        attributes["MaxParticipants"] = { N: maxParticipants };
    };

    return attributes;
}

function attributesToEvent({ uuid, Title, StartTime, CreatedBy, Created, MaxParticipants }) {
    const event = {
        id: uuid.S,
        title: Title.S,
        startTime: StartTime.S,
        createdBy: CreatedBy.S,
        created: Created.S
    };

    if (MaxParticipants) {
        event.maxParticipants = MaxParticipants.N;
    }

    return event;
}

function formatLoadingEvent({ id, title }) {
    const embed = new Discord.MessageEmbed()
        .setTitle(title)
        .setDescription(id)
        .setFooter("Loading event...");
    return embed;
}

function formatEvent({ id, title, startTime, createdBy, created, maxParticipants }) {
    try {
        const embed = new Discord.MessageEmbed()
            .setTitle("Event: " + title)
            .addField("Start time", formatDate(startTime))
            .addField("Create time", formatDate(created))
            .addField("Created by", createdBy)
            .setFooter(`id: ${id}`);

        if (maxParticipants) {
            embed.addField("Max participants", maxParticipants);
        }
        return embed;

    } catch (err) {
        return new Discord.MessageEmbed()
            .setTitle("Error formatting event")
            .setDescription("If this persists, please reach out to the bot admin.")
            .addField("Error", err.trace);
    }
}

function formatDate(dateStr) {
    // TODO: make the timezone configurable
    const timezone = "UTC+2";
    return DateTime.fromISO(dateStr).setZone(timezone).toFormat(`HH:mm EEEE yyyy-MM-dd `) + timezone;
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

    if (!result.startTime) {
        result.errors.push('Event start time must be specified with `--startTime`');
    } else if (DateTime.fromISO(result.startTime).invalid) {
        result.errors.push("Event start time must be ISO-8601 compatible.");
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
            case "--startTime":
                result.startTime = parameters.shift();
                break;
            case "--maxParticipants":
                result.maxParticipants = parameters.shift();
                break;
            default:
                result.errors.push(`Unrecognized option: ${option}`)
                break;
        }
    }

    return result;
}

module.exports = buildCommand;