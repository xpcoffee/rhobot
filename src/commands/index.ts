const lockdownCommand = require("./lockdown");
const aboutCommand = require("./about");
const buildSteamCommand = require("./steam");
const buildSc2Command = require("./starcraft2");
const buildEventCommand = require("./event");
import { Message, MessageEmbed } from 'discord.js';
import { AppConfig } from './appConfig';

/**
 * The basic form of a Rhobot command. 
 * 
 * Takes in a Discord Message and parameters and does some work.
 */
export interface RhobotCommand {
    run: (message: Message, parameters: string[]) => void,
    help: string
}

/**
 * Parses a Discord message and triggers the appropriate command if the message contains a command.
 */
export function buildCommandHandler(appConfig: AppConfig) {
    const { steamApiKey, battlenetClientKey, battlenetClientSecret, dynamodbTable, dynamodbRegion, commandPrefix } = appConfig;

    /**
     * The overall help command.
     */
    const helpCommand: RhobotCommand = {
        run: message => {
            const embed = new MessageEmbed()
                .setTitle('ρbot commands')
                .setFooter(`Get help on subcommands by running ${COMMAND_PREFIX}[command] help`);

            Object.keys(COMMANDS).map(command => embed.addField(`${COMMAND_PREFIX}${command}`, COMMANDS[command].help));
            message.channel.send(embed);
        },
        help: "This command."
    };

    const COMMAND_PREFIX = commandPrefix || "!";
    const COMMANDS = {
        lockdown: lockdownCommand,
        event: buildEventCommand(COMMAND_PREFIX, dynamodbTable, dynamodbRegion),
        steam: buildSteamCommand(COMMAND_PREFIX, steamApiKey),
        sc2: buildSc2Command(COMMAND_PREFIX, battlenetClientKey, battlenetClientSecret),
        about: aboutCommand,
        help: helpCommand,
    }

    return function extractAndRunCommand(message: Message) {
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