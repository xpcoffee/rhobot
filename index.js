const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const DateTime = require("luxon").DateTime;

// Add This YAML file with the Token for the bot
const CREDENTIAL_FILENAME = "creds.yaml";
const tokenResponse = readTokenFromFile();

if (tokenResponse.status === "error") {
    console.error(`[ERROR] Unable to load the bot's token from ${CREDENTIAL_FILENAME}. Ensure you've added the file locally. Error: ` + tokenResponse.error);
    process.exit(1);
}

const { token } = tokenResponse;
const bot = new Discord.Client();

const COMMAND_PREFIX = "!";
const COMMANDS = {
    greet: {
        run: message => message.channel.send("Hi there!"),
        help: "Say hi."
    },
    lockdown: {
        run: message => {
            const LOCKDOWN_DATE = DateTime.utc(2020, 03, 26, 21, 59, 59);
            const diff = DateTime.utc().diff(LOCKDOWN_DATE, ["days", "hours", "minutes", "seconds"]);
            message.channel.send(`${diff.days} days, ${diff.hours} hours, ${diff.minutes} minutes`);
        },
        help: "Show how long we've been in lockdown."
    },
    about: {
        run: message => {
            message.channel.send("Source code can be found at https://github.com/xpcoffee/rhobot");
        },
        help: "Show info about ρbot."
    },
    help: {
        run: message => {
            const helpText = Object.keys(COMMANDS).map(command => `**${command}** - ${COMMANDS[command].help}`).join("\r");
            message.channel.send("Here's a list of available commands:\r\r" + helpText);
        },
        help: "This command."
    },
}


bot.on("message", message => {
    if (!message.content.startsWith(COMMAND_PREFIX)) {
        return;
    }
    const [command, params] = message.content.substring(COMMAND_PREFIX.length).split(" ");

    const unknownCommand = {
        run: () => {
            message.reply(`Unknown command '${command}'. Type '${COMMAND_PREFIX}help' for a list of available commands.`)
        }
    };

    (COMMANDS[command] || unknownCommand).run(message);
})

bot.on("ready", () => console.log("Rhobot is running."))
bot.login(token)

function readTokenFromFile() {
    try {
        const doc = yaml.safeLoad(fs.readFileSync(path.join(".", CREDENTIAL_FILENAME), 'utf8'));
        return { status: "success", token: doc.token }
    } catch (e) {
        return { status: "error", error: e };
    }
}