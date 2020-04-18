const greetCommand = require("./greet");
const lockdownCommand = require("./lockdown");
const aboutCommand = require("./about");

/**
 * Parses a Discord message and triggers the appropriate command if the message contains a command.
 * @param {Message} The Discord message 
 */
function extractAndRunCommand(message) {
    if (!message.content.startsWith(COMMAND_PREFIX)) {
        return;
    }
    const [command, _params] = message.content.substring(COMMAND_PREFIX.length).split(" ");

    const unknownCommand = {
        run: () => {
            message.reply(`Unknown command '${command}'. Type '${COMMAND_PREFIX}help' for a list of available commands.`)
        }
    };

    (COMMANDS[command] || unknownCommand).run(message);
}

const helpCommand = {
    run: message => {
        const helpText = Object.keys(COMMANDS).map(command => `**${command}** - ${COMMANDS[command].help}`).join("\r");
        message.channel.send("Trigger commands using **!command**. Here's a list of available commands:\r\r" + helpText);
    },
    help: "This command."
};

const COMMAND_PREFIX = "!";
const COMMANDS = {
    greet: greetCommand,
    lockdown: lockdownCommand,
    about: aboutCommand,
    help: helpCommand,
}

module.exports = { extractAndRunCommand };