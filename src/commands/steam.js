const fetch = require("node-fetch");
const DateTime = require("luxon").DateTime;
const buildNestedCommand = require("./nestedCommand");

/**
 * Builds the nested Steam command.
 * 
 * @param {string} prefix - The command string prefix that a user needs to type before this one.
 * @param {string} steamApiKey - The API key needed to call the Steam API.
 */
const buildCommand = (prefix, steamApiKey) => {
    const commands = {
        user: buildUserCommand(steamApiKey),
    };
    return buildNestedCommand(prefix, "steam", "Surface Steam information.", commands);
}

/**
 * Returns information on a Steam user. Can resolve either the 17-digit SteamId or the users's vanity name.
 * 
 * @param {string} steamApiKey - The API key needed to call the Steam API.
 */
function buildUserCommand(steamApiKey) {
    async function resolveVanityURL(vanityName) {
        const { response } = await fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${vanityName}`)
            .then(res => res.json());

        return response && response.steamid
            ? { type: "success", steamId: response.steamid }
            : { type: "failure", msg: `Unable to resolve a SteamId for vanity name ${vanityName}` };
    }

    async function getPlayerSummary(steamId) {
        const { response } = await fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`)
            .then(res => res.json());

        return response && response.players && response.players.length
            ? { type: "success", playerSummary: response.players[0] }
            : { type: "failure", msg: `Unable to get player summary for SteamId ${steamId}` };
    }

    async function getSteamUser(identifier) {
        let steamId;

        if (identifier.length === 17 && Number.parseInt(identifier) !== NaN) {
            steamId = identifier; // strings of 17 digits are SUPER likely to be a steam ID
        }

        if (steamId === undefined) {
            const resolveResp = await resolveVanityURL(identifier);
            if (resolveResp.type === "failure") {
                return resolveResp.msg;
            }
            steamId = resolveResp.steamId;
        }

        const playerSummaryResp = await getPlayerSummary(steamId);
        if (playerSummaryResp.type === "failure") {
            return playerSummaryResp.msg;
        }

        return formatPlayerSummary(playerSummaryResp.playerSummary);
    }

    return {
        run: (message, parameters) => {
            getSteamUser(parameters[0]).then(result => {
                message.channel.send(result);
            })
        },
        help: "Show information on a steam user."
    };
}


/**
 * Return a markdown formatted string containing a Steam user's information.
 * 
 * @param {Object} playerSummary - The player summary object returned from the API.
 */
function formatPlayerSummary(playerSummary) {
    return `Found Steam user: **${playerSummary.personaname || "Unknown"}**
    **Profile**: ${playerSummary.profileurl || "Unknown"}
    **Steam ID:** ${playerSummary.steamid || "Unknown"}
    **Last online:** ${playerSummary.lastlogoff && DateTime.fromSeconds(playerSummary.lastlogoff).toISO() || "Unknown"}
    **Country code:** ${playerSummary.loccountrycode || "Unknown"}
    **Name:** ${playerSummary.realname || "Unknown"}`
}


module.exports = buildCommand;