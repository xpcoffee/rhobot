const lockdownCommand = require("./lockdown");
const aboutCommand = require("./about");
const buildSteamCommand = require("./steam");
const buildSc2Command = require("./starcraft2");

/**
 * Parses a Discord message and triggers the appropriate command if the message contains a command.
 * @param {Message} The Discord message 
 */
function buildCommandHandler(credentials) {
    const { steamApiKey, battlenetClientKey, battlenetClientSecret } = credentials;

    const helpCommand = {
        run: message => {
            const helpText = Object.keys(COMMANDS).map(command => `**${command}** - ${COMMANDS[command].help}`).join("\r");
            message.channel.send("Trigger commands using **!command**. Here's a list of available commands:\r\r" + helpText);
        },
        help: "This command."
    };

    const COMMAND_PREFIX = "!";
    const COMMANDS = {
        lockdown: lockdownCommand,
        about: aboutCommand,
        steam: buildSteamCommand(COMMAND_PREFIX, steamApiKey),
        sc2: buildSc2Command(COMMAND_PREFIX, battlenetClientKey, battlenetClientSecret),
        help: helpCommand,
    }

    return function extractAndRunCommand(message) {
        if (!message.content.startsWith(COMMAND_PREFIX)) {
            return;
        }
        const [command, ...params] = message.content.substring(COMMAND_PREFIX.length).split(" ");

        const unknownCommand = {
            run: () => {
                message.reply(`Unknown command '${command}'. Type '${COMMAND_PREFIX}help' for a list of available commands.`)
            }
        };

        try {
            (COMMANDS[command] || unknownCommand).run(message, params);
        } catch (e) {
            message.reply("[ERROR] Something went wrong with your command. Reach out to the bot admin if these errors continue.")
            console.error(e);
        }
    }
}

module.exports = { buildCommandHandler };