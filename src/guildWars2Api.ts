import * as Discord from "discord.js";
import { AppConfig } from "./appConfig";

export const USERID_KEY_ARRAY_DELIMITER = ",";
export const USERID_KEY_DELIMITER = ":";
export function getApiKey(discordUser: Discord.User, appConfig: AppConfig): string | undefined {
  const userKeys = appConfig.guildWars2ApiKeys.split(USERID_KEY_ARRAY_DELIMITER);
  for (const userKey of userKeys) {
    const [userId, apiKey] = userKey.split(USERID_KEY_DELIMITER);

    if (discordUser.id === userId) {
      return apiKey;
    }
  }

  return undefined;
}
