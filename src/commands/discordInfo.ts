import * as Discord from "discord.js";
import { RhobotCommand } from ".";

/**
 * Replies with the calling Discord user's information.
 */
export const discordInfoCommand: RhobotCommand = {
  run: (message) => {
    message.channel.send(formatUserSummary(message.author));
  },
  help: "Show your Discord user info.",
};

/**
 * Return a message embed of the Discord user's information.
 *
 * @param {Object} playerSummary - The player summary object returned from the API.
 */
function formatUserSummary(user: Discord.User) {
  function orUnknown(maybeString) {
    return maybeString || "Unkown";
  }

  const embed = new Discord.MessageEmbed();
  embed.setTitle("Discord user information");
  embed.addFields([
    { name: "Username", value: orUnknown(user.username) },
    { name: "Active since", value: orUnknown(user.createdAt.toISOString()) },
  ]);

  embed.setThumbnail(user.avatarURL() || user.defaultAvatarURL);

  embed.setFooter(`ID: ${orUnknown(user.id)}`);
  return embed;
}
