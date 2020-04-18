const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { extractAndRunCommand } = require("./commands");

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