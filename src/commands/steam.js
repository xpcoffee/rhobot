const fetch = require("node-fetch");
const DateTime = require("luxon").DateTime;
const Discord = require('discord.js');
const { buildCommand: buildNestedCommand, formatErrors } = require("./nestedCommand");

/**
 * Builds the nested Steam command.
 * 
 * @param {string} prefix - The command string prefix that a user needs to type before this one.
 * @param {string} steamApiKey - The API key needed to call the Steam API.
 */
const buildCommand = (prefix, steamApiKey) => {
    const commands = {
        getUser: buildGetUserCommand(steamApiKey),
    };
    return buildNestedCommand(prefix, "steam", "Surface Steam information.", commands);
}

/**
 * Returns information on a Steam user. Can resolve either the 17-digit SteamId or the users's vanity name.
 * 
 * @param {string} steamApiKey - The API key needed to call the Steam API.
 */
function buildGetUserCommand(steamApiKey) {
    async function resolveVanityURL({ vanityName }) {
        const { response } = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${vanityName}`)
            .then(res => res.json());

        if (response && response.steamid) {
            return { steamId: response.steamid }
        }

        throw `Unable to resolve a SteamId for vanity name ${vanityName}`;
    }

    async function getPlayerSummary({ steamId }) {
        const { response } = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`)
            .then(res => res.json());

        if (response && response.players && response.players.length) {
            return { playerSummary: response.players[0] };
        }

        throw `No player found with Steam ID ${steamId}`;
    }

    return {
        run: (message, parameters) => {
            const { errors, userId, vanity, help } = parseGetUserParams(parameters);

            if (errors.length > 0) {
                message.reply(formatErrors(errors));
                return;
            }

            if (help) {
                message.reply("```\r"
                    + "Usage\r\r"
                    + "getUser --user-id USER_ID | --vanity VANITY_NAME\r\r"
                    + "Options:\r"
                    + "--user-id   The Steam ID for the user.\r"
                    + "--vanity    The vanity name ID for the user.\r"
                    + "--help      This command."
                    + "```");
                return;
            }

            let summaryPromise;
            if (userId) {
                summaryPromise = getPlayerSummary({ steamId: userId });
            } else {
                summaryPromise = resolveVanityURL({ vanityName: vanity })
                    .then(getPlayerSummary);
            }

            return summaryPromise
                .then(formatPlayerSummary)
                .then(summary => message.channel.send(summary))
                .catch(error => message.reply("Unable to fetch Steam player summary: " + error));
        },
        help: "Show information on a steam user."
    };
}


/**
 * Parses and validates parameters for the getUser subcommand.
 * 
 * @param {string[]} parameters - the subcommand parameters.
 */
function parseGetUserParams(parameters) {
    const result = parseParameters(parameters);

    if (Object.keys(result).length === 1) { // "errors" will always be there
        result.help = true;
        return result;
    }

    if (!result.userId && !result.vanity) {
        result.errors.push('Enter either your 17-digit steam user ID using `--user-id` or your vanity URL name using `--vanity`');
    }

    return result;
}


/**
 * Pulls out known parameters for the steam command.
 * 
 * @param {string[]} parameters - the command parameters
 */
function parseParameters(parameters) {
    const result = { errors: [] };

    while (parameters.length) {
        const option = parameters.shift();
        switch (option) {
            case "--user-id":
                result.userId = parameters.shift();
                break;
            case "--vanity":
                result.vanity = parameters.shift();
                break;
            case "--help":
                result.help = true;
                break;
            default:
                result.errors.push(`Unrecognized option: ${option}`)
                break;
        }
    }

    return result;
}


/**
 * Return a markdown formatted string containing a Steam user's information.
 * 
 * @param {Object} playerSummary - The player summary object returned from the API.
 */
function formatPlayerSummary({ playerSummary }) {
    function orUnknown(maybeString) {
        return maybeString || "Unkown";
    }

    console.log(playerSummary);

    const lastOnline = playerSummary.lastlogoff && DateTime.fromSeconds(playerSummary.lastlogoff).toRelative();

    const embed = new Discord.MessageEmbed();
    embed.setTitle("Steam user profile");
    embed.addFields([
        { name: "Name", value: orUnknown(playerSummary.realname) },
        { name: "Nickname", value: orUnknown(playerSummary.personaname) },
        { name: "Last online", value: orUnknown(lastOnline) },
        { name: "Country code", value: orUnknown(playerSummary.loccountrycode) },
    ]);
    embed.setThumbnail(playerSummary.avatarfull);
    embed.setFooter(`Steam id: ${orUnknown(playerSummary.steamid)}`);
    return embed;
}


module.exports = buildCommand;