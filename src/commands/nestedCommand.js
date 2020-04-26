/**
 * Builds the root command for complex subcommands.
 * 
 * @param {string} prefix - The bot command prefix
 * @param {string} name - The subcommand name
 * @param {string} helpText - The subcommand help text (excluding the list of its own subcommands)
 * @param {function} buildSubcommands - Object of commands (excluding the help command)
 */
const buildCommand = (prefix, name, helpText, commands) => {
    const helpCommand = {
        run: message => {
            const subcommands = Object.keys(commands).map(command => `**${command}** - ${commands[command].help}`).join("\r");
            message.channel.send(`${helpText}\r\rAvailable subcommands:\r\r` + subcommands);
        },
        help: "This command."
    };
    commands.help = helpCommand;

    return {
        run: (message, parameters) => {
            const [command, ...params] = parameters;

            const unknownCommand = {
                run: () => {
                    message.reply(`Unknown ${name} subcommand '${command}'. Type '${prefix}${name} help' for a list of available commands.`)
                }
            };

            (commands[command] || unknownCommand).run(message, params);
        },
        help: `${helpText}}`
    };
}

module.exports = buildCommand;