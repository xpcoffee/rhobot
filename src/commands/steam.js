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
    return {
        run: (message, parameters) => {
            fetch(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamApiKey}&vanityurl=${parameters.join(",")}`)
                .then(res => res.json())
                .then(({ response }) => {
                    fetch(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${response.steamid}`)
                        .then(res => res.json())
                        .then(json => message.channel.send(formatUserProfile(json.response.players[0])));
                });
        },
        help: "Show a steam user's profile."
    };
}

function formatUserProfile(player) {
    return `Found Steam user: **${player.personaname}**
    **Profile**: ${player.profileurl}
    **Steam ID:** ${player.steamid}
    **Last online:** ${DateTime.fromSeconds(player.lastlogoff).toISO()}
    **Country code:** ${player.loccountrycode}
    **Name:** ${player.realname}`
}


module.exports = buildCommand;