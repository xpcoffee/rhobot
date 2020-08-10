import * as Discord from "discord.js";
import { RhobotCommand } from ".";

// Additional information about ρbot
export const aboutCommand: RhobotCommand = {
  run: (message) => {
    const embed = new Discord.MessageEmbed();
    embed.setDescription(getDescription());
    embed.setTitle("About ρbot");
    embed.setThumbnail(
      "https://cdn.discordapp.com/avatars/693789340450553877/1e0a83786f2a0fcbfa9704232ac991a1.png?size=256"
    );
    embed.addField("Repo", "https://github.com/xpcoffee/rhobot");
    embed.setFooter("Contributions welcome! ❤️");

    message.channel.send(embed);
  },
  help: "Show info about ρbot.",
};

function getDescription() {
  const puns = [
    "[ρ, ρ fight the power!](https://www.youtube.com/watch?v=0V7aUT13qtM)",
    "[ρ, ρ, ρ your bot](https://www.youtube.com/watch?v=JeCD4bIkQwg)",
    "[ρp](https://www.youtube.com/watch?v=kbpqZT_56Ns)",
    "[...then I took an aρ in the knee.](https://www.youtube.com/watch?v=3dbE4v-u0mY)",
  ];

  const index = Math.floor(Math.random() * puns.length);
  return puns[index];
}
