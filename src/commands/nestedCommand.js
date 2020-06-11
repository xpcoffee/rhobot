const Discord = require('discord.js');

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
            const embed = new Discord.MessageEmbed()
                .setTitle(`${prefix}${name}`)
                .setDescription(helpText)

            Object.keys(commands).map(command => embed.addField(`${prefix}${name} ${command}`, commands[command].help));
            message.channel.send(embed);
        },
        help: "This command."
    };
    commands.help = helpCommand;

    return {
        run: (message, parameters) => {
            const [maybeCommand, ...params] = parameters;
            const command = maybeCommand || 'help';

            const unknownCommand = {
                run: () => {
                    message.reply(`Unknown ${name} subcommand '${command}'. Type '${prefix}${name} help' for a list of available commands.`)
                }
            };

            (commands[command] || unknownCommand).run(message, params);
        },
        help: `${helpText}`
    };
}

function formatErrors(errors) {
    return `[ERROR] Could not successfully execute command:\n\n` +
        errors.map(error => ` - ${error}`).join("\n");
}


module.exports = {
    buildCommand,
    formatErrors
};