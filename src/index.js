const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { buildCommandHandler } = require("./commands");

const APP_CONFIG_FILENAME = "app-config.yaml";

(function runRhobot() {
    const appConfig = readAppConfigFile();

    if (appConfig.status === "error") {
        console.error(`[ERROR] Unable to load the bot's token from ${APP_CONFIG_FILENAME}. Ensure you've added the file locally. Error: ` + appConfig.error);
        process.exit(1);
    }
    const { discordToken } = appConfig;

    const bot = new Discord.Client();
    bot.on("message", buildCommandHandler(appConfig));
    bot.on("ready", () => console.log("Rhobot is running."));
    bot.login(discordToken);
})();

/**
 * Attempts to read the credential YAML file.
 */
function readAppConfigFile() {
    try {
        const doc = yaml.safeLoad(fs.readFileSync(path.join(".", APP_CONFIG_FILENAME), 'utf8'));
        return { status: "success", ...doc }
    } catch (e) {
        return { status: "error", error: e };
    }
}