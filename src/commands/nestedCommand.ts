import { MessageEmbed } from "discord.js";
import { RhobotCommand } from ".";


/**
 * Builds the root command capable of running subcommands.
 * 
 * @param {string} prefix - The bot command prefix
 * @param {string} name - The subcommand name
 * @param {string} helpText - The subcommand help text
 * @param {RhobotCommandMap} commands - Object of commands excluding the help command
 */
export const buildNestedCommand = (prefix: string, name: string, helpText: string, commands: RhobotCommandMap): RhobotCommand => {
    const helpCommand: RhobotCommand = {
        run: message => {
            const embed = new MessageEmbed()
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

interface RhobotCommandMap {
    [commandName: string]: RhobotCommand;
}

export function formatErrors(errors) {
    return `[ERROR] Could not successfully execute command:\n\n` +
        errors.map(error => ` - ${error}`).join("\n");
}