const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const DateTime = require("luxon").DateTime;

(function runRhobot() {
    const credentials = readCredentialsFile();

    if (credentials.status === "error") {
        console.error(`[ERROR] Unable to load the bot's token from ${CREDENTIAL_FILENAME}. Ensure you've added the file locally. Error: ` + credentials.error);
        process.exit(1);
    }
    const { discordToken } = credentials;

    const bot = new Discord.Client();
    bot.on("message", extractAndRunCommand);
    bot.on("ready", () => console.log("Rhobot is running."));
    bot.login(discordToken);
})();

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

const greetCommand = {
    run: message => message.channel.send("Hi there!"),
    help: "Say hi."
};

const aboutCommand = {
    run: message => {
        message.channel.send("Source code can be found at https://github.com/xpcoffee/rhobot");
    },
    help: "Show info about ρbot."
}

// Return the time since the COVID-19 lockdown started in ZA.
const lockdownCommand = {
    run: message => {
        const LOCKDOWN_DATE = DateTime.utc(2020, 03, 26, 21, 59, 59);
        const diff = DateTime.utc().diff(LOCKDOWN_DATE, ["days", "hours", "minutes", "seconds"]);
        message.channel.send(`South Africa has been in COVID-19 lockdown for **${diff.days} days**, **${diff.hours} hours** and **${diff.minutes} minutes**.`);
    },
    help: "Show how long we've been in lockdown."
};

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

/**
 * Attempts to read the credential YAML file.
 */
function readCredentialsFile() {
    const CREDENTIAL_FILENAME = "creds.yaml";
    try {
        const doc = yaml.safeLoad(fs.readFileSync(path.join(".", CREDENTIAL_FILENAME), 'utf8'));
        return { status: "success", ...doc }
    } catch (e) {
        return { status: "error", error: e };
    }
}