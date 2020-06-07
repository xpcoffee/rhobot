const buildNestedCommand = require("./nestedCommand");
const RhobotDynamoDB = require("./dynamodb").RhobotDynamoDB;
const Discord = require('discord.js');
const DateTime = require('luxon').DateTime;


/**
 * Builds the Event command.
 * 
 * This allows users to create events, which other users can sign up for.
 * 
 * @param {string} prefix - the command prefix (everything that comes before this command)
 * @param {string} ddbTable - the DynamoDB table that stores events
 * @param {string} ddbRegion - the AWS region in which the DynamoDB table resides
 */
const buildCommand = (prefix, ddbTable, ddbRegion) => {
    const dao = new EventDao(ddbTable, ddbRegion);

    const commands = {
        create: buildCreateCommand(dao),
    };
    return buildNestedCommand(prefix, "event", "Create and manage events.", commands);
}

/**
 * Command that can create a new event.
 * 
 * @param {EventDao} dao - an instance of Event DAO
 */
function buildCreateCommand(dao) {
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
            const event = new Event({
                id: uuid,
                title,
                startTime,
                createdBy: message.author.username,
                maxParticipants,
                created: DateTime.utc().toISO()
            });


            dao.updateEvent(channelId, event)
                .then(() => message.channel.send(event.formatLoading()))
                .then(
                    function updateMessageWithEventDetails(message) {
                        dao.readEvent(channelId, event.id)
                            .then(event => {
                                message.edit(event.format());
                                // Add default reactions which users can use to join
                                message.react('✅');
                                message.react('🚫');
                            })
                            .catch(error => message.edit("Issue reading event " + event.id + ": " + error));
                    }
                )
                .catch(reason => message.reply('[ERROR] Unable to create new event:' + reason));
        },
        help: "Create a new event."
    };
}


function formatErrors(errors) {
    return `[ERROR] Could not successfully execute command:\n\n` +
        errors.map(error => ` - ${error}`).join("\n");
}

/**
 * Parses and validates parameters for the create subcommand.
 * 
 * @param {string[]} parameters - the subcommand parameters.
 */
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

    if (result.maxParticipants && isNaN(parseInt(result.maxParticipants))) {
        result.errors.push("Max participants must be an integer.");
    }

    return result;
}

/**
 * Pulls out known parameters for the event command.
 * 
 * @param {string[]} parameters - the command parameters
 */
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

class EventDao {
    static DATABASE_ITEM_TYPE = "event";
    ddb;

    /**
     * Data access object for Events.
     * 
     * @param {string} ddbTable - the DynamoDB table that stores events
     * @param {string} ddbRegion - the AWS region in which the DynamoDB table resides
     */
    constructor(ddbTable, ddbRegion) {
        this.ddb = new RhobotDynamoDB(ddbTable, ddbRegion);
    }

    /**
     * Save an event to DynamoDB.
     * 
     * @param {Event} event 
     * @return {Promise<string>} id - the ID of the committed record
     */
    updateEvent(channelId, event) {
        const attributes = EventDao.eventToAttributes(event);
        return this.ddb.put(channelId, EventDao.DATABASE_ITEM_TYPE, attributes)
            .then(() => event.id);
    }

    /**
     * Read an event from DynamoDB.
     * 
     * @param {string} channelId - the Discord channel ID
     * @param {string} id - the event identifier
     * @return {Promise<Event>} result - the event read from DynamoDB
     */
    readEvent(channelId, id) {
        return this.ddb.readItem(channelId, EventDao.DATABASE_ITEM_TYPE, id)
            .then(result => EventDao.attributesToEvent(result.Item));
    }

    /**
     * Transform an event object into DynamoDB item attributes.
     * 
     * @param {Event} event - the event object
     * @returns {AWS.DynamoDB.AttributeMap}
     */
    static eventToAttributes({ id, title, startTime, createdBy, created, maxParticipants }) {
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

    /**
     * Transform DynamoDB item attributes into an Event object.
     * 
     * @param {AWS.DynamoDB.AttributeMap} attributes - DynamoDB item attributes
     * @returns the corresponding Event object
     */
    static attributesToEvent({ uuid, Title, StartTime, CreatedBy, Created, MaxParticipants }) {
        const params = {
            id: uuid.S,
            title: Title.S,
            startTime: StartTime.S,
            createdBy: CreatedBy.S,
            created: Created.S
        };

        if (MaxParticipants) {
            params.maxParticipants = MaxParticipants.N;
        }

        return new Event(params);
    }
}

class Event {
    id;
    title;
    startTime;
    createdBy;
    created;
    maxParticipants;

    /**
     * Models an event.
     * 
     * @param {string} id - the unique ID of the event
     * @param {string} title - the event title
     * @param {string} startTime - the event start time (ISO-8601 string)
     * @param {string} createdBy - name of user who created the event
     * @param {string} created - the time at which the event was created (ISO-8601 string)
     * @param {string} maxParticipants - the maximum number of participants
     */
    constructor({ id, title, startTime, createdBy, created, maxParticipants }) {
        this.id = id;
        this.title = title;
        this.startTime = startTime;
        this.createdBy = createdBy;
        this.created = created;
        this.maxParticipants = maxParticipants;
    }

    format() {
        try {
            const embed = new Discord.MessageEmbed()
                .setTitle("Event: " + this.title)
                .addField("Start time", formatDate(this.startTime))
                .addField("Create time", formatDate(this.created))
                .addField("Created by", this.createdBy)
                .setFooter(`id: ${this.id}`);

            if (this.maxParticipants) {
                embed.addField("Max participants", this.maxParticipants);
            }
            return embed;

        } catch (err) {
            return new Discord.MessageEmbed()
                .setTitle("Error formatting event")
                .setDescription("If this persists, please reach out to the bot admin.")
                .addField("Error", err.trace);
        }
    }

    formatLoading() {
        const embed = new Discord.MessageEmbed()
            .setTitle(this.title)
            .setDescription(this.id)
            .setFooter("Loading event...");
        return embed;
    }
}

function formatDate(dateStr) {
    // TODO: make the timezone configurable
    const timezone = "UTC+2";
    return DateTime.fromISO(dateStr).setZone(timezone).toFormat(`HH:mm EEEE yyyy-MM-dd `) + timezone;
}

module.exports = buildCommand;
