import * as Discord from "discord.js";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { buildCommandHandler } from "./commands";
import { AppConfig } from "./commands/appConfig";

const APP_CONFIG_FILENAME = "app-config.yaml";

(function runRhobot() {
  const appConfig = readAppConfigFile();

  if (appConfig.status === "error") {
    console.error(
      `[ERROR] Unable to load the bot's token from ${APP_CONFIG_FILENAME}. ` +
        "Ensure you've added the file locally. Error:" +
        appConfig.error
    );
    process.exit(1);
  }
  const { discordToken } = appConfig;

  const bot = new Discord.Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
  });
  bot.on("message", buildCommandHandler(appConfig));
  bot.on("ready", () => console.log("Rhobot is running."));
  bot.login(discordToken);
})();

/**
 * Attempts to read the credential YAML file.
 */
function readAppConfigFile(): ReadResult {
  try {
    const doc = yaml.safeLoad(fs.readFileSync(path.join(".", APP_CONFIG_FILENAME), "utf8")) as AppConfig;
    return { status: "success", ...doc };
  } catch (e) {
    return { status: "error", error: e };
  }
}

type ReadResult = ReadSuccess | ReadFailure;
interface ReadSuccess extends AppConfig {
  status: "success";
}
interface ReadFailure {
  status: "error";
  error: unknown;
}
