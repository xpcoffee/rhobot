const fetch = require("node-fetch");
const DateTime = require("luxon").DateTime;

// Returns recent steam activity for the user
const buildCommand = (steamApiKey) => {
    return {
        run: (message, parameters) => {
            const [command, ...params] = parameters;

            const unknownCommand = {
                run: () => {
                    message.reply(`Unknown steam subcommand '${command}'. Type 'steam help' for a list of available commands.`)
                }
            };

            (buildCommands(steamApiKey)[command] || unknownCommand).run(message, params);
        },
        help: "Show how long we've been in lockdown."
    };
}

function buildCommands(steamApiKey) {
    const helpCommand = {
        run: message => {
            const helpText = Object.keys(COMMANDS).map(command => `**${command}** - ${COMMANDS[command].help}`).join("\r");
            message.channel.send("Here's a list of available steam subcommands:\r\r" + helpText);
        },
        help: "This command."
    };

    const COMMANDS = {
        user: buildUserCommand(steamApiKey),
        help: helpCommand
    }

    return COMMANDS;
}

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


function formatPlayerSummary(playerSummary) {
    return `Found Steam user: **${playerSummary.personaname || "Unknown"}**
    **Profile**: ${playerSummary.profileurl || "Unknown"}
    **Steam ID:** ${playerSummary.steamid || "Unknown"}
    **Last online:** ${playerSummary.lastlogoff && DateTime.fromSeconds(playerSummary.lastlogoff).toISO() || "Unknown"}
    **Country code:** ${playerSummary.loccountrycode || "Unknown"}
    **Name:** ${playerSummary.realname || "Unknown"}`
}


module.exports = buildCommand;