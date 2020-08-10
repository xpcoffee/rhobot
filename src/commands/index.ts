const lockdownCommand = require("./lockdown");
const aboutCommand = require("./about");
const buildSteamCommand = require("./steam");
import { buildCommand as buildEventCommand } from "./event";
import { buildCommand as buildSc2Command } from "./starcraft2";
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
    const { steamApiKey, battlenetClientKey, battlenetClientSecret, dynamodbTable, dynamodbRegion, commandPrefix, enableEventCommand, enableSC2Command } = appConfig;

    /**
     * The overall help command.
     */
    const helpCommand: RhobotCommand = {
        run: message => {
            const embed = new MessageEmbed()
                .setTitle('ρbot commands')
                .setFooter(`Get help on subcommands by running ${COMMAND_PREFIX}[command] help`);

            Object.keys(COMMANDS)
                .filter(command => {
                    if (!COMMANDS[command]) {
                        console.error("[ERROR] Non-existent command:", command);
                        return false;
                    }
                    return true;
                })
                .map(command => embed.addField(`${COMMAND_PREFIX}${command}`, COMMANDS[command].help));
            message.channel.send(embed);
        },
        help: "This command."
    };

    /**
     * A command to use when another command is disabled.
     * 
     * Taking a current stance that we still want to show disabled commands; we can change our minds here if this proves annoying to users.
     */
    function buildDisabledCommand(commandName: string): RhobotCommand {
        console.warn("[WARN] Disabling command:", commandName);

        return {
            run: message => {
                const embed = new MessageEmbed()
                    .setTitle('Disabled')
                    .setDescription('This command has been disabled. Please reach out to the bot admin if this is unexpected.')

                message.channel.send(embed);
            },
            help: "Currently disabled."
        }
    };


    const COMMAND_PREFIX = commandPrefix || "!";
    const COMMANDS: Record<string, RhobotCommand> = {
        lockdown: lockdownCommand,
        event: buildEventCommand({ prefix: COMMAND_PREFIX, ddbTable: dynamodbTable, ddbRegion: dynamodbRegion, commandEnabled: enableEventCommand }) || buildDisabledCommand("event"),
        steam: buildSteamCommand(COMMAND_PREFIX, steamApiKey),
        sc2: buildSc2Command({ prefix: COMMAND_PREFIX, battlenetClientKey, battlenetClientSecret, commandEnabled: enableSC2Command }) || buildDisabledCommand("sc2"),
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